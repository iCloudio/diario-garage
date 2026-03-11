import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

const VEHICLE_LABELS = {
  AUTO: "Auto",
  MOTO: "Moto",
  CAMPER: "Camper",
} as const;

const FUEL_LABELS = {
  BENZINA: "Benzina",
  DIESEL: "Diesel",
  GPL: "GPL",
  METANO: "Metano",
  ELETTRICO: "Elettrico",
  IBRIDO_BENZINA: "Ibrido benzina",
  IBRIDO_DIESEL: "Ibrido diesel",
} as const;

function getDeadlineChipClass(dueDate: Date, now: Date) {
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil(
    (dueDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 30) {
    return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }

  if (diffDays <= 90) {
    return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}

function getDeadlineChipLabel(dueDate: Date, now: Date) {
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil(
    (dueDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) return "Scaduto";
  if (diffDays <= 30) return `Tra ${diffDays} ${diffDays === 1 ? "giorno" : "giorni"}`;

  const diffMonths = Math.ceil(diffDays / 30);
  return `Tra ${diffMonths} ${diffMonths === 1 ? "mese" : "mesi"}`;
}

function getDeadlineChipAnimationClass(dueDate: Date, now: Date) {
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.ceil(
    (dueDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diffDays <= 0 ? "deadline-chip-alert" : "";
}

export default async function VehiclesPage() {
  const user = await requireUser();
  const vehicles = await db.vehicle.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 1,
      },
      refuels: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="space-y-6">
      {vehicles.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/75 p-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-foreground">
              Nessun veicolo inserito
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aggiungi il primo mezzo per iniziare a monitorare documenti,
              scadenze, spese e rifornimenti in un unico posto.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/vehicles/new">Crea il primo veicolo</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((item) => {
            const latestRefuel = item.refuels[0] ?? null;
            const lastRefuelData = (() => {
              if (!latestRefuel) return null;

              const refuelDay = new Date(
                latestRefuel.date.getFullYear(),
                latestRefuel.date.getMonth(),
                latestRefuel.date.getDate(),
              );
              const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const diffDays = Math.max(
                0,
                Math.ceil((nowDay.getTime() - refuelDay.getTime()) / (1000 * 60 * 60 * 24)),
              );
              const fuelLabel = FUEL_LABELS[latestRefuel.fuelType] ?? latestRefuel.fuelType;
              const amountLabel = `${new Intl.NumberFormat("it-IT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(latestRefuel.amountEur)} EUR`;
              const daysLabel =
                diffDays === 0
                  ? "oggi"
                  : `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;

              return { fuelLabel, amountLabel, daysLabel };
            })();

            return (
              <Link key={item.id} className="block" href={`/vehicles/${item.id}`}>
                <Card className="h-full border-border/80 bg-card/90 p-6 transition hover:border-primary/35 hover:bg-card hover:shadow-lg">
                  <div className="-mx-6 -mt-6 mb-5 grid grid-cols-3 items-center border-b border-border/70 px-6 py-3 text-sm text-muted-foreground">
                    <div className="text-left">{item.year ?? ""}</div>
                    <div className="text-center">{VEHICLE_LABELS[item.type ?? "AUTO"]}</div>
                    <div className="text-right">
                      {item.odometerKm
                        ? `${new Intl.NumberFormat("it-IT").format(item.odometerKm)} km`
                        : ""}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {item.status !== "ATTIVO" ? (
                        <Badge variant={item.status === "VENDUTO" ? "secondary" : "outline"} className="text-xs">
                          {item.status === "VENDUTO" ? "Venduto" : "Rottamato"}
                        </Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      {item.plate}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.make ?? "Marca"} {item.model ?? ""}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center gap-3">
                      <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Scadenze
                      </p>
                      <div className="h-px flex-1 bg-border/70" />
                    </div>
                    <div className="mt-3 space-y-2">
                      {item.deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nessuna scadenza</p>
                      ) : (
                        item.deadlines.map((deadline) => (
                          <div
                            key={deadline.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {DEADLINE_LABELS[deadline.type]}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getDeadlineChipClass(
                                deadline.dueDate,
                                now,
                              )} ${getDeadlineChipAnimationClass(deadline.dueDate, now)}`}
                            >
                              {getDeadlineChipLabel(deadline.dueDate, now)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Carburante
                        </p>
                        <div className="h-px flex-1 bg-border/70" />
                      </div>
                      <div className="mt-3">
                        {lastRefuelData ? (
                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <p className="text-left text-foreground">{lastRefuelData.fuelLabel}</p>
                            <p className="text-center text-foreground">{lastRefuelData.amountLabel}</p>
                            <p className="text-right text-foreground">{lastRefuelData.daysLabel}</p>
                          </div>
                        ) : (
                          <p className="italic text-muted-foreground">Nessun rifornimento</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}

          <Link className="block" href="/vehicles/new">
            <Card className="flex h-full min-h-64 flex-col items-center justify-center gap-4 border-dashed border-border/80 bg-card/60 p-6 text-center transition hover:border-primary/35 hover:bg-card/80">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-background/70">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">Aggiungi veicolo</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crea una nuova scheda veicolo.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
