import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    scope: "auth:reset-password",
    key: ip,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      {
        error: "Troppi tentativi. Riprova tra poco.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.retryAfterMs / 1000).toString(),
        },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dati non validi." },
      { status: 400 },
    );
  }

  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

  if (!result) {
    return NextResponse.json(
      { error: "Link di reset non valido o scaduto." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
