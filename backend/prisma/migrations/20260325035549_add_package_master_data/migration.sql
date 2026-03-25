/*
  Warnings:

  - You are about to drop the column `packageType` on the `package_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `currentPackage` on the `users` table. All the data in the column will be lost.
  - Added the required column `packageId` to the `package_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "package_transactions" DROP COLUMN "packageType",
ADD COLUMN     "packageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currentPackage",
ADD COLUMN     "currentPackageId" TEXT;

-- DropEnum
DROP TYPE "PackageType";

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "targetAudience" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "maxListings" INTEGER NOT NULL,
    "maxPhotosPerListing" INTEGER NOT NULL,
    "listingDurationDays" INTEGER NOT NULL,
    "autoBumpPerDay" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "searchPriority" TEXT NOT NULL DEFAULT 'normal',
    "features" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "packages_name_key" ON "packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- CreateIndex
CREATE INDEX "packages_sortOrder_idx" ON "packages"("sortOrder");

-- CreateIndex
CREATE INDEX "package_transactions_packageId_idx" ON "package_transactions"("packageId");

-- CreateIndex
CREATE INDEX "users_currentPackageId_idx" ON "users"("currentPackageId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentPackageId_fkey" FOREIGN KEY ("currentPackageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_transactions" ADD CONSTRAINT "package_transactions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
