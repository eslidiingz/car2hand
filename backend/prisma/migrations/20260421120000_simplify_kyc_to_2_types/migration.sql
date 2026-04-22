-- Simplify KYC from 3 tiers (ID/BUSINESS/DEALER) to 2 (INDIVIDUAL/CORPORATE)
-- ShowroomType enum: INDIVIDUAL/TENT/DEALER → INDIVIDUAL/CORPORATE

-- 1. Create new ShowroomType enum
CREATE TYPE "ShowroomType_new" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- 2. Migrate seller_profiles.showroomType
--    - Drop default (we will re-apply with new type)
--    - Convert to TEXT, backfill TENT/DEALER → CORPORATE
--    - Convert column to new enum
ALTER TABLE "seller_profiles" ALTER COLUMN "showroomType" DROP DEFAULT;
ALTER TABLE "seller_profiles" ALTER COLUMN "showroomType" TYPE TEXT USING "showroomType"::text;
UPDATE "seller_profiles"
    SET "showroomType" = 'CORPORATE'
    WHERE "showroomType" IN ('TENT', 'DEALER');
ALTER TABLE "seller_profiles"
    ALTER COLUMN "showroomType" TYPE "ShowroomType_new"
        USING "showroomType"::"ShowroomType_new";
ALTER TABLE "seller_profiles" ALTER COLUMN "showroomType" SET DEFAULT 'INDIVIDUAL'::"ShowroomType_new";

-- 3. Migrate kyc_submissions.requestedShowroom (nullable)
ALTER TABLE "kyc_submissions" ALTER COLUMN "requestedShowroom" TYPE TEXT USING "requestedShowroom"::text;
UPDATE "kyc_submissions"
    SET "requestedShowroom" = 'CORPORATE'
    WHERE "requestedShowroom" IN ('TENT', 'DEALER');
ALTER TABLE "kyc_submissions"
    ALTER COLUMN "requestedShowroom" TYPE "ShowroomType_new"
        USING "requestedShowroom"::"ShowroomType_new";

-- 4. Drop old enum, rename new to old name
DROP TYPE "ShowroomType";
ALTER TYPE "ShowroomType_new" RENAME TO "ShowroomType";

-- 5. Migrate string-based KYC type columns
--    kyc_submissions.type: ID → INDIVIDUAL, BUSINESS/DEALER → CORPORATE
UPDATE "kyc_submissions" SET "type" = 'INDIVIDUAL' WHERE "type" = 'ID';
UPDATE "kyc_submissions" SET "type" = 'CORPORATE' WHERE "type" IN ('BUSINESS', 'DEALER');

--    seller_profiles.verificationLevel: ID → INDIVIDUAL, BUSINESS/DEALER → CORPORATE
UPDATE "seller_profiles" SET "verificationLevel" = 'INDIVIDUAL' WHERE "verificationLevel" = 'ID';
UPDATE "seller_profiles" SET "verificationLevel" = 'CORPORATE' WHERE "verificationLevel" IN ('BUSINESS', 'DEALER');
