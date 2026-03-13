import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { formatCurrency } from "@/lib/currency";
import { FuelPriceRegionDialog } from "@/components/fuel-price-region-dialog";
import { VehicleInlineCreateCard } from "@/components/vehicle-inline-create-card";
import { getRegionalFuelPriceTable } from "@/lib/fuel-prices";
import {
  formatLicenseExpiryLabel,
  getLicenseExpiryAnimationClass,
  getLicenseExpiryClass,
} from "@/lib/license-status";

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

export default async function VehiclesPage() {
  const user = await requireUser();
  const [profile, vehicles, regionalFuelTable] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currency: true, fuelPriceRegion: true },
    }),
    db.vehicle.findMany({
      where: { userId: user.id, deletedAt: null },
      include: {
        deadlines: {
          where: { deletedAt: null },
          orderBy: { dueDate: "asc" },
        },
        refuels: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 1,
        },
        drivers: {
          orderBy: {
            driver: { name: "asc" },
          },
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                licenseExpiry: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getRegionalFuelPriceTable(),
  ]);

  const now = new Date();
  const currency = profile?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <FuelPriceRegionDialog
        initialRegion={profile?.fuelPriceRegion ?? null}
        rows={regionalFuelTable.regions}
        snapshotDate={regionalFuelTable.snapshotDate}
        sourceUrl={regionalFuelTable.sourceUrl}
      />

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
            const firstRegistrationLabel = item.firstRegistrationDate
              ? new Intl.DateTimeFormat("it-IT", {
                  month: "2-digit",
                  year: "numeric",
                }).format(item.firstRegistrationDate)
              : "";
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
              const amountLabel = formatCurrency(latestRefuel.amountEur, currency);
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
                    <div className="text-left">{firstRegistrationLabel}</div>
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
                    {item.make || item.model ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[item.make, item.model].filter(Boolean).join(" ")}
                      </p>
                    ) : null}
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
                        <p className="text-sm italic text-muted-foreground">Nessuna scadenza</p>
                      ) : (
                        item.deadlines.map((deadline) => (
                          <div
                            key={deadline.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {DEADLINE_LABELS[deadline.type]}
                            </span>
                            <DeadlineStatusChip dueDate={deadline.dueDate} now={now} />
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

                  <div className="mt-5">
                    <div className="flex items-center gap-3">
                      <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Guidatori
                      </p>
                      <div className="h-px flex-1 bg-border/70" />
                    </div>
                    <div className="mt-3 space-y-2">
                      {item.drivers.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">Nessun guidatore</p>
                      ) : (
                        item.drivers.map(({ driver }) => (
                          <div
                            key={driver.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="font-medium text-foreground">{driver.name}</span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getLicenseExpiryClass(
                                driver.licenseExpiry,
                                now,
                              )} ${getLicenseExpiryAnimationClass(driver.licenseExpiry, now)}`}
                            >
                              {formatLicenseExpiryLabel(driver.licenseExpiry)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
              </Card>
            </Link>
          );
          })}

          <VehicleInlineCreateCard />
        </div>
      )}
    </div>
  );
}
