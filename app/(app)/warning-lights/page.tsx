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

export default function WarningLightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Spie</p>
        <h2 className="mt-2 text-2xl font-semibold">Manuale spie</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Trova rapidamente il significato di una spia.
        </p>
      </div>

      <Card className="border-white/10 bg-black/40 p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <Search className="h-4 w-4" />
          <Input placeholder="Cerca una spia" />
        </div>
        <div className="mt-4 space-y-3 text-sm text-zinc-300">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                <span className="font-medium text-white">{item.name}</span>
              </div>
              <Badge variant="secondary">{item.level}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: database completo spie in Fase 2.
        </p>
      </Card>
    </div>
  );
}
