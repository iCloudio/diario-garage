import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Troppi tentativi. Riprova tra qualche minuto." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await db.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) {
    return NextResponse.json({ error: "Email o password errate." }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "Email o password errate." }, { status: 401 });
  }

  const { token, expiresAt } = await createSession(user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return response;
}
