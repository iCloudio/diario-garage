import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80),
  licenseExpiry: z.string().date(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dati guidatore non validi." }, { status: 400 });
  }

  const driver = await db.driver.findFirst({
    where: { id, userId: session.userId, deletedAt: null },
    select: { id: true },
  });

  if (!driver) {
    return NextResponse.json({ error: "Guidatore non trovato." }, { status: 404 });
  }

  const updated = await db.driver.update({
    where: { id: driver.id },
    data: {
      name: parsed.data.name,
      licenseExpiry: new Date(parsed.data.licenseExpiry),
    },
  });

  return NextResponse.json({ driver: updated });
}
