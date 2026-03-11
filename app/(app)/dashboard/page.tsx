import Link from "next/link";
import { CalendarClock, Car, Gauge, Plus, Target } from "lucide-react";
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
    take: 1,
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
  const deadlinesHref = primaryVehicle
    ? `/vehicles/${primaryVehicle.id}/deadlines`
    : "/vehicles/new";
  const monthSpent = 0;
  const monthSpentLabel =
    monthSpent > 0
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(monthSpent)
      : "Nessun dato";
  const fuelTrend = [42, 55, 38, 64, 49, 72, 58, 63];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Dashboard
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            <span className="block">Libretto digitale</span>
            <span className="block">Più ordine, meno sorprese.</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra le manutenzioni, monitora i costi e ricevi avvisi per ogni
            scadenza. Tutto in un unico posto.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {vehicleCount === 0 ? (
            <Button asChild>
              <Link href="/vehicles/new">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi veicolo
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/vehicles">Gestisci veicolo</Link>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href={deadlinesHref}>Vai alle scadenze</Link>
          </Button>
        </div>
      </div>

      {vehicleCount === 0 ? (
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Target className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Inizia dal tuo primo veicolo
              </p>
              <p className="text-xs text-muted-foreground">
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
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Veicoli attivi</p>
                <Car className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{vehicleCount}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Un solo veicolo, chiaro e ordinato.
              </p>
            </Card>
            <Card className="border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Spese mese corrente</p>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{monthSpentLabel}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Aggiungi spese per avere un quadro completo.
              </p>
            </Card>

            <Card className="border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Mini consumo</p>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4 flex h-12 items-end gap-1">
                {fuelTrend.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="w-full rounded-sm bg-primary/20"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Consumo medio delle ultime settimane.
              </p>
            </Card>

            <Card
              className={`border-border p-5 ${
                dueSoonCount > 0
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Alert scadenze</p>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{dueSoonCount}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {dueSoonCount > 0
                  ? "Scadenze entro 30 giorni."
                  : "Nessuna scadenza imminente."}
              </p>
            </Card>
          </div>

          {primaryVehicle ? (
            <Card className="border-border bg-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Veicolo attivo</p>
                  <h3 className="mt-1 text-xl font-semibold">{primaryVehicle.plate}</h3>
                  <p className="text-sm text-muted-foreground">
                    {primaryVehicle.make ?? "Marca"} {primaryVehicle.model ?? ""}
                    {primaryVehicle.year ? ` · ${primaryVehicle.year}` : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Prossima scadenza
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {nextVehicleDeadline
                      ? `${nextVehicleDeadline.type} · ${nextVehicleDeadline.dueDate.toLocaleDateString("it-IT")}`
                      : "Nessuna scadenza inserita"}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Timeline eventi recenti</p>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground"
                href={deadlinesHref}
              >
                Vedi tutte →
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessun evento in programma.
                </p>
              ) : (
                upcoming.map((deadline) => (
                  <div key={deadline.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-2 w-2 rounded-full bg-primary/70" />
                      <span className="mt-2 h-full w-px bg-border" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {deadline.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.vehicle.plate} · {deadline.vehicle.make ?? ""}{" "}
                        {deadline.vehicle.model ?? ""}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {deadline.dueDate.toLocaleDateString("it-IT")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
