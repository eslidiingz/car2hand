/*
  Warnings:

  - You are about to drop the column `ownerCount` on the `vehicle_listings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('BANK', 'INSURANCE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('FINANCE', 'INSURANCE', 'DELIVERY', 'TRANSFER', 'GENERAL');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "package_transactions" ADD COLUMN     "fromPackageName" TEXT,
ADD COLUMN     "fromPackageSlug" TEXT,
ADD COLUMN     "proratedCredit" DECIMAL(10,2),
ADD COLUMN     "transactionType" TEXT NOT NULL DEFAULT 'UPGRADE';

-- AlterTable
ALTER TABLE "vehicle_listings" DROP COLUMN "ownerCount",
ADD COLUMN     "autoBumpSlot" INTEGER,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "registrationBookImage" TEXT;

-- CreateTable
CREATE TABLE "garage_vehicles" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "color" TEXT,
    "licensePlate" TEXT,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "garage_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_records" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mileage" INTEGER,
    "cost" DECIMAL(10,2),
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "shopName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "service_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_reminders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "dueMileage" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "maintenance_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "highlight" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_bookings" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "userId" TEXT,
    "brandName" TEXT NOT NULL,
    "modelName" TEXT,
    "vehicleNote" TEXT,
    "location" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactLine" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "vat" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_inquiries" (
    "id" TEXT NOT NULL,
    "type" "InquiryType" NOT NULL,
    "userId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactLine" TEXT,
    "details" JSONB,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "garage_vehicles_userId_idx" ON "garage_vehicles"("userId");

-- CreateIndex
CREATE INDEX "service_records_vehicleId_serviceDate_idx" ON "service_records"("vehicleId", "serviceDate");

-- CreateIndex
CREATE INDEX "maintenance_reminders_vehicleId_idx" ON "maintenance_reminders"("vehicleId");

-- CreateIndex
CREATE INDEX "user_notifications_userId_isRead_idx" ON "user_notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "user_notifications_userId_createdAt_idx" ON "user_notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "service_partners_type_isActive_idx" ON "service_partners"("type", "isActive");

-- CreateIndex
CREATE INDEX "inspection_bookings_status_idx" ON "inspection_bookings"("status");

-- CreateIndex
CREATE INDEX "inspection_bookings_userId_idx" ON "inspection_bookings"("userId");

-- CreateIndex
CREATE INDEX "inspection_bookings_appointmentDate_idx" ON "inspection_bookings"("appointmentDate");

-- CreateIndex
CREATE INDEX "service_inquiries_type_status_idx" ON "service_inquiries"("type", "status");

-- CreateIndex
CREATE INDEX "service_inquiries_userId_idx" ON "service_inquiries"("userId");

-- CreateIndex
CREATE INDEX "service_inquiries_createdAt_idx" ON "service_inquiries"("createdAt");

-- AddForeignKey
ALTER TABLE "garage_vehicles" ADD CONSTRAINT "garage_vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "garage_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_reminders" ADD CONSTRAINT "maintenance_reminders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "garage_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_bookings" ADD CONSTRAINT "inspection_bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "inspection_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_bookings" ADD CONSTRAINT "inspection_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_inquiries" ADD CONSTRAINT "service_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
