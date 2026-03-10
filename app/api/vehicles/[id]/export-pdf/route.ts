import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { generateVehiclePDF } from "@/lib/pdf-generator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    // Recupera il veicolo con tutti i dati
    const vehicle = await db.vehicle.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: {
        deadlines: {
          where: { deletedAt: null },
          orderBy: { dueDate: "asc" },
        },
        refuels: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veicolo non trovato" },
        { status: 404 }
      );
    }

    // Genera il PDF
    const pdf = generateVehiclePDF(
      {
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuelType: vehicle.fuelType,
        odometerKm: vehicle.odometerKm,
        status: vehicle.status,
      },
      vehicle.deadlines,
      vehicle.refuels,
      vehicle.expenses
    );

    // Genera il buffer del PDF
    const pdfBuffer = pdf.output("arraybuffer");

    // Crea il filename
    const filename = `storico_${vehicle.plate.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

    // Ritorna il PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Errore generazione PDF:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione del PDF" },
      { status: 500 }
    );
  }
}
