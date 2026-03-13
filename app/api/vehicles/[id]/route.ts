import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  plate: z.string().min(5).max(10).optional(),
  make: z.string().max(60).optional().or(z.literal("")),
  model: z.string().max(60).optional().or(z.literal("")),
  modelDetail: z.string().max(160).optional().or(z.literal("")),
  firstRegistrationDate: z.string().nullable().optional(),
  odometerKm: z
    .coerce
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),
  type: z.enum(["AUTO", "MOTO", "CAMPER"]).optional(),
  fuelType: z.enum(["BENZINA", "DIESEL", "GPL", "METANO", "ELETTRICO", "IBRIDO_BENZINA", "IBRIDO_DIESEL"]).nullable().optional(),
  status: z.enum(["ATTIVO", "VENDUTO", "ROTTAMATO"]).optional(),
  soldDate: z.string().nullable().optional(),
  soldPrice: z.number().nullable().optional(),
  soldNotes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati veicolo non validi." }, { status: 400 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: session.userId, deletedAt: null },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
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
    status,
    soldDate,
    soldPrice,
    soldNotes,
  } = parsed.data;
  const normalizedPlate = plate ? plate.replace(/\s+/g, "").toUpperCase() : null;

  if (normalizedPlate && normalizedPlate !== vehicle.plate) {
    const duplicate = await db.vehicle.findFirst({
      where: {
        userId: session.userId,
        plate: normalizedPlate,
        deletedAt: null,
        id: { not: vehicle.id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Esiste già un veicolo con questa targa." },
        { status: 409 },
      );
    }
  }

  const updated = await db.vehicle.update({
    where: { id: vehicle.id },
    data: {
      plate: normalizedPlate ?? undefined,
      make: make === "" ? null : make?.trim(),
      model: model === "" ? null : model?.trim(),
      modelDetail: modelDetail === "" ? null : modelDetail?.trim(),
      firstRegistrationDate:
        firstRegistrationDate === undefined
          ? undefined
          : firstRegistrationDate
            ? new Date(firstRegistrationDate)
            : null,
      odometerKm: odometerKm === undefined ? undefined : odometerKm,
      type: type ?? undefined,
      fuelType: fuelType === undefined ? undefined : fuelType,
      status: status ?? undefined,
      soldDate: soldDate ? new Date(soldDate) : undefined,
      soldPrice: soldPrice === undefined ? undefined : soldPrice,
      soldNotes: soldNotes === undefined ? undefined : soldNotes,
    },
  });

  return NextResponse.json({ vehicle: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: session.userId, deletedAt: null },
    select: { id: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.vehicleDriver.deleteMany({
      where: { vehicleId: vehicle.id },
    });
    await tx.deadline.deleteMany({
      where: { vehicleId: vehicle.id },
    });
    await tx.refuel.deleteMany({
      where: { vehicleId: vehicle.id },
    });
    await tx.expense.deleteMany({
      where: { vehicleId: vehicle.id },
    });
    await tx.vehicle.delete({
      where: { id: vehicle.id },
    });
  });

  return NextResponse.json({ ok: true });
}
