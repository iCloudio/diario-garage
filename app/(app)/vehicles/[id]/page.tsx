import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CircleDollarSign, Fuel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VehicleSaleAnalysis } from "@/components/vehicle-sale-analysis";
import { VehicleDriversSection } from "@/components/vehicle-drivers-section";
import { formatCurrency } from "@/lib/currency";

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

const EXPENSE_LABELS = {
  MANUTENZIONE: "Manutenzione",
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  MULTA: "Multa",
  PARCHEGGIO: "Parcheggio",
  LAVAGGIO: "Lavaggio",
  PEDAGGI: "Pedaggi",
  ALTRO: "Altro",
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

function formatDeadlineBadge(diffDays: number | null) {
  if (diffDays === null) return { label: "Da inserire", variant: "outline" as const };
  if (diffDays <= 0) return { label: "Scaduto", variant: "destructive" as const };
  if (diffDays <= 30) {
    return {
      label: `Tra ${diffDays} ${diffDays === 1 ? "giorno" : "giorni"}`,
      variant: "destructive" as const,
    };
  }
  if (diffDays <= 90) return { label: "Entro 3 mesi", variant: "secondary" as const };
  return { label: "In regola", variant: "outline" as const };
}

type ActivityEntry = {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  amount?: number;
  href: string;
};

export default async function VehicleOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const now = new Date();

  const [profile, vehicle, allDrivers] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currency: true },
    }),
    db.vehicle.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: {
        deadlines: {
          where: { deletedAt: null },
          orderBy: { dueDate: "asc" },
        },
        refuels: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 3,
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 3,
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
    }),
    db.driver.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        licenseExpiry: true,
      },
    }),
  ]);

  if (!vehicle) {
    redirect("/vehicles");
  }
  const currency = profile?.currency ?? "EUR";

  const deadlinesWithStatus = (["ASSICURAZIONE", "BOLLO", "REVISIONE"] as const).map((type) => {
    const deadline = vehicle.deadlines.find((item) => item.type === type) ?? null;
    const diffDays = deadline
      ? Math.ceil(
          (new Date(deadline.dueDate.getFullYear(), deadline.dueDate.getMonth(), deadline.dueDate.getDate()).getTime() -
            new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      type,
      deadline,
      badge: formatDeadlineBadge(diffDays),
    };
  });

  const latestRefuel = vehicle.refuels[0] ?? null;
  const latestRefuelSummary = (() => {
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

    return {
      fuel: FUEL_LABELS[latestRefuel.fuelType] ?? latestRefuel.fuelType,
      amount: formatCurrency(latestRefuel.amountEur, currency),
      when:
        diffDays === 0
          ? "oggi"
          : `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`,
    };
  })();

  const activityEntries: ActivityEntry[] = [
    ...vehicle.deadlines.map((deadline) => ({
      id: `deadline-${deadline.id}`,
      date: deadline.dueDate,
      title: DEADLINE_LABELS[deadline.type],
      subtitle: "Scadenza registrata",
      kind: "Scadenza" as const,
      href: `/vehicles/${vehicle.id}/deadlines`,
    })),
    ...vehicle.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: EXPENSE_LABELS[expense.category],
      subtitle: expense.description ?? "Spesa registrata",
      kind: "Spesa" as const,
      amount: expense.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
    ...vehicle.refuels.map((refuel) => ({
      id: `refuel-${refuel.id}`,
      date: refuel.date,
      title: "Rifornimento",
      subtitle: FUEL_LABELS[refuel.fuelType] ?? refuel.fuelType,
      kind: "Rifornimento" as const,
      amount: refuel.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  const showSetupHint = deadlinesWithStatus.some((item) => !item.deadline) && !latestRefuel;
  const assignedDriverIds = new Set(vehicle.drivers.map(({ driverId }) => driverId));
  const availableDrivers = allDrivers.filter((driver) => !assignedDriverIds.has(driver.id));
  const assignedDrivers = vehicle.drivers.map(({ driver }) => ({
    id: driver.id,
    name: driver.name,
    licenseExpiry: driver.licenseExpiry.toISOString(),
  }));
  const unassignedDrivers = availableDrivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    licenseExpiry: driver.licenseExpiry.toISOString(),
  }));

  const totalExpenses = await db.expense.aggregate({
    where: { vehicleId: vehicle.id, deletedAt: null },
    _sum: { amountEur: true },
  });
  const totalRefuels = await db.refuel.aggregate({
    where: { vehicleId: vehicle.id, deletedAt: null },
    _sum: { amountEur: true },
  });
  const lifetimeTotal =
    (totalExpenses._sum.amountEur ?? 0) + (totalRefuels._sum.amountEur ?? 0);

  return (
    <div className="space-y-6">
      {showSetupHint ? (
        <Card className="border-border/80 bg-card/90 p-6">
          <p className="text-sm font-medium text-foreground">Completa il setup del veicolo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Aggiungi almeno le scadenze principali e il primo rifornimento per avere
            una scheda davvero utile.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/vehicles/${vehicle.id}/deadlines`}>Aggiungi scadenze</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/refuels/new`}>Aggiungi rifornimento</Link>
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Scadenze
          </p>
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="mt-4 space-y-3">
          {deadlinesWithStatus.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div>
                <p className="font-medium text-foreground">{DEADLINE_LABELS[item.type]}</p>
                <p className="text-muted-foreground">
                  {item.deadline
                    ? item.deadline.dueDate.toLocaleDateString("it-IT")
                    : "Da inserire"}
                </p>
              </div>
              <Badge variant={item.badge.variant}>{item.badge.label}</Badge>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/vehicles/${vehicle.id}/deadlines`}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Gestisci scadenze
            </Link>
          </Button>
        </div>
      </Card>

      <VehicleDriversSection
        vehicleId={vehicle.id}
        drivers={assignedDrivers}
        availableDrivers={unassignedDrivers}
      />

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Carburante
          </p>
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="mt-4">
          {latestRefuelSummary ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <p className="text-left text-foreground">{latestRefuelSummary.fuel}</p>
              <p className="text-center text-foreground">{latestRefuelSummary.amount}</p>
              <p className="text-right text-foreground">{latestRefuelSummary.when}</p>
            </div>
          ) : (
            <p className="italic text-muted-foreground">Nessun rifornimento</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/vehicles/${vehicle.id}/refuels/new`}>
              <Fuel className="mr-2 h-4 w-4" />
              Aggiungi rifornimento
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/vehicles/${vehicle.id}/expenses/new`}>
              Aggiungi spesa
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Attivita&apos;
          </p>
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="mt-4 space-y-3">
          {activityEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nessuna attivita&apos; registrata.
            </p>
          ) : (
            activityEntries.map((entry) => (
              <Link
                key={entry.id}
                href={entry.href}
                className="flex items-center justify-between gap-4 rounded-xl px-1 py-2 transition hover:bg-accent/20"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {entry.kind}
                    </span>
                    <p className="truncate font-medium text-foreground">{entry.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground">
                    {entry.amount !== undefined ? formatCurrency(entry.amount, currency) : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.date.toLocaleDateString("it-IT")}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/vehicles/${vehicle.id}/expenses`}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Apri movimenti
            </Link>
          </Button>
          <p className="self-center text-sm text-muted-foreground">
            Totale registrato: <span className="font-medium text-foreground">{formatCurrency(lifetimeTotal, currency)}</span>
          </p>
        </div>
      </Card>

      {vehicle.status === "VENDUTO" && vehicle.soldPrice && vehicle.soldDate ? (
        <VehicleSaleAnalysis
          soldPrice={vehicle.soldPrice}
          soldDate={vehicle.soldDate}
          soldNotes={vehicle.soldNotes}
          totalExpenses={lifetimeTotal}
          currency={currency}
          purchaseDate={vehicle.createdAt}
          odometerKm={vehicle.odometerKm}
        />
      ) : null}
    </div>
  );
}
