-- CreateEnum
CREATE TYPE "StorageProviderType" AS ENUM ('MINIO', 'CLOUDFLARE_R2');

-- CreateTable
CREATE TABLE "storage_settings" (
    "id" TEXT NOT NULL,
    "provider" "StorageProviderType" NOT NULL DEFAULT 'MINIO',
    "config" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "storage_settings_pkey" PRIMARY KEY ("id")
);
