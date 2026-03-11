import Link from "next/link";
import {
  CalendarClock,
  Car,
  CircleDollarSign,
  Fuel,
  Plus,
  ReceiptText,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [profile, vehicleCount, primaryVehicle, dueSoonCount, upcoming, monthExpenses, monthRefuels, latestExpense, latestRefuel] =
    await Promise.all([
      db.user.findUnique({
        where: { id: user.id },
        select: { currency: true },
      }),
      db.vehicle.count({
        where: { userId: user.id, deletedAt: null },
      }),
      db.vehicle.findFirst({
        where: { userId: user.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
      }),
      db.deadline.count({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
          dueDate: { gte: now, lte: in30 },
        },
      }),
      db.deadline.findMany({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
          dueDate: { gte: now },
        },
        include: {
          vehicle: { select: { id: true, plate: true, make: true, model: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 4,
      }),
      db.expense.aggregate({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amountEur: true },
      }),
      db.refuel.aggregate({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
          date: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amountEur: true },
      }),
      db.expense.findFirst({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
        },
        include: {
          vehicle: { select: { id: true, plate: true } },
        },
        orderBy: { date: "desc" },
      }),
      db.refuel.findFirst({
        where: {
          vehicle: { userId: user.id, deletedAt: null },
          deletedAt: null,
        },
        include: {
          vehicle: { select: { id: true, plate: true } },
        },
        orderBy: { date: "desc" },
      }),
    ]);

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
  const monthSpent =
    (monthExpenses._sum.amountEur ?? 0) + (monthRefuels._sum.amountEur ?? 0);
  const currency = profile?.currency ?? "EUR";
  const latestActivity = [latestExpense, latestRefuel]
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 p-6 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Tutto quello che conta per il tuo garage, senza rumore.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Scadenze, spese e attivita&apos; recenti in una vista unica. Se manca
              un dato, l&apos;interfaccia te lo dice chiaramente invece di riempire la
              pagina con numeri finti.
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
                <Link href="/vehicles">Apri garage</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href={deadlinesHref}>Controlla scadenze</Link>
            </Button>
          </div>
        </div>
      </Card>

      {vehicleCount === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/75 p-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-foreground">
              Inizia dal primo veicolo
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Appena inserisci una targa puoi monitorare bollo, assicurazione,
              revisione, spese e rifornimenti in modo ordinato.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/vehicles/new">Aggiungi il primo veicolo</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/80 bg-card/90 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Veicoli attivi</p>
                <Car className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{vehicleCount}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Tutti i mezzi monitorati nel tuo garage.
              </p>
            </Card>

            <Card className="border-border/80 bg-card/90 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Spesa mese corrente</p>
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">
                {monthSpent > 0 ? formatCurrency(monthSpent, currency, { maximumFractionDigits: 0 }) : "Nessun dato"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Somma di spese e rifornimenti registrati questo mese.
              </p>
            </Card>

            <Card
              className={
                dueSoonCount > 0
                  ? "border-amber-500/30 bg-amber-500/10 p-5"
                  : "border-border/80 bg-card/90 p-5"
              }
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Scadenze entro 30 giorni</p>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{dueSoonCount}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {dueSoonCount > 0
                  ? "Ci sono azioni da pianificare subito."
                  : "Nessun alert imminente."}
              </p>
            </Card>

            <Card className="border-border/80 bg-card/90 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Ultima registrazione</p>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-lg font-semibold">
                {latestActivity ? formatShortDate(latestActivity.date) : "Ancora vuoto"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {latestActivity
                  ? `${latestActivity.vehicle.plate} · ${"liters" in latestActivity ? "Rifornimento" : "Spesa"}`
                  : "Inizia registrando una spesa o un rifornimento."}
              </p>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-border/80 bg-card/90 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
                    Focus veicolo
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {primaryVehicle?.plate ?? "Nessun veicolo"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {primaryVehicle
                      ? `${primaryVehicle.make ?? "Marca"} ${primaryVehicle.model ?? ""}${primaryVehicle.year ? ` · ${primaryVehicle.year}` : ""}`
                      : "Aggiungi un veicolo per vedere il riepilogo."}
                  </p>
                </div>

                {nextVehicleDeadline ? (
                  <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Prossima scadenza
                    </p>
                    <p className="mt-2 font-medium text-foreground">
                      {DEADLINE_LABELS[nextVehicleDeadline.type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {nextVehicleDeadline.dueDate.toLocaleDateString("it-IT")}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={deadlinesHref}>Gestisci scadenze</Link>
                </Button>
                {primaryVehicle ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/vehicles/${primaryVehicle.id}/expenses/new`}>
                      Registra spesa
                    </Link>
                  </Button>
                ) : null}
                {primaryVehicle ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/vehicles/${primaryVehicle.id}/refuels/new`}>
                      <Fuel className="mr-2 h-4 w-4" />
                      Nuovo rifornimento
                    </Link>
                  </Button>
                ) : null}
              </div>
            </Card>

            <Card className="border-border/80 bg-card/90 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Scadenze in arrivo</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le prossime da controllare in ordine di data.
                  </p>
                </div>
                <Link
                  className="text-xs text-muted-foreground transition hover:text-foreground"
                  href={deadlinesHref}
                >
                  Vedi tutte
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nessuna scadenza programmata.
                  </p>
                ) : (
                  upcoming.map((deadline) => (
                    <Link
                      key={deadline.id}
                      href={`/vehicles/${deadline.vehicle.id}/deadlines`}
                      className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-background/70 px-4 py-3 transition hover:bg-accent/25"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {DEADLINE_LABELS[deadline.type]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deadline.vehicle.plate}
                          {(deadline.vehicle.make ?? deadline.vehicle.model)
                            ? ` · ${deadline.vehicle.make ?? ""} ${deadline.vehicle.model ?? ""}`.trim()
                            : ""}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {deadline.dueDate.toLocaleDateString("it-IT")}
                      </Badge>
                    </Link>
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
