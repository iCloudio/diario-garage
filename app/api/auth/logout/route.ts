import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clearSessionCookieOnResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("dg_session")?.value;

  if (token) {
    await db.session.delete({ where: { id: token } }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookieOnResponse(response);

  return response;
}
