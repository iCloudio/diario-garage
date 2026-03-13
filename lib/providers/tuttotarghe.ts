import type { FuelType, VehicleType } from "@prisma/client";
import { z } from "zod";

const TUTTOTARGHE_BASE_URL =
  process.env.TUTTOTARGHE_BASE_URL ?? "https://api.tuttotarghe.it";

const JOB_TYPES = ["details", "rca"] as const;

const jobsyncResponseSchema = z.object({
  job_id: z.string().optional(),
  results: z.array(
    z.object({
      targa: z.string(),
      type: z.array(z.string()).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
      completed: z.boolean().optional(),
    }),
  ),
});

type ObjectLike = Record<string, unknown>;

export type TuttotargheLookupResult = {
  plate: string;
  sourceJobId?: string;
  requestedTypes: readonly string[];
  rawResult: ObjectLike;
  detailsData: ObjectLike | null;
  rcaData: ObjectLike | null;
  theftData: ObjectLike | null;
  environmentalData: ObjectLike | null;
  newlylicensedData: ObjectLike | null;
  inspectionsData: unknown;
  details: {
    licensePlate?: string;
    brand?: string;
    model?: string;
    modelDetail?: string;
    buildYear?: number;
    firstRegistrationDate?: Date;
    fuelTypeRaw?: string;
    fuelType?: FuelType | null;
    vehicleTypeRaw?: string;
    vehicleType?: VehicleType | null;
    powerKw?: number;
    powerHp?: number;
    cubicCapacity?: number;
    priceAmount?: number;
    priceCurrency?: string;
    alarmSystemType?: string;
  };
  rca: {
    plate?: string;
    vehicleTypeDescription?: string;
    insuranceCompany?: string;
    policyNumber?: string;
    insurancePresent?: boolean;
    insuranceSuspended?: boolean;
    policyExpiry?: Date;
    policyCompartmentExpiry?: Date;
  };
};

function asObject(value: unknown): ObjectLike | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as ObjectLike;
}

function readString(source: ObjectLike | null, key: string) {
  const value = source?.[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBoolean(source: ObjectLike | null, key: string) {
  const value = source?.[key];
  return typeof value === "boolean" ? value : undefined;
}

function readNumber(source: ObjectLike | null, key: string) {
  const value = source?.[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readInteger(source: ObjectLike | null, key: string) {
  const value = readNumber(source, key);
  return value == null ? undefined : Math.trunc(value);
}

function parseProviderDate(value?: string) {
  if (!value) return undefined;

  const trimmed = value.trim();
  const dateWithOffsetPattern = /^\d{4}-\d{2}-\d{2}[+-]\d{2}:\d{2}$/;
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  const normalized = dateWithOffsetPattern.test(trimmed)
    ? `${trimmed.slice(0, 10)}T00:00:00${trimmed.slice(10)}`
    : dateOnlyPattern.test(trimmed)
      ? `${trimmed}T00:00:00`
      : trimmed;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function readDate(source: ObjectLike | null, key: string) {
  const value = readString(source, key);
  return parseProviderDate(value);
}

function normalizeFuelType(value?: string): FuelType | null {
  if (!value) return null;
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

function normalizeVehicleType(value?: string): VehicleType | null {
  if (!value) return null;
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

function normalizePlate(plate: string) {
  return plate.replace(/\s+/g, "").toUpperCase();
}

function parseResult(result: z.infer<typeof jobsyncResponseSchema>["results"][number]) {
  const rawResult = {
    targa: result.targa,
    type: result.type ?? [],
    data: result.data ?? {},
    completed: result.completed ?? false,
  };

  const data = result.data ?? {};
  const detailsData = asObject(data.details);
  const rcaData = asObject(data.rca);
  const theftData = asObject(data.theft);
  const environmentalData = asObject(data.environmental);
  const newlylicensedData = asObject(data.newlylicensed);
  const inspectionsData = data.inspections ?? null;

  const powerData = asObject(detailsData?.power);
  const priceData = asObject(detailsData?.price);

  return {
    plate: normalizePlate(result.targa),
    requestedTypes: result.type ?? JOB_TYPES,
    rawResult,
    detailsData,
    rcaData,
    theftData,
    environmentalData,
    newlylicensedData,
    inspectionsData,
    details: {
      licensePlate: readString(detailsData, "licensePlate"),
      brand: readString(detailsData, "brand"),
      model: readString(detailsData, "model"),
      modelDetail: readString(detailsData, "modelDetail"),
      buildYear: readInteger(detailsData, "buildYear"),
      firstRegistrationDate: readDate(detailsData, "firstRegistrationDate"),
      fuelTypeRaw: readString(detailsData, "fuelType"),
      fuelType: normalizeFuelType(readString(detailsData, "fuelType")),
      vehicleTypeRaw: readString(detailsData, "vehicleType"),
      vehicleType: normalizeVehicleType(readString(detailsData, "vehicleType")),
      powerKw: readNumber(powerData, "kw"),
      powerHp: readNumber(powerData, "hp"),
      cubicCapacity: readInteger(detailsData, "cubicCapacity"),
      priceAmount: readNumber(priceData, "amount"),
      priceCurrency: readString(priceData, "currency"),
      alarmSystemType: readString(detailsData, "alarmSystemType"),
    },
    rca: {
      plate: readString(rcaData, "targaVeicolo"),
      vehicleTypeDescription: readString(rcaData, "descrizioneTipoVeicolo"),
      insuranceCompany: readString(rcaData, "compagniaAssicurativa"),
      policyNumber: readString(rcaData, "numeroPolizza"),
      insurancePresent: readBoolean(rcaData, "assicurazionePresente"),
      insuranceSuspended: readBoolean(rcaData, "assicurazioneSospesa"),
      policyExpiry: readDate(rcaData, "dataScadenzaPolizza"),
      policyCompartmentExpiry: readDate(rcaData, "dataScadenzaCompartoPolizza"),
    },
  };
}

export async function lookupPlateFromTuttotarghe(plate: string) {
  const token = process.env.TUTTOTARGHE_API_TOKEN;
  if (!token) {
    throw new Error("TUTTOTARGHE_API_TOKEN non configurato.");
  }

  const normalizedPlate = normalizePlate(plate);
  const response = await fetch(`${TUTTOTARGHE_BASE_URL}/job/jobsync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      targhe: [normalizedPlate],
      type: JOB_TYPES,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Lookup targa non riuscito.";
    throw new Error(message);
  }

  const parsed = jobsyncResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Risposta Tuttotarghe non valida.");
  }

  const result = parsed.data.results.find(
    (entry) => normalizePlate(entry.targa) === normalizedPlate,
  );
  if (!result) {
    return null;
  }

  return {
    sourceJobId: parsed.data.job_id,
    ...parseResult(result),
  } satisfies TuttotargheLookupResult;
}
