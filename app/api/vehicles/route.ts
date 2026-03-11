import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  plate: z.string().min(5).max(10),
  make: z.string().max(60).optional().or(z.literal("")),
  model: z.string().max(60).optional().or(z.literal("")),
  odometerKm: z.coerce.number().int().nonnegative().optional(),
  type: z.enum(["AUTO", "MOTO", "CAMPER"]).optional(),
  fuelType: z.enum(["BENZINA", "DIESEL", "GPL", "METANO", "ELETTRICO", "IBRIDO_BENZINA", "IBRIDO_DIESEL"]).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const token = request.cookies.get("dg_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const session = await db.session.findUnique({ where: { id: token } });
  if (!session || session.expiresAt < new Date()) {
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
  const token = request.cookies.get("dg_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const session = await db.session.findUnique({ where: { id: token } });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati veicolo non validi." }, { status: 400 });
  }

  const { plate, make, model, odometerKm, type, fuelType } = parsed.data;
  const created = await db.vehicle.create({
    data: {
      userId: session.userId,
      plate: plate.replace(/\s+/g, "").toUpperCase(),
      make: make?.trim() || null,
      model: model?.trim() || null,
      odometerKm: odometerKm ?? null,
      type: type ?? "AUTO",
      fuelType: fuelType ?? null,
    },
  });

  return NextResponse.json({ vehicle: created });
}
