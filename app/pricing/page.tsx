import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "0€",
    period: "/anno",
    highlight: "Per iniziare",
    features: [
      "1 veicolo",
      "1 guidatore",
      "Scadenze base",
      "Reminder email",
    ],
    cta: "Inizia gratis",
    href: "/register",
  },
  {
    name: "Family",
    price: "49€",
    period: "/anno",
    highlight: "Piu scelto",
    features: [
      "Fino a 7 veicoli",
      "Fino a 5 guidatori",
      "Scadenze avanzate",
      "Manutenzioni complete",
      "Statistiche base",
    ],
    cta: "Passa a Family",
    href: "/register",
  },
  {
    name: "Business",
    price: "249€",
    period: "/anno",
    highlight: "Per flotte",
    features: [
      "Fino a 20 veicoli",
      "Fino a 30 guidatori",
      "Incidenti e multe",
      "Reportistica avanzata",
      "Export CSV/PDF",
    ],
    cta: "Contattaci",
    href: "/register",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Piani</p>
          <h1 className="mt-3 text-3xl font-semibold">
            Un piano chiaro per ogni garage.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Parti gratis. Passa a Family quando gestisci piu veicoli o guidatori.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className="border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <Badge variant="secondary">{plan.highlight}</Badge>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
