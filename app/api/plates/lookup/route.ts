import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupPlate } from "@/lib/plate-lookup";

const schema = z.object({
  plate: z.string().min(5).max(10),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Targa non valida." }, { status: 400 });
  }

  const result = lookupPlate(parsed.data.plate);
  if (!result) {
    return NextResponse.json({
      found: false,
      message: "Nessun dato trovato. Inserisci manualmente.",
    });
  }

  return NextResponse.json({ found: true, data: result });
}
