import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, CircleDollarSign, Fuel, ReceiptText } from "lucide-react";
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

function formatDeadlineTone(diffDays: number | null) {
  if (diffDays === null) return "outline";
  if (diffDays <= 30) return "destructive";
  if (diffDays <= 90) return "secondary";
  return "outline";
}

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
        take: 2,
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 2,
      },
    },
  });

  if (!vehicle) {
    redirect("/vehicles");
  }

  const nextDeadline = vehicle.deadlines.find((deadline) => deadline.dueDate >= now) ?? null;
  const deadlinesCount = vehicle.deadlines.length;
  const upcomingCount = vehicle.deadlines.filter((deadline) => {
    const diffDays = Math.ceil((deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  }).length;

  const nextDeadlineDiffDays = nextDeadline
    ? Math.ceil((nextDeadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const currentYear = now.getFullYear();
  const totalYearExpenses = await db.expense.aggregate({
    where: {
      vehicleId: vehicle.id,
      deletedAt: null,
      date: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
    _sum: { amountEur: true },
  });

  const latestEvents = [
    ...vehicle.expenses.map((expense) => ({
      id: expense.id,
      type: "expense" as const,
      date: expense.date,
      title: EXPENSE_LABELS[expense.category],
      subtitle: expense.description ?? "Spesa registrata",
      amount: expense.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
    ...vehicle.refuels.map((refuel) => ({
      id: refuel.id,
      type: "refuel" as const,
      date: refuel.date,
      title: "Rifornimento",
      subtitle: refuel.liters ? `${refuel.liters.toFixed(1)} l` : "Voce registrata",
      amount: refuel.amountEur,
      href: `/vehicles/${vehicle.id}/expenses`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

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
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Stato veicolo
          </p>

          {nextDeadline ? (
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-2xl font-semibold">
                  {DEADLINE_LABELS[nextDeadline.type]}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nextDeadline.dueDate.toLocaleDateString("it-IT")}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {nextDeadlineDiffDays !== null && nextDeadlineDiffDays <= 0
                    ? "La prossima azione da fare e' aggiornare questa scadenza."
                    : "La prossima cosa da controllare parte da qui."}
                </p>
              </div>

              <Badge variant={formatDeadlineTone(nextDeadlineDiffDays)}>
                {nextDeadlineDiffDays === null
                  ? "Da controllare"
                  : nextDeadlineDiffDays <= 0
                    ? "Scaduta"
                    : nextDeadlineDiffDays <= 30
                      ? `Tra ${nextDeadlineDiffDays} giorni`
                      : nextDeadlineDiffDays <= 90
                        ? "Entro 3 mesi"
                        : "In regola"}
              </Badge>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-2xl font-semibold">Nessuna scadenza registrata</p>
              <p className="text-sm text-muted-foreground">
                Inserisci bollo, assicurazione e revisione per avere un quadro chiaro.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/vehicles/${vehicle.id}/deadlines`}>Gestisci scadenze</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/expenses/new`}>Aggiungi spesa</Link>
            </Button>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Riepilogo rapido
          </p>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground">Scadenze inserite</p>
                <p className="mt-1 text-xl font-semibold">{deadlinesCount}</p>
              </div>
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground">In arrivo entro 90 giorni</p>
                <p className="mt-1 text-xl font-semibold">{upcomingCount}</p>
              </div>
              <ReceiptText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-muted-foreground">Spese {currentYear}</p>
                <p className="mt-1 text-xl font-semibold">
                  EUR {(totalYearExpenses._sum.amountEur ?? 0).toFixed(2)}
                </p>
              </div>
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Attivita&apos; recenti</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Le ultime voci registrate per questo veicolo.
              </p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/vehicles/${vehicle.id}/expenses`}>Vedi tutte</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {latestEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nessuna attivita&apos; registrata. Inizia da una spesa o da un rifornimento.
              </p>
            ) : (
              latestEvents.map((event) => (
                <Link
                  key={`${event.type}-${event.id}`}
                  href={event.href}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 transition hover:bg-accent/30"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {event.subtitle} · {event.date.toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    EUR {event.amount.toFixed(2)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Spese e carburante</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tutto cio&apos; che impatta sul costo del veicolo.
              </p>
            </div>
            <Fuel className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Totale registrato</span>
              <span className="font-semibold">EUR {lifetimeTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ultimo rifornimento</span>
              <span className="font-medium">
                {vehicle.refuels[0]
                  ? vehicle.refuels[0].date.toLocaleDateString("it-IT")
                  : "Non disponibile"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ultima spesa</span>
              <span className="font-medium">
                {vehicle.expenses[0]
                  ? vehicle.expenses[0].date.toLocaleDateString("it-IT")
                  : "Non disponibile"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/expenses`}>Apri spese</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/vehicles/${vehicle.id}/refuels/new`}>Nuovo rifornimento</Link>
            </Button>
          </div>
        </Card>
      </div>

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
