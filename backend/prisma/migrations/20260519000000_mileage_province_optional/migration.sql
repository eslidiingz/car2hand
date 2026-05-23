-- Make mileage + province optional on vehicle_listings:
--   - mileage: NULL = seller picked "ไม่ระบุ" (not specified)
--   - province: NULL = seller left it blank (now optional)
-- Only drops NOT NULL — existing rows keep their values, no data loss.
ALTER TABLE "vehicle_listings" ALTER COLUMN "mileage" DROP NOT NULL;
ALTER TABLE "vehicle_listings" ALTER COLUMN "province" DROP NOT NULL;
