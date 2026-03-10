import { Snowflake, Sun, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VehicleTiresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Gomme</p>
          <h2 className="mt-2 text-2xl font-semibold">Cambio stagionale</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reminder per cambio estive/invernali o sostituzione gomme.
          </p>
        </div>
        <Button disabled>
          <RefreshCw className="mr-2 h-4 w-4" />
          Aggiorna stato
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sun className="h-4 w-4" />
            <span className="font-medium text-foreground">Gomme estive</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ultimo cambio: 05/04/2025
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Reminder automatico a ottobre.
          </p>
        </Card>
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Snowflake className="h-4 w-4" />
            <span className="font-medium text-foreground">Gomme invernali</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ultimo cambio: 18/10/2024
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Reminder automatico ad aprile.
          </p>
        </Card>
      </div>

      <Card className="border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Sezione in sviluppo: gestione gomme avanzata in Fase 2.
        </p>
      </Card>
    </div>
  );
}
