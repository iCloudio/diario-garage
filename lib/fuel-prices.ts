import { db } from "@/lib/db";
import { FUEL_PRICE_REGIONS, type FuelPriceRegion, type RegionalFuelCode } from "@/lib/fuel-price-regions";

const MIMIT_REGIONS_URL = "https://www.mimit.gov.it/it/prezzo-medio-carburanti/regioni";
const ROME_TIMEZONE = "Europe/Rome";

const FUEL_LABEL_TO_CODE: Record<string, RegionalFuelCode> = {
  Benzina: "BENZINA",
  Gasolio: "GASOLIO",
  GPL: "GPL",
  Metano: "METANO",
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&agrave;/g, "à")
    .replace(/&Agrave;/g, "À")
    .replace(/&egrave;/g, "è")
    .replace(/&Egrave;/g, "È")
    .replace(/&eacute;/g, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&igrave;/g, "ì")
    .replace(/&ograve;/g, "ò")
    .replace(/&ugrave;/g, "ù");
}

function normalizeHtmlToLines(html: string) {
  return decodeHtmlEntities(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(h1|h2|h3|p|li|div|tr|table|section|article|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getRomeDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ROME_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function getTargetSnapshotDate(now = new Date()) {
  const parts = getRomeDateParts(now);
  const target = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  if (parts.hour > 8 || (parts.hour === 8 && parts.minute >= 30)) {
    return target;
  }

  target.setUTCDate(target.getUTCDate() - 1);
  return target;
}

function sameUtcDay(left: Date, right: Date) {
  return left.getUTCFullYear() === right.getUTCFullYear()
    && left.getUTCMonth() === right.getUTCMonth()
    && left.getUTCDate() === right.getUTCDate();
}

function parseSnapshotDate(lines: string[]) {
  const updateLine = lines.find((line) => /Aggiornamento\s+\d{2}-\d{2}-\d{4}/i.test(line));
  if (!updateLine) return null;

  const match = updateLine.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return null;

  const [, day, month, year] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

function parseAveragePrice(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "N/D" || normalized === "ND" || normalized === "-") {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

async function fetchRegionalFuelRows() {
  const response = await fetch(MIMIT_REGIONS_URL, {
    cache: "no-store",
    headers: {
      "user-agent": "diario-garage/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`MIMIT fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const lines = normalizeHtmlToLines(html);
  const snapshotDate = parseSnapshotDate(lines);
  if (!snapshotDate) {
    throw new Error("Unable to parse MIMIT update date");
  }

  const rows: Array<{
    snapshotDate: Date;
    region: FuelPriceRegion;
    fuelType: RegionalFuelCode;
    serviceType: "SELF" | "SERVITO";
    averagePrice: number | null;
  }> = [];

  let currentRegion: FuelPriceRegion | null = null;
  const regionSet = new Set<string>(FUEL_PRICE_REGIONS);
  const stopPattern = /^L'elenco dei prezzi medi/i;

  for (const line of lines) {
    if (stopPattern.test(line)) {
      break;
    }

    if (regionSet.has(line)) {
      currentRegion = line as FuelPriceRegion;
      continue;
    }

    if (!currentRegion || /^TIPOLOGIA/i.test(line) || /^EROGAZIONE/i.test(line)) {
      continue;
    }

    const rowMatch = line.match(/^(Gasolio|Benzina|GPL|Metano)\s+(SELF|SERVITO)\s+([0-9.,]+|N\/D|ND|-)\s*$/i);
    if (!rowMatch) {
      continue;
    }

    const [, fuelLabel, serviceType, priceValue] = rowMatch;
    rows.push({
      snapshotDate,
      region: currentRegion,
      fuelType: FUEL_LABEL_TO_CODE[fuelLabel],
      serviceType: serviceType.toUpperCase() as "SELF" | "SERVITO",
      averagePrice: parseAveragePrice(priceValue),
    });
  }

  if (rows.length === 0) {
    throw new Error("No regional fuel rows parsed from MIMIT page");
  }

  return { snapshotDate, rows };
}

export async function syncRegionalFuelPrices() {
  const { snapshotDate, rows } = await fetchRegionalFuelRows();

  await Promise.all(
    rows.map((row) =>
      db.fuelPriceSnapshot.upsert({
        where: {
          snapshotDate_region_fuelType_serviceType: {
            snapshotDate: row.snapshotDate,
            region: row.region,
            fuelType: row.fuelType,
            serviceType: row.serviceType,
          },
        },
        update: {
          averagePrice: row.averagePrice,
          sourceUrl: MIMIT_REGIONS_URL,
          fetchedAt: new Date(),
        },
        create: {
          snapshotDate: row.snapshotDate,
          region: row.region,
          fuelType: row.fuelType,
          serviceType: row.serviceType,
          averagePrice: row.averagePrice,
          sourceUrl: MIMIT_REGIONS_URL,
        },
      }),
    ),
  );

  return snapshotDate;
}

export async function ensureRegionalFuelPrices() {
  const latestSnapshot = await db.fuelPriceSnapshot.findFirst({
    orderBy: { snapshotDate: "desc" },
    select: { snapshotDate: true },
  });

  const targetSnapshotDate = getTargetSnapshotDate();
  if (latestSnapshot && sameUtcDay(latestSnapshot.snapshotDate, targetSnapshotDate)) {
    return latestSnapshot.snapshotDate;
  }

  try {
    return await syncRegionalFuelPrices();
  } catch (error) {
    console.error("Unable to sync regional fuel prices:", error);
    return latestSnapshot?.snapshotDate ?? null;
  }
}

export async function getRegionalFuelPriceTable() {
  const activeSnapshotDate = await ensureRegionalFuelPrices();
  if (!activeSnapshotDate) {
    return { snapshotDate: null, regions: [] as Array<Record<string, string | null>> };
  }

  const snapshots = await db.fuelPriceSnapshot.findMany({
    where: { snapshotDate: activeSnapshotDate },
    orderBy: [{ region: "asc" }, { fuelType: "asc" }, { serviceType: "asc" }],
  });

  const regionMap = new Map<
    string,
    {
      region: string;
      BENZINA: string | null;
      GASOLIO: string | null;
      GPL: string | null;
      METANO: string | null;
    }
  >();

  for (const region of FUEL_PRICE_REGIONS) {
    regionMap.set(region, {
      region,
      BENZINA: null,
      GASOLIO: null,
      GPL: null,
      METANO: null,
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.serviceType !== "SELF") continue;
    const region = regionMap.get(snapshot.region);
    if (!region) continue;
    region[snapshot.fuelType] =
      snapshot.averagePrice != null
        ? new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          }).format(snapshot.averagePrice)
        : null;
  }

  return {
    snapshotDate: activeSnapshotDate,
    sourceUrl: MIMIT_REGIONS_URL,
    regions: Array.from(regionMap.values()),
  };
}

export function mapVehicleFuelTypeToRegionalFuel(vehicleFuelType?: string | null): RegionalFuelCode | null {
  if (!vehicleFuelType) return null;

  if (vehicleFuelType === "BENZINA" || vehicleFuelType === "IBRIDO_BENZINA") return "BENZINA";
  if (vehicleFuelType === "DIESEL" || vehicleFuelType === "IBRIDO_DIESEL") return "GASOLIO";
  if (vehicleFuelType === "GPL") return "GPL";
  if (vehicleFuelType === "METANO") return "METANO";
  return null;
}

export async function getRegionalFuelBenchmark(region: string | null | undefined, vehicleFuelType?: string | null) {
  if (!region) return null;

  const snapshotDate = await ensureRegionalFuelPrices();
  const regionalFuel = mapVehicleFuelTypeToRegionalFuel(vehicleFuelType);
  if (!snapshotDate || !regionalFuel) {
    return null;
  }

  const snapshot = await db.fuelPriceSnapshot.findFirst({
    where: {
      snapshotDate,
      region,
      fuelType: regionalFuel,
      serviceType: "SELF",
    },
    select: {
      averagePrice: true,
      snapshotDate: true,
      region: true,
      fuelType: true,
    },
  });

  if (!snapshot) {
    return null;
  }

  return {
    region: snapshot.region,
    fuelType: snapshot.fuelType,
    averagePrice: snapshot.averagePrice,
    snapshotDate: snapshot.snapshotDate,
    sourceUrl: MIMIT_REGIONS_URL,
  };
}

export async function getRegionalFuelBenchmarksForRegion(region: string | null | undefined) {
  if (!region) {
    return {
      snapshotDate: null as Date | null,
      benchmarks: new Map<
        RegionalFuelCode,
        {
          averagePrice: number | null;
          fuelType: RegionalFuelCode;
        }
      >(),
    };
  }

  const snapshotDate = await ensureRegionalFuelPrices();
  if (!snapshotDate) {
    return {
      snapshotDate: null,
      benchmarks: new Map<
        RegionalFuelCode,
        {
          averagePrice: number | null;
          fuelType: RegionalFuelCode;
        }
      >(),
    };
  }

  const snapshots = await db.fuelPriceSnapshot.findMany({
    where: {
      snapshotDate,
      region,
      serviceType: "SELF",
    },
    select: {
      fuelType: true,
      averagePrice: true,
    },
  });

  return {
    snapshotDate,
    benchmarks: new Map(
      snapshots.map((item) => [
        item.fuelType,
        {
          fuelType: item.fuelType,
          averagePrice: item.averagePrice,
        },
      ]),
    ),
  };
}
