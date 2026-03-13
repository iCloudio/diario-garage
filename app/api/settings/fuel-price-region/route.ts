import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { FUEL_PRICE_REGIONS } from "@/lib/fuel-price-regions";
import { logApiError } from "@/lib/error-handling";

const schema = z.object({
  region: z.enum(FUEL_PRICE_REGIONS).nullable(),
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
      return NextResponse.json({ error: "Regione non valida." }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { fuelPriceRegion: parsed.data.region },
      select: { fuelPriceRegion: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logApiError("settings/fuel-price-region", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio." },
      { status: 500 },
    );
  }
}
