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
      category,
      amountEur,
      odometerKm,
      description,
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

    // Crea la spesa
    const expense = await db.expense.create({
      data: {
        vehicleId,
        date: new Date(date),
        category,
        amountEur: parseFloat(amountEur),
        odometerKm: odometerKm ? parseInt(odometerKm) : null,
        description,
        notes,
      },
    });

    // Aggiorna il chilometraggio del veicolo se specificato e maggiore
    if (odometerKm && odometerKm > (vehicle.odometerKm || 0)) {
      await db.vehicle.update({
        where: { id: vehicleId },
        data: { odometerKm: parseInt(odometerKm) },
      });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Errore creazione spesa:", error);
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

    const expenses = await db.expense.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Errore recupero spese:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero" },
      { status: 500 }
    );
  }
}
