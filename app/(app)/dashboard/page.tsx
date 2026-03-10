import Link from "next/link";
import { CalendarClock, Car, CheckCircle2, Plus, Target } from "lucide-react";
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

  const vehicleCount = await db.vehicle.count({
    where: { userId: user.id, deletedAt: null },
  });

  const now = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  const dueSoonCount = await db.deadline.count({
    where: {
      vehicle: { userId: user.id, deletedAt: null },
      deletedAt: null,
      dueDate: { gte: now, lte: in30 },
    },
  });

  const upcoming = await db.deadline.findMany({
    where: {
      vehicle: { userId: user.id, deletedAt: null },
      deletedAt: null,
      dueDate: { gte: now },
    },
    include: {
      vehicle: { select: { plate: true, make: true, model: true } },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  const primaryVehicle = vehicles[0];
  const nextVehicleDeadline = primaryVehicle
    ? await db.deadline.findFirst({
        where: {
          vehicleId: primaryVehicle.id,
          deletedAt: null,
          dueDate: { gte: now },
        },
        orderBy: { dueDate: "asc" },
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Il tuo garage sempre in regola.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Non trascurare la tua auto: manutenzione e scadenze sotto controllo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi veicolo
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/deadlines">Vai alle scadenze</Link>
          </Button>
        </div>
      </div>

      {vehicleCount === 0 ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex items-center gap-3 text-zinc-300">
            <Target className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-white">
                Inizia dal tuo primo veicolo
              </p>
              <p className="text-xs text-zinc-400">
                Inserisci una targa per attivare scadenze e manutenzione.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/vehicles/new">Aggiungi il primo veicolo</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Veicoli attivi</p>
            <Car className="h-4 w-4 text-zinc-300" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{vehicleCount}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Gestisci uno o più veicoli senza confusione.
          </p>
        </Card>
        <Card className="border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Scadenze nei prossimi 30 giorni</p>
            <CalendarClock className="h-4 w-4 text-zinc-300" />
          </div>
          <p className="mt-3 text-3xl font-semibold">{dueSoonCount}</p>
          <p className="mt-2 text-xs text-zinc-500">
            Ti basta un colpo d'occhio per essere in regola.
          </p>
        </Card>
        <Card className="border-white/10 bg-black/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Stato generale</p>
            <CheckCircle2 className="h-4 w-4 text-zinc-300" />
          </div>
          <p className="mt-3 text-lg font-semibold">
            {dueSoonCount === 0 ? "Tutto sotto controllo" : "Hai scadenze in arrivo"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Aggiorna le scadenze per tenere il garage in ordine.
          </p>
        </Card>
      </div>

      {vehicleCount === 1 && primaryVehicle ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-zinc-400">Veicolo attivo</p>
              <h3 className="mt-1 text-xl font-semibold">{primaryVehicle.plate}</h3>
              <p className="text-sm text-zinc-400">
                {primaryVehicle.make ?? "Marca"} {primaryVehicle.model ?? ""}
                {primaryVehicle.year ? ` · ${primaryVehicle.year}` : ""}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Prossima scadenza
              </p>
              <p className="mt-2 font-medium text-white">
                {nextVehicleDeadline
                  ? `${nextVehicleDeadline.type} · ${nextVehicleDeadline.dueDate.toLocaleDateString("it-IT")}`
                  : "Nessuna scadenza inserita"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Seleziona un veicolo</p>
            <Link className="text-xs text-zinc-400 hover:text-white" href="/vehicles">
              Gestisci veicoli →
            </Link>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between">
                <span>
                  {vehicle.plate} · {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                </span>
                <Badge variant="secondary">Attivo</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Veicoli recenti</p>
            <Link className="text-xs text-zinc-400 hover:text-white" href="/vehicles">
              Vedi tutti →
            </Link>
          </div>
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Prossime scadenze</p>
            <Link className="text-xs text-zinc-400 hover:text-white" href="/deadlines">
              Vedi tutte →
            </Link>
          </div>
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
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
