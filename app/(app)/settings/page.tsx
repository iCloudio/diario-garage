import Link from "next/link";
import { User, Bell, CreditCard, BadgePercent, Map } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  { label: "Profilo", href: "/settings/profile", icon: User },
  { label: "Notifiche", href: "/settings/notifications", icon: Bell },
  { label: "Piano e fatturazione", href: "/settings/billing", icon: CreditCard },
  { label: "Piani", href: "/pricing", icon: BadgePercent },
  { label: "Sitemap", href: "/sitemap", icon: Map },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Impostazioni</p>
        <h2 className="mt-2 text-2xl font-semibold">Preferenze e piano</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Gestisci profilo e notifiche.
        </p>
      </div>

      <Card className="border-white/10 bg-black/40 p-6">
        <div className="space-y-3 text-sm text-zinc-300">
          {items.map((item) => (
            <Link key={item.href} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20" href={item.href}>
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <span className="text-xs text-zinc-500">Apri</span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: impostazioni complete in Fase 3.
        </p>
      </Card>
    </div>
  );
}
