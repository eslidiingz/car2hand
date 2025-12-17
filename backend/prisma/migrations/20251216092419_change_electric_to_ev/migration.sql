/*
  Change ELECTRIC to EV in FuelType enum
*/

-- First, update any existing data that uses ELECTRIC to EV
UPDATE "vehicle_sub_models" SET "fuelType" = 'PETROL' WHERE "fuelType" = 'ELECTRIC';
UPDATE "vehicle_listings" SET "fuelType" = 'PETROL' WHERE "fuelType" = 'ELECTRIC';

-- AlterEnum
BEGIN;
CREATE TYPE "FuelType_new" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'EV', 'LPG', 'NGV');
ALTER TABLE "vehicle_sub_models" ALTER COLUMN "fuelType" TYPE "FuelType_new" USING ("fuelType"::text::"FuelType_new");
ALTER TABLE "vehicle_listings" ALTER COLUMN "fuelType" TYPE "FuelType_new" USING ("fuelType"::text::"FuelType_new");
ALTER TYPE "FuelType" RENAME TO "FuelType_old";
ALTER TYPE "FuelType_new" RENAME TO "FuelType";
DROP TYPE "public"."FuelType_old";
COMMIT;
