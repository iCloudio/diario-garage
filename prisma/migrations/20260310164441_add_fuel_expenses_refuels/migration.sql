-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('BENZINA', 'DIESEL', 'GPL', 'METANO', 'ELETTRICO', 'IBRIDO_BENZINA', 'IBRIDO_DIESEL');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ATTIVO', 'VENDUTO', 'ROTTAMATO');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('RIFORNIMENTO', 'MANUTENZIONE', 'ASSICURAZIONE', 'BOLLO', 'MULTA', 'PARCHEGGIO', 'LAVAGGIO', 'PEDAGGI', 'ALTRO');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelType" "FuelType",
ADD COLUMN     "soldDate" TIMESTAMP(3),
ADD COLUMN     "soldNotes" TEXT,
ADD COLUMN     "soldPrice" DOUBLE PRECISION,
ADD COLUMN     "status" "VehicleStatus" NOT NULL DEFAULT 'ATTIVO';

-- CreateTable
CREATE TABLE "Refuel" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liters" DOUBLE PRECISION,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "odometerKm" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "pricePerLiter" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Refuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "odometerKm" INTEGER,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Refuel_vehicleId_idx" ON "Refuel"("vehicleId");

-- CreateIndex
CREATE INDEX "Refuel_date_idx" ON "Refuel"("date");

-- CreateIndex
CREATE INDEX "Expense_vehicleId_idx" ON "Expense"("vehicleId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- AddForeignKey
ALTER TABLE "Refuel" ADD CONSTRAINT "Refuel_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
