import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
} from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Email non valida." }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    scope: "auth:forgot-password",
    key: `${ip}:${normalizedEmail}`,
    limit: 5,
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
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
    },
  });

  let devResetUrl: string | undefined;
  if (user) {
    const { token } = await createPasswordResetToken(user.id);
    devResetUrl = buildPasswordResetUrl(token, request);

    if (process.env.NODE_ENV !== "production") {
      console.info("[password-reset]", {
        email: user.email,
        resetUrl: devResetUrl,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Se l'email esiste, riceverai istruzioni per il reset.",
    resetUrl: process.env.NODE_ENV !== "production" ? devResetUrl : undefined,
  });
}
