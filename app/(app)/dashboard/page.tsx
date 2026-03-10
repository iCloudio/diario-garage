import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await requireUser();
  const vehicles = await db.vehicle.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const upcoming = await db.deadline.findMany({
    where: {
      vehicle: { userId: user.id, deletedAt: null },
      deletedAt: null,
      dueDate: { gte: new Date() },
    },
    include: {
      vehicle: { select: { plate: true, make: true, model: true } },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Panoramica</h2>
          <p className="text-sm text-zinc-400">
            Veicoli attivi e prossime scadenze a colpo d'occhio.
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">Aggiungi veicolo</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-black/40 p-6">
          <p className="text-sm text-zinc-400">Veicoli attivi</p>
          <p className="mt-2 text-3xl font-semibold">{vehicles.length}</p>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            {vehicles.length === 0 ? (
              <p>Nessun veicolo ancora registrato.</p>
            ) : (
              vehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between">
                  <span>
                    {vehicle.plate} · {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                  </span>
                  <Badge variant="secondary">Attivo</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="border-white/10 bg-black/40 p-6">
          <p className="text-sm text-zinc-400">Scadenze imminenti</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {upcoming.length === 0 ? (
              <p>Nessuna scadenza imminente.</p>
            ) : (
              upcoming.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{deadline.type}</p>
                    <p className="text-xs text-zinc-500">
                      {deadline.vehicle.plate} · {deadline.vehicle.make ?? ""} {deadline.vehicle.model ?? ""}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {deadline.dueDate.toLocaleDateString("it-IT")}
                  </Badge>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link className="text-xs text-zinc-400 hover:text-white" href="/deadlines">
              Vedi tutte le scadenze →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
