-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT,
    "logo" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "country" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameTh" TEXT,
    "bodyType" "BodyType",
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brandId" TEXT NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_sub_models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engineSize" INTEGER,
    "fuelType" "FuelType",
    "transmission" "Transmission",
    "yearStart" INTEGER,
    "yearEnd" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "vehicle_sub_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brands_vehicleType_idx" ON "brands"("vehicleType");

-- CreateIndex
CREATE INDEX "brands_isPopular_idx" ON "brands"("isPopular");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_vehicleType_key" ON "brands"("name", "vehicleType");

-- CreateIndex
CREATE INDEX "vehicle_models_brandId_idx" ON "vehicle_models"("brandId");

-- CreateIndex
CREATE INDEX "vehicle_models_isPopular_idx" ON "vehicle_models"("isPopular");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_brandId_name_key" ON "vehicle_models"("brandId", "name");

-- CreateIndex
CREATE INDEX "vehicle_sub_models_modelId_idx" ON "vehicle_sub_models"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_sub_models_modelId_name_key" ON "vehicle_sub_models"("modelId", "name");

-- AddForeignKey
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_sub_models" ADD CONSTRAINT "vehicle_sub_models_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "vehicle_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
