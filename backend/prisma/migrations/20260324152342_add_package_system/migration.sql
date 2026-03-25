/*
  Warnings:

  - You are about to drop the column `negotiable` on the `vehicle_listings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('BASIC', 'STANDARD', 'PROFESSIONAL', 'PREMIUM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentPackage" "PackageType" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "packageExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vehicle_listings" DROP COLUMN "negotiable";

-- CreateTable
CREATE TABLE "package_transactions" (
    "id" TEXT NOT NULL,
    "packageType" "PackageType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "slipImage" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "package_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_transactions_userId_idx" ON "package_transactions"("userId");

-- CreateIndex
CREATE INDEX "package_transactions_status_idx" ON "package_transactions"("status");

-- CreateIndex
CREATE INDEX "package_transactions_createdAt_idx" ON "package_transactions"("createdAt");

-- AddForeignKey
ALTER TABLE "package_transactions" ADD CONSTRAINT "package_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
