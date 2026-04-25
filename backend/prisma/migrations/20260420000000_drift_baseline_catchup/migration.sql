-- Drift baseline catch-up (Part 1 of 2)
-- Adds ShowroomType + seller_profiles + kyc_submissions which were created via
-- `prisma db push` instead of proper migrations. The next migration
-- (20260421120000_simplify_kyc_to_2_types) ALTERs these objects, so they must
-- exist before it runs. See CLAUDE.md ("Database migration — drift warning").

-- CreateEnum (3-tier — will be migrated to 2-tier by 20260421120000)
CREATE TYPE "ShowroomType" AS ENUM ('INDIVIDUAL', 'TENT', 'DEALER');

-- CreateTable seller_profiles
CREATE TABLE "seller_profiles" (
    "id" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopDescription" TEXT,
    "shopLogo" TEXT,
    "shopCoverImage" TEXT,
    "shopAddress" TEXT,
    "shopProvince" TEXT,
    "shopDistrict" TEXT,
    "shopMapUrl" TEXT,
    "shopPhone" TEXT,
    "showroomType" "ShowroomType" NOT NULL DEFAULT 'INDIVIDUAL',
    "shopOpenHours" TEXT,
    "shopEstablishedYear" INTEGER,
    "socialWebsite" TEXT,
    "socialFacebook" TEXT,
    "socialLine" TEXT,
    "socialInstagram" TEXT,
    "specializations" JSONB NOT NULL DEFAULT '[]',
    "totalSoldCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationLevel" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "seller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable kyc_submissions
CREATE TABLE "kyc_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fullName" TEXT,
    "idNumber" TEXT,
    "idCardImage" TEXT,
    "selfieImage" TEXT,
    "businessName" TEXT,
    "taxId" TEXT,
    "businessCertImage" TEXT,
    "addressProofImage" TEXT,
    "dealerAppointmentDoc" TEXT,
    "requestedShowroom" "ShowroomType",
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seller_profiles_userId_key" ON "seller_profiles"("userId");
CREATE INDEX "seller_profiles_shopProvince_idx" ON "seller_profiles"("shopProvince");
CREATE INDEX "seller_profiles_verificationLevel_idx" ON "seller_profiles"("verificationLevel");
CREATE INDEX "kyc_submissions_userId_status_idx" ON "kyc_submissions"("userId", "status");
CREATE INDEX "kyc_submissions_status_submittedAt_idx" ON "kyc_submissions"("status", "submittedAt");

-- AddForeignKey
ALTER TABLE "seller_profiles" ADD CONSTRAINT "seller_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
