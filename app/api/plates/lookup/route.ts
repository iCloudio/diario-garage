import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupPlate } from "@/lib/plate-lookup";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  plate: z.string().min(5).max(10),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`plate-lookup:${session.userId}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Troppi lookup. Riprova tra qualche ora." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Targa non valida." }, { status: 400 });
  }

  const normalizedPlate = parsed.data.plate.replace(/\s+/g, "").toUpperCase();

  let result = null;
  try {
    result = await lookupPlate(normalizedPlate);
  } catch (error) {
    console.error("Plate lookup error:", error);
    return NextResponse.json(
      { error: "Lookup targa non riuscito." },
      { status: 502 },
    );
  }

  if (!result) {
    return NextResponse.json({
      found: false,
      message: "Nessun dato trovato. Inserisci manualmente.",
    });
  }

  return NextResponse.json({
    found: true,
    cacheId: result.cacheId,
    data: result,
  });
}
