-- CreateTable
CREATE TABLE "listing_renewals" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "slipImage" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "listing_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_renewals_userId_idx" ON "listing_renewals"("userId");

-- CreateIndex
CREATE INDEX "listing_renewals_listingId_idx" ON "listing_renewals"("listingId");

-- CreateIndex
CREATE INDEX "listing_renewals_status_idx" ON "listing_renewals"("status");

-- AddForeignKey
ALTER TABLE "listing_renewals" ADD CONSTRAINT "listing_renewals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_renewals" ADD CONSTRAINT "listing_renewals_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "vehicle_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
