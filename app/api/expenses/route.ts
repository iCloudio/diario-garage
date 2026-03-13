import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  category: z.enum([
    "RIFORNIMENTO",
    "MANUTENZIONE",
    "ASSICURAZIONE",
    "BOLLO",
    "MULTA",
    "PARCHEGGIO",
    "LAVAGGIO",
    "PEDAGGI",
    "ALTRO",
  ]),
  amountEur: z.coerce.number().positive(),
  odometerKm: z.coerce.number().int().nonnegative().optional().nullable(),
  description: z.string().max(500).optional().or(z.literal("")),
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
    return NextResponse.json({ error: "Dati spesa non validi." }, { status: 400 });
  }

  const { vehicleId, date, category, amountEur, odometerKm, description, notes } =
    parsed.data;

  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const expense = await db.expense.create({
    data: {
      vehicleId,
      date: new Date(date),
      category,
      amountEur,
      odometerKm: odometerKm ?? null,
      description: description || null,
      notes: notes || null,
    },
  });

  if (odometerKm != null && odometerKm > (vehicle.odometerKm ?? 0)) {
    await db.vehicle.update({
      where: { id: vehicleId },
      data: { odometerKm },
    });
  }

  return NextResponse.json(expense);
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

  const expenses = await db.expense.findMany({
    where: { vehicleId, deletedAt: null },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(expenses);
}
