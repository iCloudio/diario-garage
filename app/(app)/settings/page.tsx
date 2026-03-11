import Link from "next/link";
import { User, Bell, CreditCard, BadgePercent, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySettingsForm } from "@/components/currency-settings-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const items = [
  { label: "Profilo", href: "/settings/profile", icon: User },
  { label: "Notifiche", href: "/settings/notifications", icon: Bell },
  { label: "Piano e fatturazione", href: "/settings/billing", icon: CreditCard },
  { label: "Piani", href: "/pricing", icon: BadgePercent },
  { label: "Sitemap", href: "/sitemap", icon: Map },
];

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { currency: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Impostazioni</p>
        <h2 className="mt-2 text-2xl font-semibold">Preferenze e piano</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestisci profilo e notifiche.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <Link key={item.href} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/30" href={item.href}>
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">Apri</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sezione in sviluppo: impostazioni complete in Fase 3.
        </p>
      </Card>

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
    </div>
  );
}
