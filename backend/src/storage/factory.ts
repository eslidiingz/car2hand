import prisma from '../db';
import { MinioStorageProvider } from './minio-provider';
import { CloudflareR2StorageProvider } from './cloudflare-provider';
import type {
  StorageProvider,
  StorageProviderType,
  MinioProviderConfig,
  CloudflareR2ProviderConfig,
} from './provider';

let cached: { provider: StorageProvider; type: StorageProviderType } | null = null;

function envMinioConfig(): MinioProviderConfig {
  return {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'uploads',
  };
}

function envCloudflareConfig(): CloudflareR2ProviderConfig {
  return {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucket: process.env.CLOUDFLARE_R2_BUCKET || '',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
  };
}

function mergeMinioConfig(raw: Record<string, unknown>): MinioProviderConfig {
  const base = envMinioConfig();
  return {
    endpoint: typeof raw.endpoint === 'string' && raw.endpoint ? raw.endpoint : base.endpoint,
    port: typeof raw.port === 'number' ? raw.port : base.port,
    useSSL: typeof raw.useSSL === 'boolean' ? raw.useSSL : base.useSSL,
    accessKey: typeof raw.accessKey === 'string' && raw.accessKey ? raw.accessKey : base.accessKey,
    secretKey: typeof raw.secretKey === 'string' && raw.secretKey ? raw.secretKey : base.secretKey,
    bucket: typeof raw.bucket === 'string' && raw.bucket ? raw.bucket : base.bucket,
  };
}

function mergeCloudflareConfig(raw: Record<string, unknown>): CloudflareR2ProviderConfig {
  const base = envCloudflareConfig();
  return {
    endpoint: typeof raw.endpoint === 'string' && raw.endpoint ? raw.endpoint : base.endpoint,
    accessKeyId: typeof raw.accessKeyId === 'string' && raw.accessKeyId ? raw.accessKeyId : base.accessKeyId,
    secretAccessKey:
      typeof raw.secretAccessKey === 'string' && raw.secretAccessKey
        ? raw.secretAccessKey
        : base.secretAccessKey,
    bucket: typeof raw.bucket === 'string' && raw.bucket ? raw.bucket : base.bucket,
    publicUrl: typeof raw.publicUrl === 'string' && raw.publicUrl ? raw.publicUrl : base.publicUrl,
  };
}

export function getProviderByType(
  type: StorageProviderType,
  rawConfig?: Record<string, unknown>
): StorageProvider {
  const cfg = rawConfig ?? {};
  if (type === 'CLOUDFLARE_R2') {
    return new CloudflareR2StorageProvider(mergeCloudflareConfig(cfg));
  }
  return new MinioStorageProvider(mergeMinioConfig(cfg));
}

export async function getActiveProvider(): Promise<StorageProvider> {
  if (cached) return cached.provider;

  const setting = await prisma.storageSetting.findFirst({
    orderBy: { updatedAt: 'desc' },
  });

  const type: StorageProviderType = (setting?.provider as StorageProviderType) || 'MINIO';
  const raw = (setting?.config as Record<string, unknown> | null) ?? {};
  const provider = getProviderByType(type, raw);
  cached = { provider, type };
  return provider;
}

export function invalidateActiveProvider(): void {
  cached = null;
}

export async function ensureStorageSettingSeeded(): Promise<void> {
  const existing = await prisma.storageSetting.findFirst();
  if (existing) return;
  await prisma.storageSetting.create({
    data: {
      provider: 'MINIO',
      config: {},
    },
  });
}
