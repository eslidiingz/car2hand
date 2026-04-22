-- AlterTable: make fuelType optional on vehicle_listings
ALTER TABLE "vehicle_listings" ALTER COLUMN "fuelType" DROP NOT NULL;
