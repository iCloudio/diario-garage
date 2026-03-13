import { Prisma, type FuelType, type PlateLookupCache, type VehicleType } from "@prisma/client";
import { db } from "@/lib/db";
import {
  lookupPlateFromTuttotarghe,
  type TuttotargheLookupResult,
} from "@/lib/providers/tuttotarghe";

export type PlateLookupResult = {
  cacheId: string;
  plate: string;
  make?: string;
  model?: string;
  modelDetail?: string;
  firstRegistrationDate?: string;
  fuelType?: FuelType | null;
  type?: VehicleType | null;
  powerKw?: number;
  powerHp?: number;
  cubicCapacity?: number;
  alarmSystemType?: string;
  listPriceAmount?: number;
  listPriceCurrency?: string;
  environmentalClass?: string;
  insurance?: {
    company?: string;
    policyNumber?: string;
    present?: boolean;
    suspended?: boolean;
    expiresAt?: string;
    compartmentExpiresAt?: string;
  };
  source: "cache" | "tuttotarghe";
};

function normalizePlate(plate: string) {
  return plate.replace(/\s+/g, "").toUpperCase();
}

function parseProviderDate(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  const dateWithOffsetPattern = /^\d{4}-\d{2}-\d{2}[+-]\d{2}:\d{2}$/;
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  const normalized = dateWithOffsetPattern.test(trimmed)
    ? `${trimmed.slice(0, 10)}T00:00:00${trimmed.slice(10)}`
    : dateOnlyPattern.test(trimmed)
      ? `${trimmed}T00:00:00`
      : trimmed;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function readRawObjectStringField(
  value: Prisma.JsonValue | null,
  key: string,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const field = record[key];
  return typeof field === "string" && field.trim().length > 0 ? field.trim() : null;
}

function mapRecordToResult(
  record: PlateLookupCache,
  source: PlateLookupResult["source"],
): PlateLookupResult {
  const fallbackPolicyExpiry =
    record.rcaPolicyExpiry ??
    parseProviderDate(readRawObjectStringField(record.rcaData, "dataScadenzaPolizza"));
  const fallbackPolicyCompartmentExpiry =
    record.rcaPolicyCompartmentExpiry ??
    parseProviderDate(
      readRawObjectStringField(record.rcaData, "dataScadenzaCompartoPolizza"),
    );

  return {
    cacheId: record.id,
    plate: record.plate,
    make: record.detailsBrand ?? undefined,
    model: record.detailsModel ?? undefined,
    modelDetail: record.detailsModelDetail ?? undefined,
    firstRegistrationDate: record.detailsFirstRegistrationDate?.toISOString(),
    fuelType:
      (record.detailsFuelType
        ? normalizeFuelType(record.detailsFuelType)
        : null) ?? undefined,
    type:
      (record.detailsVehicleType
        ? normalizeVehicleType(record.detailsVehicleType)
        : null) ?? undefined,
    powerKw: record.detailsPowerKw ?? undefined,
    powerHp: record.detailsPowerHp ?? undefined,
    cubicCapacity: record.detailsCubicCapacity ?? undefined,
    alarmSystemType: record.detailsAlarmSystemType ?? undefined,
    listPriceAmount: record.detailsPriceAmount ?? undefined,
    listPriceCurrency: record.detailsPriceCurrency ?? undefined,
    environmentalClass: record.environmentalClass ?? undefined,
    insurance: {
      company: record.rcaInsuranceCompany ?? undefined,
      policyNumber: record.rcaPolicyNumber ?? undefined,
      present: record.rcaInsurancePresent ?? undefined,
      suspended: record.rcaInsuranceSuspended ?? undefined,
      expiresAt: fallbackPolicyExpiry?.toISOString(),
      compartmentExpiresAt: fallbackPolicyCompartmentExpiry?.toISOString(),
    },
    source,
  };
}

function normalizeFuelType(value: string): FuelType | null {
  const normalized = value.trim().toUpperCase();

  if (normalized.includes("IBRIDO") && normalized.includes("DIESEL")) {
    return "IBRIDO_DIESEL";
  }
  if (normalized.includes("IBRIDO") && normalized.includes("BENZ")) {
    return "IBRIDO_BENZINA";
  }
  if (normalized.includes("DIESEL") || normalized.includes("GASOLIO")) {
    return "DIESEL";
  }
  if (normalized.includes("BENZ")) {
    return "BENZINA";
  }
  if (normalized.includes("GPL")) {
    return "GPL";
  }
  if (normalized.includes("METANO")) {
    return "METANO";
  }
  if (normalized.includes("ELETTR")) {
    return "ELETTRICO";
  }
  return null;
}

function normalizeVehicleType(value: string): VehicleType | null {
  const normalized = value.trim().toUpperCase();

  if (normalized.includes("CAMPER")) return "CAMPER";
  if (normalized.includes("MOTO")) return "MOTO";
  if (
    normalized.includes("AUTO") ||
    normalized.includes("CAR") ||
    normalized.includes("AUTOVEICOLO")
  ) {
    return "AUTO";
  }
  return null;
}

function buildUpdateInput(result: TuttotargheLookupResult) {
  const jsonOrNull = (value: unknown) =>
    value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);

  return {
    provider: "TUTTOTARGHE",
    sourceJobId: result.sourceJobId ?? null,
    requestedTypes: [...result.requestedTypes] as Prisma.InputJsonValue,
    rawResult: result.rawResult as Prisma.InputJsonValue,
    detailsData: jsonOrNull(result.detailsData),
    rcaData: jsonOrNull(result.rcaData),
    theftData: jsonOrNull(result.theftData),
    environmentalData: jsonOrNull(result.environmentalData),
    newlylicensedData: jsonOrNull(result.newlylicensedData),
    inspectionsData: jsonOrNull(result.inspectionsData),
    detailsLicensePlate: result.details.licensePlate ?? null,
    detailsBrand: result.details.brand ?? null,
    detailsModel: result.details.model ?? null,
    detailsModelDetail: result.details.modelDetail ?? null,
    detailsBuildYear: result.details.buildYear ?? null,
    detailsFirstRegistrationDate: result.details.firstRegistrationDate ?? null,
    detailsFuelType: result.details.fuelTypeRaw ?? null,
    detailsVehicleType: result.details.vehicleTypeRaw ?? null,
    detailsPowerKw: result.details.powerKw ?? null,
    detailsPowerHp: result.details.powerHp ?? null,
    detailsCubicCapacity: result.details.cubicCapacity ?? null,
    detailsPriceAmount: result.details.priceAmount ?? null,
    detailsPriceCurrency: result.details.priceCurrency ?? null,
    detailsAlarmSystemType: result.details.alarmSystemType ?? null,
    rcaPlate: result.rca.plate ?? null,
    rcaVehicleTypeDescription: result.rca.vehicleTypeDescription ?? null,
    rcaInsuranceCompany: result.rca.insuranceCompany ?? null,
    rcaPolicyNumber: result.rca.policyNumber ?? null,
    rcaInsurancePresent: result.rca.insurancePresent ?? null,
    rcaInsuranceSuspended: result.rca.insuranceSuspended ?? null,
    rcaPolicyExpiry: result.rca.policyExpiry ?? null,
    rcaPolicyCompartmentExpiry: result.rca.policyCompartmentExpiry ?? null,
    environmentalLicensePlate:
      (typeof result.environmentalData?.licensePlate === "string"
        ? result.environmentalData.licensePlate
        : typeof result.environmentalData?.targa === "string"
          ? result.environmentalData.targa
          : null),
    environmentalVehicleType:
      typeof result.environmentalData?.vehicleType === "string"
        ? result.environmentalData.vehicleType
        : null,
    environmentalClass:
      typeof result.environmentalData?.environmentalClass === "string"
        ? result.environmentalData.environmentalClass
        : null,
    environmentalVehicleTypeDescription:
      typeof result.environmentalData?.vehicleTypeDescription === "string"
        ? result.environmentalData.vehicleTypeDescription
        : null,
    fetchedAt: new Date(),
  };
}

export function buildInsuranceDeadlineFromLookup(cache: PlateLookupCache) {
  const policyExpiry =
    cache.rcaPolicyExpiry ??
    parseProviderDate(readRawObjectStringField(cache.rcaData, "dataScadenzaPolizza"));

  if (!policyExpiry) return null;

  const notes = [
    cache.rcaInsuranceCompany
      ? `Compagnia: ${cache.rcaInsuranceCompany}`
      : null,
    cache.rcaPolicyNumber ? `Polizza: ${cache.rcaPolicyNumber}` : null,
    cache.rcaInsuranceSuspended === true ? "Polizza sospesa" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    dueDate: policyExpiry,
    notes: notes || null,
  };
}

export function buildVehicleDataFromLookup(cache: PlateLookupCache) {
  const fuelType =
    cache.detailsFuelType != null
      ? normalizeFuelType(cache.detailsFuelType)
      : null;
  const type =
    cache.detailsVehicleType != null
      ? normalizeVehicleType(cache.detailsVehicleType)
      : null;

  return {
    make: cache.detailsBrand ?? null,
    model: cache.detailsModel ?? null,
    modelDetail: cache.detailsModelDetail ?? null,
    firstRegistrationDate: cache.detailsFirstRegistrationDate ?? null,
    fuelType,
    type,
    powerKw: cache.detailsPowerKw ?? null,
    powerHp: cache.detailsPowerHp ?? null,
    cubicCapacity: cache.detailsCubicCapacity ?? null,
    alarmSystemType: cache.detailsAlarmSystemType ?? null,
    listPriceAmount: cache.detailsPriceAmount ?? null,
    listPriceCurrency: cache.detailsPriceCurrency ?? null,
    environmentalClass: cache.environmentalClass ?? null,
    insuranceCompany: cache.rcaInsuranceCompany ?? null,
    insurancePolicyNumber: cache.rcaPolicyNumber ?? null,
    insurancePresent: cache.rcaInsurancePresent ?? null,
    insuranceSuspended: cache.rcaInsuranceSuspended ?? null,
    insuranceCompartmentExpiry:
      cache.rcaPolicyCompartmentExpiry ??
      parseProviderDate(
        readRawObjectStringField(cache.rcaData, "dataScadenzaCompartoPolizza"),
      ),
  };
}

export async function getPlateLookupCacheById(id: string) {
  return db.plateLookupCache.findUnique({
    where: { id },
  });
}

export async function lookupPlate(plate: string): Promise<PlateLookupResult | null> {
  const normalizedPlate = normalizePlate(plate);
  const cached = await db.plateLookupCache.findUnique({
    where: { plate: normalizedPlate },
  });

  if (cached) {
    return mapRecordToResult(cached, "cache");
  }

  const providerResult = await lookupPlateFromTuttotarghe(normalizedPlate);
  if (!providerResult) {
    return null;
  }

  const saved = await db.plateLookupCache.upsert({
    where: { plate: normalizedPlate },
    create: {
      plate: normalizedPlate,
      ...buildUpdateInput(providerResult),
    },
    update: buildUpdateInput(providerResult),
  });

  return mapRecordToResult(saved, "tuttotarghe");
}
