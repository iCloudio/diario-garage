import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("dg_session")?.value;

  if (token) {
    await db.session.delete({ where: { id: token } }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("dg_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
