import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati veicolo non validi." }, { status: 400 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
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
  const updated = await db.vehicle.update({
    where: { id: vehicle.id },
    data: {
      plate: plate ? plate.replace(/\s+/g, "").toUpperCase() : undefined,
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    select: { id: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const now = new Date();
  await db.$transaction(async (tx) => {
    // VehicleDriver non ha deletedAt, hard delete della tabella di giunzione
    await tx.vehicleDriver.deleteMany({
      where: { vehicleId: vehicle.id },
    });
    // Soft delete di tutti i dati collegati
    await tx.deadline.updateMany({
      where: { vehicleId: vehicle.id },
      data: { deletedAt: now },
    });
    await tx.refuel.updateMany({
      where: { vehicleId: vehicle.id },
      data: { deletedAt: now },
    });
    await tx.expense.updateMany({
      where: { vehicleId: vehicle.id },
      data: { deletedAt: now },
    });
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { deletedAt: now },
    });
  });

  return NextResponse.json({ ok: true });
}
