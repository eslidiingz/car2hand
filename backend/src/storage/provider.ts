/**
 * StorageProvider — pluggable object-storage backend contract.
 *
 * Contract:
 * - `path`: bucket-relative object key (no leading slash), e.g. "<userId>/avatar/123.webp"
 * - `upload`: writes the buffer and returns the public URL.
 * - `delete`: removes a single object. Should NOT throw if the object is missing.
 * - `deleteByPrefix`: removes every object whose key starts with `prefix`. Returns count deleted.
 * - `list`: returns objects under `prefix` with bucket-absolute public URLs.
 * - `getPublicUrl`: pure — synthesizes a public URL from an object key.
 * - `ensureBucket`: idempotently creates the configured bucket if missing
 *    and applies a public-read policy. Called once on boot.
 * - `extractObjectPath`: inverse of `getPublicUrl`. Returns null if the URL
 *    does not belong to this provider's public base.
 *
 * Providers must be stateless aside from their SDK client. Image processing
 * (sharp/WebP) stays in `storage.ts` and is provider-agnostic.
 */

export interface StorageProvider {
  upload(path: string, buffer: Buffer, contentType: string): Promise<string>;
  delete(path: string): Promise<void>;
  deleteByPrefix(prefix: string): Promise<number>;
  list(prefix: string): Promise<Array<{ name: string; url: string; size: number }>>;
  getPublicUrl(path: string): string;
  ensureBucket(): Promise<void>;
  extractObjectPath(url: string): string | null;
}

export type StorageProviderType = 'MINIO' | 'CLOUDFLARE_R2';

export interface MinioProviderConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface CloudflareR2ProviderConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

export type StorageProviderConfig = MinioProviderConfig | CloudflareR2ProviderConfig;
