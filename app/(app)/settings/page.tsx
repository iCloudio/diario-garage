import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySettingsForm } from "@/components/currency-settings-form";
import { FuelPriceRegionSettingsForm } from "@/components/fuel-price-region-settings-form";
import { FuelPriceSyncButton } from "@/components/fuel-price-sync-button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { currency: true, fuelPriceRegion: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Impostazioni</p>
        <h2 className="mt-2 text-2xl font-semibold">Impostazioni</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestisci tema e valuta dell&apos;app.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Tema</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Scegli il tema o usa quello del sistema.
        </p>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </Card>

      <Card className="border-border bg-card p-6">
        <CurrencySettingsForm initialCurrency={profile?.currency ?? "EUR"} />
      </Card>

      <Card className="border-border bg-card p-6">
        <FuelPriceRegionSettingsForm initialRegion={profile?.fuelPriceRegion ?? null} />
      </Card>

      <Card className="border-border bg-card p-6">
        <FuelPriceSyncButton />
      </Card>
    </div>
  );
}
