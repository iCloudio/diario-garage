import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  buildInsuranceDeadlineFromLookup,
  buildVehicleDataFromLookup,
  getPlateLookupCacheById,
} from "@/lib/plate-lookup";

const optionalIntegerField = z.preprocess((value) => {
  if (value === "" || value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? undefined : Number(trimmed);
  }
  return value;
}, z.number().int().nonnegative().optional());

const schema = z.object({
  plate: z.string().trim().min(5).max(10),
  make: z.string().max(60).nullish(),
  model: z.string().max(60).nullish(),
  modelDetail: z.string().max(160).nullish(),
  firstRegistrationDate: z.string().nullish(),
  odometerKm: optionalIntegerField,
  type: z.enum(["AUTO", "MOTO", "CAMPER"]).optional(),
  fuelType: z.enum(["BENZINA", "DIESEL", "GPL", "METANO", "ELETTRICO", "IBRIDO_BENZINA", "IBRIDO_DIESEL"]).nullable().optional(),
  plateLookupCacheId: z.string().min(1).nullish(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const vehicles = await db.vehicle.findMany({
    where: {
      userId: session.userId,
      deletedAt: null,
    },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati veicolo non validi." }, { status: 400 });
  }

  const {
    plate,
    make,
    model,
    modelDetail,
    firstRegistrationDate,
    odometerKm,
    type,
    fuelType,
    plateLookupCacheId,
  } = parsed.data;
  const normalizedPlate = plate.replace(/\s+/g, "").toUpperCase();
  const existingVehicle = await db.vehicle.findFirst({
    where: {
      userId: session.userId,
      plate: normalizedPlate,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existingVehicle) {
    return NextResponse.json(
      { error: "Esiste già un veicolo con questa targa." },
      { status: 409 },
    );
  }

  const plateLookupCache = plateLookupCacheId
    ? await getPlateLookupCacheById(plateLookupCacheId)
    : null;

  if (plateLookupCache && plateLookupCache.plate !== normalizedPlate) {
    return NextResponse.json(
      { error: "I dati lookup non corrispondono alla targa inserita." },
      { status: 400 },
    );
  }

  const insuranceDeadline = plateLookupCache
    ? buildInsuranceDeadlineFromLookup(plateLookupCache)
    : null;
  const lookupVehicleData = plateLookupCache
    ? buildVehicleDataFromLookup(plateLookupCache)
    : null;
  const parsedFirstRegistrationDate = firstRegistrationDate?.trim()
    ? new Date(firstRegistrationDate)
    : null;
  const safeFirstRegistrationDate =
    parsedFirstRegistrationDate && !Number.isNaN(parsedFirstRegistrationDate.getTime())
      ? parsedFirstRegistrationDate
      : null;

  const created = await db.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.create({
      data: {
        userId: session.userId,
        plate: normalizedPlate,
        make: make?.trim() || lookupVehicleData?.make || null,
        model: model?.trim() || lookupVehicleData?.model || null,
        modelDetail: modelDetail?.trim() || lookupVehicleData?.modelDetail || null,
        firstRegistrationDate:
          safeFirstRegistrationDate ?? lookupVehicleData?.firstRegistrationDate ?? null,
        odometerKm: odometerKm ?? null,
        type: type ?? lookupVehicleData?.type ?? "AUTO",
        fuelType: fuelType ?? lookupVehicleData?.fuelType ?? null,
        powerKw: lookupVehicleData?.powerKw ?? null,
        powerHp: lookupVehicleData?.powerHp ?? null,
        cubicCapacity: lookupVehicleData?.cubicCapacity ?? null,
        alarmSystemType: lookupVehicleData?.alarmSystemType ?? null,
        listPriceAmount: lookupVehicleData?.listPriceAmount ?? null,
        listPriceCurrency: lookupVehicleData?.listPriceCurrency ?? null,
        environmentalClass: lookupVehicleData?.environmentalClass ?? null,
        insuranceCompany: lookupVehicleData?.insuranceCompany ?? null,
        insurancePolicyNumber: lookupVehicleData?.insurancePolicyNumber ?? null,
        insurancePresent: lookupVehicleData?.insurancePresent ?? null,
        insuranceSuspended: lookupVehicleData?.insuranceSuspended ?? null,
        insuranceCompartmentExpiry:
          lookupVehicleData?.insuranceCompartmentExpiry ?? null,
      },
    });

    if (insuranceDeadline) {
      await tx.deadline.create({
        data: {
          vehicleId: vehicle.id,
          type: "ASSICURAZIONE",
          dueDate: insuranceDeadline.dueDate,
          notes: insuranceDeadline.notes,
        },
      });
    }

    return vehicle;
  });

  return NextResponse.json({ vehicle: created });
}
