import { BarChart3, Fuel, Wrench, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const kpis = [
  { label: "Spesa totale 2026", value: "€1.840" },
  { label: "Km annuali", value: "12.400" },
  { label: "Costo per km", value: "€0,15" },
];

const breakdown = [
  { label: "Carburante", value: "45%", icon: Fuel },
  { label: "Manutenzione", value: "30%", icon: Wrench },
  { label: "Assicurazione", value: "15%", icon: ShieldCheck },
  { label: "Altro", value: "10%", icon: BarChart3 },
];

export default function VehicleStatisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Statistiche</p>
        <h2 className="mt-2 text-2xl font-semibold">Panoramica annuale</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Costi, km e percentuali in modo semplice.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <Card key={item.label} className="border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span className="font-medium text-foreground">Spese per categoria</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <span className="text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sezione in sviluppo: grafici interattivi in Fase 3.
        </p>
      </Card>
    </div>
  );
}
