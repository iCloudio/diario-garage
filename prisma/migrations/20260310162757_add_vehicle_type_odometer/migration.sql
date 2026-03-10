/*
  Warnings:

  - A unique constraint covering the columns `[vehicleId,type]` on the table `Deadline` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('AUTO', 'MOTO', 'CAMPER');

-- AlterTable
ALTER TABLE "Deadline" ADD COLUMN     "amount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "odometerKm" INTEGER,
ADD COLUMN     "type" "VehicleType" NOT NULL DEFAULT 'AUTO';

-- CreateIndex
CREATE UNIQUE INDEX "Deadline_vehicleId_type_key" ON "Deadline"("vehicleId", "type");
