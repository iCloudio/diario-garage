import { Gauge, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const items = [
  { name: "Cinghia distribuzione", rule: "Ogni 120.000 km", status: "Programmata" },
  { name: "Freni", rule: "Ogni 60.000 km", status: "Monitoraggio" },
  { name: "Batteria", rule: "Ogni 4 anni", status: "Monitoraggio" },
  { name: "Filtri", rule: "Ogni 30.000 km", status: "Programmata" },
];

export default function VehicleComponentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Componenti</p>
        <h2 className="mt-2 text-2xl font-semibold">Promemoria componenti</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Regole a km o anni per mantenere l&apos;auto in ordine.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wrench className="h-4 w-4" />
          <span className="font-medium text-foreground">Regole attive</span>
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <div key={item.name} className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.rule}</p>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3 text-muted-foreground" />
                <Badge variant="secondary">{item.status}</Badge>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sezione in sviluppo: regole personalizzate in Fase 3.
        </p>
      </Card>
    </div>
  );
}
