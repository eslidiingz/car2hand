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

export class CloudflareR2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: CloudflareR2ProviderConfig) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/+$/, '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return this.getPublicUrl(path);
  }

  async delete(path: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: path })
    );
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    let total = 0;
    let continuationToken: string | undefined = undefined;

    do {
      const listResult = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
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

    do {
      const listResult = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      );

      for (const obj of listResult.Contents ?? []) {
        if (!obj.Key) continue;
        files.push({
          name: obj.Key,
          url: this.getPublicUrl(obj.Key),
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
    return `${this.publicUrl}/${path}`;
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
    return url.slice(base.length) || null;
  }
}
