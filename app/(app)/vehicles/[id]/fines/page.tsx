import { Ticket, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fines = [
  { title: "Sosta vietata", date: "05/02/2026", amount: "€42", status: "Pagata" },
  { title: "ZTL", date: "18/11/2025", amount: "€90", status: "In revisione" },
];

export default function VehicleFinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Multe</p>
        <h2 className="mt-2 text-2xl font-semibold">Registro multe</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tieni traccia dei costi e dello stato.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="space-y-3 text-sm text-muted-foreground">
          {fines.map((fine) => (
            <div key={fine.title} className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Ticket className="h-4 w-4" />
                  {fine.title}
                </p>
                <p className="text-xs text-muted-foreground">{fine.date}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{fine.amount}</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {fine.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Sezione in sviluppo: gestione multe in Fase 3.
        </p>
      </Card>
    </div>
  );
}
