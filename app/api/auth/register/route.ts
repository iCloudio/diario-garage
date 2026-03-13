import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
  name: z.string().max(100).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`register:${ip}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Troppi tentativi. Riprova tra qualche ora." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dati non validi." }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const existing = await db.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Email già registrata." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name: name?.trim() || null,
    },
  });

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
