import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  liters: z.coerce.number().positive().optional().nullable(),
  kwh: z.coerce.number().positive().optional().nullable(),
  litersPrimary: z.coerce.number().positive().optional().nullable(),
  litersSecondary: z.coerce.number().positive().optional().nullable(),
  amountEur: z.coerce.number().positive(),
  odometerKm: z.coerce.number().int().nonnegative(),
  fuelType: z.enum([
    "BENZINA",
    "DIESEL",
    "GPL",
    "METANO",
    "ELETTRICO",
    "IBRIDO_BENZINA",
    "IBRIDO_DIESEL",
  ]),
  pricePerLiter: z.coerce.number().positive().optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati rifornimento non validi." }, { status: 400 });
  }

  const {
    vehicleId,
    date,
    liters,
    kwh,
    litersPrimary,
    litersSecondary,
    amountEur,
    odometerKm,
    fuelType,
    pricePerLiter,
    notes,
  } = parsed.data;

  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const refuel = await db.refuel.create({
    data: {
      vehicleId,
      date: new Date(date),
      liters: liters ?? null,
      kwh: kwh ?? null,
      litersPrimary: litersPrimary ?? null,
      litersSecondary: litersSecondary ?? null,
      amountEur,
      odometerKm,
      fuelType,
      pricePerLiter: pricePerLiter ?? null,
      notes: notes || null,
    },
  });

  if (odometerKm > (vehicle.odometerKm ?? 0)) {
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { odometerKm },
    });
  }

  return NextResponse.json(refuel);
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");

  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId mancante." }, { status: 400 });
  }

  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const refuels = await db.refuel.findMany({
    where: { vehicleId, deletedAt: null },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(refuels);
}
