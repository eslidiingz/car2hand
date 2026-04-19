-- Add bonusListingSlots column to users
ALTER TABLE "users" ADD COLUMN "bonusListingSlots" INTEGER NOT NULL DEFAULT 0;

-- Create slot_purchases table
CREATE TABLE "slot_purchases" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerSlot" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "slipImage" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "slot_purchases_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "slot_purchases_userId_idx" ON "slot_purchases"("userId");
CREATE INDEX "slot_purchases_status_idx" ON "slot_purchases"("status");
CREATE INDEX "slot_purchases_createdAt_idx" ON "slot_purchases"("createdAt");

-- Foreign key
ALTER TABLE "slot_purchases" ADD CONSTRAINT "slot_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
