import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logApiError } from "@/lib/error-handling";

const refuelSchema = z.object({
  vehicleId: z.string().min(1),
  date: z.string().min(1),
  liters: z.coerce.number().positive().nullable().optional(),
  kwh: z.coerce.number().positive().nullable().optional(),
  litersPrimary: z.coerce.number().positive().nullable().optional(),
  litersSecondary: z.coerce.number().positive().nullable().optional(),
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
  pricePerLiter: z.coerce.number().positive().nullable().optional(),
  notes: z.string().max(500).nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = refuelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati rifornimento non validi." },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "Veicolo non trovato" },
        { status: 404 }
      );
    }

    const refuelDate = new Date(date);
    if (Number.isNaN(refuelDate.getTime())) {
      return NextResponse.json(
        { error: "Data rifornimento non valida." },
        { status: 400 },
      );
    }

    const refuel = await db.refuel.create({
      data: {
        vehicleId,
        date: refuelDate,
        liters: liters ?? null,
        kwh: kwh ?? null,
        litersPrimary: litersPrimary ?? null,
        litersSecondary: litersSecondary ?? null,
        amountEur,
        odometerKm,
        fuelType,
        pricePerLiter: pricePerLiter ?? null,
        notes: notes?.trim() || null,
      },
    });

    if (odometerKm > (vehicle.odometerKm || 0)) {
      await db.vehicle.update({
        where: { id: vehicleId },
        data: { odometerKm },
      });
    }

    return NextResponse.json(refuel);
  } catch (error) {
    logApiError("refuels/create", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId mancante" },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id, deletedAt: null },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veicolo non trovato" },
        { status: 404 }
      );
    }

    const refuels = await db.refuel.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(refuels);
  } catch (error) {
    logApiError("refuels/list", error);
    return NextResponse.json(
      { error: "Errore durante il recupero" },
      { status: 500 }
    );
  }
}
