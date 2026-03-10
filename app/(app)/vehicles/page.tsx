import Link from "next/link";
import { CalendarClock, Car, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Garage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">I tuoi veicoli</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Uno o più veicoli, scadenze sempre visibili.
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi veicolo
          </Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex items-center gap-3 text-zinc-300">
            <Car className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-white">Nessun veicolo registrato</p>
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
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-white/10 bg-black/40 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-zinc-300" />
                    <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {vehicle.deadlines.length === 0 ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />0 scadenze
                    </Badge>
                  ) : (
                    <>
                      {vehicle.deadlines.map((deadline) => (
                        <Badge key={deadline.id} variant="outline">
                          {deadline.type} · {deadline.dueDate.toLocaleDateString("it-IT")}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {vehicle.deadlines.length} scadenze
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
