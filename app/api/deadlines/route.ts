import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const deadlineInputSchema = z.object({
  type: z.enum(["BOLLO", "REVISIONE", "ASSICURAZIONE"]),
  dueDate: z.string().optional().or(z.literal("")),
  amount: z
    .preprocess((value) => {
      if (value === "" || value === undefined || value === null) return null;
      if (typeof value === "string") return Number(value);
      return value;
    }, z.number().min(0).nullable().optional())
    .nullable()
    .optional(),
});

const updateSchema = z.object({
  vehicleId: z.string(),
  deadlines: z.array(deadlineInputSchema),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const deadlines = await db.deadline.findMany({
    where: {
      vehicle: {
        userId: user.id,
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      vehicle: {
        select: { id: true, plate: true, make: true, model: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ deadlines });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati scadenze non validi." }, { status: 400 });
  }

  const { vehicleId, deadlines } = parsed.data;
  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  await Promise.all(
    deadlines.map(async (item) => {
      if (!item.dueDate) {
        await db.deadline.deleteMany({
          where: { vehicleId: vehicle.id, type: item.type },
        });
        return;
      }

      const dueDate = new Date(item.dueDate);
      await db.deadline.upsert({
        where: {
          vehicleId_type: {
            vehicleId: vehicle.id,
            type: item.type,
          },
        },
        update: {
          dueDate,
          amount: item.amount ?? null,
          deletedAt: null,
        },
        create: {
          vehicleId: vehicle.id,
          type: item.type,
          dueDate,
          amount: item.amount ?? null,
        },
      });
    })
  );

  return NextResponse.json({ ok: true });
}
