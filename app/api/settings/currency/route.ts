import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logApiError } from "@/lib/error-handling";

const schema = z.object({
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valuta non valida." }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { currency: parsed.data.currency },
      select: { currency: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logApiError("settings/currency", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio." },
      { status: 500 }
    );
  }
}
