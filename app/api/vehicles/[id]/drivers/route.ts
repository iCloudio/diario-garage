import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const createDriverSchema = z.object({
  mode: z.literal("create"),
  name: z.string().trim().min(2).max(80),
  licenseExpiry: z.string().date(),
});

const assignExistingDriverSchema = z.object({
  mode: z.literal("assign"),
  driverId: z.string().min(1),
});

const requestSchema = z.union([createDriverSchema, assignExistingDriverSchema]);

const deleteSchema = z.object({
  driverId: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: session.userId, deletedAt: null },
    select: { id: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dati guidatore non validi." }, { status: 400 });
  }

  if (parsed.data.mode === "assign") {
    const driver = await db.driver.findFirst({
      where: { id: parsed.data.driverId, userId: session.userId, deletedAt: null },
      select: { id: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "Guidatore non trovato." }, { status: 404 });
    }

    await db.vehicleDriver.upsert({
      where: {
        vehicleId_driverId: {
          vehicleId: vehicle.id,
          driverId: driver.id,
        },
      },
      update: {},
      create: {
        vehicleId: vehicle.id,
        driverId: driver.id,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const driver = await db.driver.create({
    data: {
      userId: session.userId,
      name: parsed.data.name,
      licenseExpiry: new Date(parsed.data.licenseExpiry),
      vehicles: {
        create: {
          vehicleId: vehicle.id,
        },
      },
    },
  });

  return NextResponse.json({ driver });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: session.userId, deletedAt: null },
    select: { id: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veicolo non trovato." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  const driver = await db.driver.findFirst({
    where: { id: parsed.data.driverId, userId: session.userId, deletedAt: null },
    select: { id: true },
  });

  if (!driver) {
    return NextResponse.json({ error: "Guidatore non trovato." }, { status: 404 });
  }

  await db.vehicleDriver.deleteMany({
    where: {
      vehicleId: vehicle.id,
      driverId: driver.id,
    },
  });

  return NextResponse.json({ ok: true });
}
