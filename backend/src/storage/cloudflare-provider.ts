import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import type { StorageProvider, CloudflareR2ProviderConfig } from './provider';

export function createCloudflareProvider(config: CloudflareR2ProviderConfig): StorageProvider {
  return new CloudflareR2StorageProvider(config);
}

export class CloudflareR2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  /** Normalised directory prefix (no leading/trailing slash, empty = no prefix) */
  private readonly directory: string;

  constructor(config: CloudflareR2ProviderConfig) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/+$/, '');
    this.directory = (config.directory ?? '').replace(/^\/+|\/+$/g, '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /** Prepend the configured directory prefix to a bucket-relative path. */
  private prefixKey(path: string): string {
    const clean = path.replace(/^\/+/, '');
    return this.directory ? `${this.directory}/${clean}` : clean;
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.prefixKey(path),
        Body: buffer,
        ContentType: contentType,
      })
    );
    return this.getPublicUrl(path);
  }

  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: this.prefixKey(path) })
    );
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    let total = 0;
    let continuationToken: string | undefined = undefined;
    const fullPrefix = this.prefixKey(prefix);

    do {
      const listResult = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: fullPrefix,
          ContinuationToken: continuationToken,
        })
      );

      const keys = (listResult.Contents ?? [])
        .map((o) => o.Key)
        .filter((k): k is string => Boolean(k));

      if (keys.length > 0) {
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
              Objects: keys.map((Key) => ({ Key })),
              Quiet: true,
            },
          })
        );
        total += keys.length;
      }

      continuationToken = listResult.IsTruncated
        ? listResult.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return total;
  }

  async list(prefix: string): Promise<Array<{ name: string; url: string; size: number }>> {
    const files: Array<{ name: string; url: string; size: number }> = [];
    let continuationToken: string | undefined = undefined;
    const fullPrefix = this.prefixKey(prefix);
    // Strip the directory prefix back off when returning names so callers see
    // bucket-relative keys (their original path), not the storage-level key.
    const stripLen = this.directory ? this.directory.length + 1 : 0;

    do {
      const listResult = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: fullPrefix,
          ContinuationToken: continuationToken,
        })
      );

      for (const obj of listResult.Contents ?? []) {
        if (!obj.Key) continue;
        const relativeName = stripLen > 0 && obj.Key.startsWith(`${this.directory}/`)
          ? obj.Key.slice(stripLen)
          : obj.Key;
        files.push({
          name: relativeName,
          url: this.getPublicUrl(relativeName),
          size: obj.Size ?? 0,
        });
      }

      continuationToken = listResult.IsTruncated
        ? listResult.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return files;
  }

  getPublicUrl(path: string): string {
    // Public URL mirrors the storage layout — include the directory prefix so
    // the returned URL resolves correctly through r2.dev / custom domain.
    return `${this.publicUrl}/${this.prefixKey(path)}`;
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        console.log(`✅ Created R2 bucket: ${this.bucket}`);
      } catch (err) {
        console.warn(
          `⚠️  Could not create R2 bucket ${this.bucket} — create it manually in the Cloudflare dashboard and configure the public URL.`,
          err
        );
      }
    }
  }

  extractObjectPath(url: string): string | null {
    if (!url) return null;
    const base = `${this.publicUrl}/`;
    if (!url.startsWith(base)) return null;
    const afterBase = url.slice(base.length);
    if (!afterBase) return null;
    // Strip directory prefix so callers get the bucket-relative path they
    // originally supplied to `upload()`.
    if (this.directory && afterBase.startsWith(`${this.directory}/`)) {
      return afterBase.slice(this.directory.length + 1) || null;
    }
    return afterBase;
  }
}
