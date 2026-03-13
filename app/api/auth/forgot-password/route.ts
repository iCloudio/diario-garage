import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Email non valida." }, { status: 400 });
  }

  normalizeEmail(parsed.data.email);

  return NextResponse.json({
    ok: true,
    message: "Se l'email esiste, riceverai istruzioni per il reset.",
  });
}
