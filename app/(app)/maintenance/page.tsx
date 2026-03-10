import { Wrench, Plus, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const items = [
  {
    title: "Tagliando 60.000 km",
    date: "12/03/2026",
    cost: "€280",
    km: "60.120 km",
  },
  {
    title: "Cambio gomme estive",
    date: "05/10/2025",
    cost: "€120",
    km: "54.300 km",
  },
];

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Manutenzioni
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Storico interventi</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Traccia costi e km per ogni intervento.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi intervento
        </Button>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Wrench className="h-4 w-4" />
          <span className="font-medium text-foreground">Interventi recenti</span>
        </div>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.date} · {item.km}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>{item.cost}</span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Fattura
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: in MVP non si possono ancora aggiungere interventi.
        </p>
      </Card>
    </div>
  );
}
