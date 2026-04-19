-- Add PAUSED to ListingStatus enum
ALTER TYPE "ListingStatus" ADD VALUE IF NOT EXISTS 'PAUSED';

-- Add pause-tracking fields to vehicle_listings
ALTER TABLE "vehicle_listings"
  ADD COLUMN IF NOT EXISTS "pausedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "remainingDays" INTEGER;

-- Update Dealer package: no-expiry (-1) → 180 days
UPDATE "packages" SET "listingDurationDays" = 180 WHERE "slug" = 'premium' AND "listingDurationDays" = -1;
