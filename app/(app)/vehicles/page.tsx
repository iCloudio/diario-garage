import Link from "next/link";
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
          <h2 className="text-2xl font-semibold">Veicoli</h2>
          <p className="text-sm text-zinc-400">
            Tieni traccia di bollo, revisione e assicurazione.
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">Aggiungi veicolo</Link>
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <p className="text-sm text-zinc-400">Nessun veicolo registrato.</p>
          <Link className="mt-3 inline-block text-sm text-white" href="/vehicles/new">
            Inizia ora →
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-white/10 bg-black/40 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{vehicle.plate}</h3>
                  <p className="text-sm text-zinc-400">
                    {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vehicle.deadlines.length === 0 ? (
                    <Badge variant="secondary">Nessuna scadenza</Badge>
                  ) : (
                    vehicle.deadlines.map((deadline) => (
                      <Badge key={deadline.id} variant="outline">
                        {deadline.type} · {deadline.dueDate.toLocaleDateString("it-IT")}
                      </Badge>
                    ))
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
