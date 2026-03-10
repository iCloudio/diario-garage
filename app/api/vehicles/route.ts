import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const deadlineSchema = z.object({
  type: z.enum(["BOLLO", "REVISIONE", "ASSICURAZIONE"]),
  dueDate: z.string().min(4),
});

const schema = z.object({
  plate: z.string().min(5).max(10),
  make: z.string().max(60).optional().or(z.literal("")),
  model: z.string().max(60).optional().or(z.literal("")),
  year: z
    .preprocess((value) => {
      if (value === "" || value === undefined || value === null) return undefined;
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().int().min(1900).max(new Date().getFullYear() + 1).optional())
    .optional(),
  deadlines: z.array(deadlineSchema).optional(),
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

  const { plate, make, model, year, deadlines } = parsed.data;
  const created = await db.vehicle.create({
    data: {
      userId: session.userId,
      plate: plate.replace(/\s+/g, "").toUpperCase(),
      make: make?.trim() || null,
      model: model?.trim() || null,
      year: year ?? null,
      deadlines: deadlines?.length
        ? {
            create: deadlines.map((item) => ({
              type: item.type,
              dueDate: new Date(item.dueDate),
            })),
          }
        : undefined,
    },
    include: {
      deadlines: true,
    },
  });

  return NextResponse.json({ vehicle: created });
}
