-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC', 'LPG', 'NGV');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'CVT', 'DCT', 'SEMI_AUTO');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'CROSSOVER', 'MPV', 'PICKUP', 'COUPE', 'CONVERTIBLE', 'WAGON', 'VAN', 'STANDARD', 'SCOOTER', 'SPORT', 'NAKED', 'CRUISER', 'TOURING', 'ADVENTURE', 'DIRT', 'CAFE_RACER', 'UNDERBONE', 'CUB');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE', 'SOLD', 'EXPIRED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_listings" (
    "id" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "subModel" TEXT,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "transmission" "Transmission",
    "engineSize" INTEGER,
    "mileage" INTEGER NOT NULL,
    "bodyType" "BodyType" NOT NULL,
    "plateProvince" TEXT,
    "registrationType" "RegistrationType" NOT NULL DEFAULT 'PERSONAL',
    "condition" "Condition" NOT NULL,
    "ownerCount" INTEGER NOT NULL DEFAULT 1,
    "hasAccident" BOOLEAN NOT NULL DEFAULT false,
    "hasModified" BOOLEAN NOT NULL DEFAULT false,
    "hasWarranty" BOOLEAN NOT NULL DEFAULT false,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiredAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "vehicle_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "vehicle_listings_vehicleType_idx" ON "vehicle_listings"("vehicleType");

-- CreateIndex
CREATE INDEX "vehicle_listings_brand_model_idx" ON "vehicle_listings"("brand", "model");

-- CreateIndex
CREATE INDEX "vehicle_listings_price_idx" ON "vehicle_listings"("price");

-- CreateIndex
CREATE INDEX "vehicle_listings_province_idx" ON "vehicle_listings"("province");

-- CreateIndex
CREATE INDEX "vehicle_listings_status_idx" ON "vehicle_listings"("status");

-- CreateIndex
CREATE INDEX "vehicle_listings_createdAt_idx" ON "vehicle_listings"("createdAt");

-- CreateIndex
CREATE INDEX "vehicle_images_listingId_idx" ON "vehicle_images"("listingId");

-- AddForeignKey
ALTER TABLE "vehicle_listings" ADD CONSTRAINT "vehicle_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "vehicle_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
