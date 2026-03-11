-- CreateEnum
CREATE TYPE "RegionalFuelType" AS ENUM ('BENZINA', 'GASOLIO', 'GPL', 'METANO');

-- CreateEnum
CREATE TYPE "FuelServiceType" AS ENUM ('SELF', 'SERVITO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "fuelPriceRegion" TEXT;

-- CreateTable
CREATE TABLE "FuelPriceSnapshot" (
    "id" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "region" TEXT NOT NULL,
    "fuelType" "RegionalFuelType" NOT NULL,
    "serviceType" "FuelServiceType" NOT NULL,
    "averagePrice" DOUBLE PRECISION,
    "sourceUrl" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FuelPriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FuelPriceSnapshot_snapshotDate_region_fuelType_serviceType_key" ON "FuelPriceSnapshot"("snapshotDate", "region", "fuelType", "serviceType");

-- CreateIndex
CREATE INDEX "FuelPriceSnapshot_snapshotDate_idx" ON "FuelPriceSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "FuelPriceSnapshot_region_idx" ON "FuelPriceSnapshot"("region");

-- CreateIndex
CREATE INDEX "FuelPriceSnapshot_fuelType_idx" ON "FuelPriceSnapshot"("fuelType");
