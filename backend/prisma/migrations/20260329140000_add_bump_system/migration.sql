-- AlterTable: Add manualBumpPerDay to packages
ALTER TABLE "packages" ADD COLUMN "manualBumpPerDay" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add bumpedAt to vehicle_listings
ALTER TABLE "vehicle_listings" ADD COLUMN "bumpedAt" TIMESTAMP(3);

-- CreateTable: listing_bump_logs
CREATE TABLE "listing_bump_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "listing_bump_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_bump_logs_listingId_createdAt_idx" ON "listing_bump_logs"("listingId", "createdAt");
CREATE INDEX "listing_bump_logs_userId_createdAt_idx" ON "listing_bump_logs"("userId", "createdAt");
CREATE INDEX "vehicle_listings_bumpedAt_idx" ON "vehicle_listings"("bumpedAt");

-- AddForeignKey
ALTER TABLE "listing_bump_logs" ADD CONSTRAINT "listing_bump_logs_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "vehicle_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_bump_logs" ADD CONSTRAINT "listing_bump_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update package manualBumpPerDay values
UPDATE packages SET "manualBumpPerDay" = 1 WHERE slug = 'basic';
UPDATE packages SET "manualBumpPerDay" = 1 WHERE slug = 'standard';
UPDATE packages SET "manualBumpPerDay" = 3 WHERE slug = 'professional';
UPDATE packages SET "manualBumpPerDay" = 5 WHERE slug = 'premium';
