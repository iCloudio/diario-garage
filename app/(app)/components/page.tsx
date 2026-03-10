import { Gauge, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  { name: "Cinghia distribuzione", rule: "Ogni 120.000 km", status: "Programmata" },
  { name: "Freni", rule: "Ogni 60.000 km", status: "Monitoraggio" },
  { name: "Batteria", rule: "Ogni 4 anni", status: "Monitoraggio" },
  { name: "Filtri", rule: "Ogni 30.000 km", status: "Programmata" },
];

export default function ComponentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Componenti</p>
        <h2 className="mt-2 text-2xl font-semibold">Promemoria componenti</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Regole a km o anni per mantenere l&apos;auto in ordine.
        </p>
      </div>

      <Card className="border-white/10 bg-black/40 p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Wrench className="h-4 w-4" />
          <span className="font-medium text-white">Regole attive</span>
        </div>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          {items.map((item) => (
            <div key={item.name} className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.rule}</p>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3 text-zinc-400" />
                <Badge variant="secondary">{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: regole personalizzate in Fase 3.
        </p>
      </Card>
    </div>
  );
}
