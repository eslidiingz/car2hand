import * as Minio from 'minio';
import type { StorageProvider, MinioProviderConfig } from './provider';

export class MinioStorageProvider implements StorageProvider {
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;

  constructor(config: MinioProviderConfig) {
    this.endpoint = config.endpoint;
    this.port = config.port;
    this.useSSL = config.useSSL;
    this.bucket = config.bucket;

    this.client = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  async upload(path: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.putObject(this.bucket, path, buffer, buffer.length, {
      'Content-Type': contentType,
    });
    return this.getPublicUrl(path);
  }

  async delete(path: string): Promise<void> {
    await this.client.removeObject(this.bucket, path);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    const objects: string[] = [];
    const stream = this.client.listObjects(this.bucket, prefix, true);

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) objects.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', async () => {
        if (objects.length === 0) {
          resolve(0);
          return;
        }
        try {
          await this.client.removeObjects(this.bucket, objects);
          resolve(objects.length);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async list(prefix: string): Promise<Array<{ name: string; url: string; size: number }>> {
    const files: Array<{ name: string; url: string; size: number }> = [];
    const stream = this.client.listObjects(this.bucket, prefix, true);

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          files.push({
            name: obj.name,
            url: this.getPublicUrl(obj.name),
            size: obj.size || 0,
          });
        }
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(files));
    });
  }

  getPublicUrl(path: string): string {
    const protocol = this.useSSL ? 'https' : 'http';
    return `${protocol}://${this.endpoint}:${this.port}/${this.bucket}/${path}`;
  }

  async ensureBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
      console.log(`✅ Created bucket: ${this.bucket}`);
    }
  }

  extractObjectPath(url: string): string | null {
    if (!url) return null;
    const bucketStr = `/${this.bucket}/`;
    if (!url.includes(bucketStr)) return null;
    const split = url.split(bucketStr);
    return split[1] || null;
  }
}
