import Link from "next/link";
import { Car, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleDeadlinesForm } from "@/components/vehicle-deadlines-form";

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
  const deadlineInputs = vehicle
    ? vehicle.deadlines.map((deadline) => ({
        type: deadline.type,
        dueDate: deadline.dueDate.toISOString().slice(0, 10),
        amount: deadline.amount ?? null,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Garage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Il tuo veicolo</h2>
          <p className="mt-2 text-sm text-zinc-400">
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
          <div className="flex items-center gap-3 text-zinc-300">
            <Car className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-foreground">Nessun veicolo registrato</p>
              <p className="text-xs text-zinc-400">
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
                  <Car className="h-4 w-4 text-zinc-300" />
                  <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                </div>
                <p className="text-sm text-zinc-400">
                  {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                </p>
              </div>
              <div className="text-xs text-zinc-400">
                In questa versione puoi gestire un solo veicolo.
              </div>
            </div>
          </Card>

          <VehicleDeadlinesForm vehicleId={vehicle.id} deadlines={deadlineInputs} />
        </div>
      )}
    </div>
  );
}
