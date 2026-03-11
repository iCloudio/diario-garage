import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { syncRegionalFuelPrices } from "@/lib/fuel-prices";

function isAuthorizedBySecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const bearer = request.headers.get("authorization");
  return bearer === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  const isAuthorized = Boolean(session) || isAuthorizedBySecret(request);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  try {
    const snapshotDate = await syncRegionalFuelPrices();

    return NextResponse.json({
      ok: true,
      snapshotDate: snapshotDate.toISOString(),
    });
  } catch (error) {
    console.error("Errore sync prezzi carburante:", error);
    return NextResponse.json(
      { error: "Sincronizzazione non riuscita." },
      { status: 500 },
    );
  }
}
