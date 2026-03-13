-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN "modelDetail" TEXT,
ADD COLUMN "firstRegistrationDate" TIMESTAMP(3),
ADD COLUMN "powerKw" DOUBLE PRECISION,
ADD COLUMN "powerHp" DOUBLE PRECISION,
ADD COLUMN "cubicCapacity" INTEGER,
ADD COLUMN "alarmSystemType" TEXT,
ADD COLUMN "listPriceAmount" DOUBLE PRECISION,
ADD COLUMN "listPriceCurrency" TEXT,
ADD COLUMN "environmentalClass" TEXT,
ADD COLUMN "insuranceCompany" TEXT,
ADD COLUMN "insurancePolicyNumber" TEXT,
ADD COLUMN "insurancePresent" BOOLEAN,
ADD COLUMN "insuranceSuspended" BOOLEAN,
ADD COLUMN "insuranceCompartmentExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Vehicle_firstRegistrationDate_idx" ON "Vehicle"("firstRegistrationDate");

-- CreateIndex
CREATE INDEX "Vehicle_environmentalClass_idx" ON "Vehicle"("environmentalClass");
