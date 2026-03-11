import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CircleDollarSign, Fuel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VehicleSaleAnalysis } from "@/components/vehicle-sale-analysis";

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

const EXPENSE_LABELS = {
  RIFORNIMENTO: "Rifornimento",
  MANUTENZIONE: "Manutenzione",
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  MULTA: "Multa",
  PARCHEGGIO: "Parcheggio",
  LAVAGGIO: "Lavaggio",
  PEDAGGI: "Pedaggi",
  ALTRO: "Altro",
} as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDeadlineBadge(diffDays: number | null) {
  if (diffDays === null) return { label: "Da inserire", variant: "outline" as const };
  if (diffDays <= 0) return { label: "Scaduta", variant: "destructive" as const };
  if (diffDays <= 30) return { label: `Tra ${diffDays} giorni`, variant: "destructive" as const };
  if (diffDays <= 90) return { label: "Entro 3 mesi", variant: "secondary" as const };
  return { label: "In regola", variant: "outline" as const };
}

type TimelineEntry = {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  kindLabel: string;
  amount?: number;
  href: string;
  badge?: { label: string; variant: "outline" | "secondary" | "destructive" };
};

export default async function VehicleOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const now = new Date();

  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
      refuels: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 4,
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 4,
      },
    },
  });

  if (!vehicle) {
    redirect("/vehicles");
  }

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

  const nextDeadline = vehicle.deadlines.find((deadline) => deadline.dueDate >= now) ?? null;
  const nextDeadlineDiffDays = nextDeadline
    ? Math.ceil((nextDeadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const hasInsurance = vehicle.deadlines.some((deadline) => deadline.type === "ASSICURAZIONE");
  const hasTax = vehicle.deadlines.some((deadline) => deadline.type === "BOLLO");
  const hasInspection = vehicle.deadlines.some((deadline) => deadline.type === "REVISIONE");
  const hasAnyMovement = vehicle.expenses.length > 0 || vehicle.refuels.length > 0;
  const setupItems = [
    {
      label: "Aggiungi assicurazione",
      done: hasInsurance,
      href: `/vehicles/${vehicle.id}/deadlines`,
    },
    {
      label: "Aggiungi bollo",
      done: hasTax,
      href: `/vehicles/${vehicle.id}/deadlines`,
    },
    {
      label: "Aggiungi revisione",
      done: hasInspection,
      href: `/vehicles/${vehicle.id}/deadlines`,
    },
    {
      label: "Registra il primo movimento",
      done: hasAnyMovement,
      href: `/vehicles/${vehicle.id}/expenses/new`,
    },
  ];
  const incompleteSetupItems = setupItems.filter((item) => !item.done);

  const timelineEntries: TimelineEntry[] = [
    ...vehicle.deadlines.map((deadline) => {
      const diffDays = Math.ceil(
        (deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: `deadline-${deadline.id}`,
        date: deadline.dueDate,
        title: DEADLINE_LABELS[deadline.type],
        subtitle: "Scadenza da tenere sotto controllo",
        kindLabel: "Scadenza",
        href: `/vehicles/${vehicle.id}/deadlines`,
        badge: formatDeadlineBadge(diffDays),
      };
    }),
    ...vehicle.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: EXPENSE_LABELS[expense.category],
      subtitle: expense.description ?? "Spesa registrata",
      kindLabel: "Spesa",
      amount: expense.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
    ...vehicle.refuels.map((refuel) => ({
      id: `refuel-${refuel.id}`,
      date: refuel.date,
      title: "Rifornimento",
      subtitle: refuel.liters ? `${refuel.liters.toFixed(1)} l registrati` : "Voce registrata",
      kindLabel: "Rifornimento",
      amount: refuel.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
  ]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-8)
    .reverse();

  return (
    <div className="space-y-6">
      {incompleteSetupItems.length > 0 ? (
        <Card className="border-border/80 bg-card/90 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
            Setup consigliato
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Completa le basi del veicolo
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Non serve fare tutto subito. Questi sono i passaggi minimi che rendono
            davvero utile la scheda veicolo.
          </p>

          <div className="mt-5 space-y-3">
            {setupItems.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/70 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-primary/70"}`}
                  />
                  <p className={item.done ? "text-sm text-muted-foreground" : "text-sm font-medium text-foreground"}>
                    {item.label}
                  </p>
                </div>

                {item.done ? (
                  <span className="text-xs text-muted-foreground">Completato</span>
                ) : (
                  <Button asChild size="sm" variant="ghost">
                    <Link href={item.href}>Apri</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="border-border/80 bg-card/90 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
          Panoramica
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              {nextDeadline
                ? `${DEADLINE_LABELS[nextDeadline.type]} il ${nextDeadline.dueDate.toLocaleDateString("it-IT")}`
                : "Nessuna scadenza inserita"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {nextDeadline
                ? "Questa e' la prossima voce da controllare. Sotto trovi una timeline unica con scadenze, spese e rifornimenti."
                : "Parti aggiungendo la prima scadenza, poi usa la timeline per tenere tutto sotto controllo in modo semplice."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/vehicles/${vehicle.id}/deadlines`}>Aggiungi scadenza</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/expenses/new`}>Aggiungi spesa</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/vehicles/${vehicle.id}/refuels/new`}>
                <Fuel className="mr-2 h-4 w-4" />
                Aggiungi rifornimento
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>Totale registrato: <span className="font-medium text-foreground">{formatCurrency(lifetimeTotal)}</span></span>
          <span>
            Prossima scadenza:{" "}
            <span className="font-medium text-foreground">
              {nextDeadline ? DEADLINE_LABELS[nextDeadline.type] : "Da inserire"}
            </span>
          </span>
          {nextDeadline ? (
            <Badge variant={formatDeadlineBadge(nextDeadlineDiffDays).variant}>
              {formatDeadlineBadge(nextDeadlineDiffDays).label}
            </Badge>
          ) : null}
        </div>
      </Card>

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium">Timeline veicolo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Un flusso unico e leggibile di scadenze, spese e rifornimenti.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href={`/vehicles/${vehicle.id}/deadlines`}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Scadenze
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/vehicles/${vehicle.id}/expenses`}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Movimenti
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-0">
          {timelineEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
              Nessuna attivita&apos; ancora registrata. Aggiungi una scadenza oppure
              registra la prima spesa.
            </div>
          ) : (
            timelineEntries.map((entry, index) => (
              <Link
                key={entry.id}
                href={entry.href}
                className="group flex gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex w-5 flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70" />
                  {index < timelineEntries.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-border/80" />
                  ) : null}
                </div>

                <div className="flex-1 border-b border-border/60 pb-4 last:border-b-0 group-last:border-b-0">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {entry.kindLabel}
                        </span>
                        <p className="text-base font-medium text-foreground">
                          {entry.title}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
                      <p className="text-sm font-medium text-foreground">
                        {entry.date.toLocaleDateString("it-IT")}
                      </p>
                      {entry.amount !== undefined ? (
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(entry.amount)}
                        </p>
                      ) : null}
                      {entry.badge ? (
                        <Badge variant={entry.badge.variant}>{entry.badge.label}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>

      {vehicle.status === "VENDUTO" && vehicle.soldPrice && vehicle.soldDate ? (
        <VehicleSaleAnalysis
          soldPrice={vehicle.soldPrice}
          soldDate={vehicle.soldDate}
          soldNotes={vehicle.soldNotes}
          totalExpenses={lifetimeTotal}
          purchaseDate={vehicle.createdAt}
          odometerKm={vehicle.odometerKm}
        />
      ) : null}
    </div>
  );
}
