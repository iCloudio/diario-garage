-- CreateTable
CREATE TABLE "PlateLookupCache" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'TUTTOTARGHE',
    "sourceJobId" TEXT,
    "requestedTypes" JSONB,
    "rawResult" JSONB,
    "detailsData" JSONB,
    "rcaData" JSONB,
    "theftData" JSONB,
    "environmentalData" JSONB,
    "newlylicensedData" JSONB,
    "inspectionsData" JSONB,
    "detailsLicensePlate" TEXT,
    "detailsBrand" TEXT,
    "detailsModel" TEXT,
    "detailsModelDetail" TEXT,
    "detailsBuildYear" INTEGER,
    "detailsFirstRegistrationDate" TIMESTAMP(3),
    "detailsFuelType" TEXT,
    "detailsVehicleType" TEXT,
    "detailsPowerKw" DOUBLE PRECISION,
    "detailsPowerHp" DOUBLE PRECISION,
    "detailsCubicCapacity" INTEGER,
    "detailsPriceAmount" DOUBLE PRECISION,
    "detailsPriceCurrency" TEXT,
    "detailsAlarmSystemType" TEXT,
    "rcaPlate" TEXT,
    "rcaVehicleTypeDescription" TEXT,
    "rcaInsuranceCompany" TEXT,
    "rcaPolicyNumber" TEXT,
    "rcaInsurancePresent" BOOLEAN,
    "rcaInsuranceSuspended" BOOLEAN,
    "rcaPolicyExpiry" TIMESTAMP(3),
    "rcaPolicyCompartmentExpiry" TIMESTAMP(3),
    "environmentalLicensePlate" TEXT,
    "environmentalVehicleType" TEXT,
    "environmentalClass" TEXT,
    "environmentalVehicleTypeDescription" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlateLookupCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlateLookupCache_plate_key" ON "PlateLookupCache"("plate");

-- CreateIndex
CREATE INDEX "PlateLookupCache_provider_idx" ON "PlateLookupCache"("provider");

-- CreateIndex
CREATE INDEX "PlateLookupCache_fetchedAt_idx" ON "PlateLookupCache"("fetchedAt");
