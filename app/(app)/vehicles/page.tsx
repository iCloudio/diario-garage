import Link from "next/link";
import { Car, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function VehiclesPage() {
  const user = await requireUser();
  const vehicles = await db.vehicle.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const vehicle = vehicles[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Garage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Il tuo veicolo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Inserisci targa, marca e modello. Poi completa le scadenze principali.
          </p>
        </div>
        {!vehicle && (
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi veicolo
            </Link>
          </Button>
        )}
      </div>

      {!vehicle ? (
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Car className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-foreground">Nessun veicolo registrato</p>
              <p className="text-xs text-muted-foreground">
                Inserisci una targa per attivare le scadenze.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/vehicles/new">Aggiungi veicolo</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card className="border-border bg-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                </p>
              </div>
              <Badge variant="secondary">Veicolo unico (MVP)</Badge>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Configura</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Button asChild variant="secondary">
                <Link href={`/vehicles/${vehicle.id}/deadlines`}>Scadenze</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/vehicles/${vehicle.id}/maintenance`}>Manutenzioni</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/vehicles/${vehicle.id}/tires`}>Gomme</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/vehicles/${vehicle.id}/components`}>Componenti</Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
