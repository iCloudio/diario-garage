import { AlertTriangle, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const items = [
  { name: "Spia motore", level: "Critica" },
  { name: "Pressione olio", level: "Critica" },
  { name: "ABS", level: "Attenzione" },
  { name: "Batteria", level: "Attenzione" },
];

export default function VehicleWarningLightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Spie</p>
        <h2 className="mt-2 text-2xl font-semibold">Manuale spie</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trova rapidamente il significato di una spia.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <Input placeholder="Cerca una spia" />
        </div>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <Badge variant="secondary">{item.level}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sezione in sviluppo: database completo spie in Fase 2.
        </p>
      </Card>
    </div>
  );
}
