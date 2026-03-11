import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  currency: z.enum(["EUR", "USD", "GBP", "CHF"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
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
    console.error("Errore aggiornamento valuta:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio." },
      { status: 500 }
    );
  }
}
