import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const incidents = [
  { title: "Tamponamento", date: "22/01/2026", cost: "€900", covered: "€700" },
  { title: "Cristallo rotto", date: "15/07/2025", cost: "€350", covered: "€350" },
];

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Incidenti</p>
        <h2 className="mt-2 text-2xl font-semibold">Registro sinistri</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Tieni traccia dei costi e di quanto coperto dall&apos;assicurazione.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="space-y-3 text-sm text-zinc-300">
          {incidents.map((incident) => (
            <div key={incident.title} className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-300" />
                  {incident.title}
                </p>
                <p className="text-xs text-zinc-500">{incident.date}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>Costo: {incident.cost}</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Coperto: {incident.covered}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: inserimento sinistri in Fase 3.
        </p>
      </Card>
    </div>
  );
}
