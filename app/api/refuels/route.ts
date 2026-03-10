import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

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
    } = body;

    // Verifica che il veicolo appartenga all'utente
    const vehicle = await db.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id, deletedAt: null },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veicolo non trovato" },
        { status: 404 }
      );
    }

    // Crea il rifornimento
    const refuel = await db.refuel.create({
      data: {
        vehicleId,
        date: new Date(date),
        liters: liters ? parseFloat(liters) : null,
        kwh: kwh ? parseFloat(kwh) : null,
        litersPrimary: litersPrimary ? parseFloat(litersPrimary) : null,
        litersSecondary: litersSecondary ? parseFloat(litersSecondary) : null,
        amountEur: parseFloat(amountEur),
        odometerKm: parseInt(odometerKm),
        fuelType,
        pricePerLiter: pricePerLiter ? parseFloat(pricePerLiter) : null,
        notes,
      },
    });

    // Aggiorna il chilometraggio del veicolo se maggiore
    if (odometerKm > (vehicle.odometerKm || 0)) {
      await db.vehicle.update({
        where: { id: vehicleId },
        data: { odometerKm: parseInt(odometerKm) },
      });
    }

    return NextResponse.json(refuel);
  } catch (error) {
    console.error("Errore creazione rifornimento:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "vehicleId mancante" },
        { status: 400 }
      );
    }

    // Verifica che il veicolo appartenga all'utente
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
    console.error("Errore recupero rifornimenti:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero" },
      { status: 500 }
    );
  }
}
