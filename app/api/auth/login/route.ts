import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { applySessionCookie, createSession, normalizeEmail } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = normalizeEmail(email);
  const rateLimit = checkRateLimit({
    scope: "auth:login",
    key: `${getClientIp(request)}:${normalizedEmail}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Troppi tentativi. Riprova tra poco." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.retryAfterMs / 1000).toString(),
        },
      },
    );
  }

  const user = await db.user.findFirst({
    where: { email: normalizedEmail, deletedAt: null },
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
  applySessionCookie(response, token, expiresAt);

  return response;
}
