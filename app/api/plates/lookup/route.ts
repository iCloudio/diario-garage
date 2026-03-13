import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupPlate } from "@/lib/plate-lookup";
import { getSession } from "@/lib/auth";
import { logApiError } from "@/lib/error-handling";

const schema = z.object({
  plate: z.string().min(5).max(10),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  let body = null;
  try {
    body = await request.json();
  } catch (error) {
    logApiError("plates/lookup - JSON parse", error);
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Targa non valida." }, { status: 400 });
  }

  const normalizedPlate = parsed.data.plate.replace(/\s+/g, "").toUpperCase();

  let result = null;
  try {
    result = await lookupPlate(normalizedPlate);
  } catch (error) {
    logApiError("plates/lookup - lookupPlate", error, { plate: normalizedPlate });
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Lookup targa non riuscito.",
      },
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
