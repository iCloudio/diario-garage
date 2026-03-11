import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleExpensesChart } from "@/components/vehicle-expenses-chart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORY_COLORS = {
  Carburante: "#7c3aed",
  Manutenzione: "#8b5cf6",
  Assicurazione: "#a78bfa",
  Bollo: "#c4b5fd",
} as const;

const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

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

type DatasetRow = {
  year: number;
  monthIndex: number;
  fuel: number;
  maintenance: number;
  insurance: number;
  tax: number;
};

function createEmptyYear(year: number): DatasetRow[] {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    year,
    monthIndex,
    fuel: 0,
    maintenance: 0,
    insurance: 0,
    tax: 0,
  }));
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function VehicleExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [profile, vehicle] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currency: true },
    }),
    db.vehicle.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      select: { id: true },
    }),
  ]);

  if (!vehicle) {
    return null;
  }

  const currency = profile?.currency ?? "EUR";

  const [expenses, refuels] = await Promise.all([
    db.expense.findMany({
      where: { vehicleId: vehicle.id, deletedAt: null },
      select: { id: true, date: true, category: true, amountEur: true, description: true },
      orderBy: { date: "asc" },
    }),
    db.refuel.findMany({
      where: { vehicleId: vehicle.id, deletedAt: null },
      select: { id: true, date: true, amountEur: true, liters: true, kwh: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const yearsSet = new Set<number>();
  expenses.forEach((item) => yearsSet.add(item.date.getFullYear()));
  refuels.forEach((item) => yearsSet.add(item.date.getFullYear()));
  if (yearsSet.size === 0) {
    yearsSet.add(new Date().getFullYear());
  }

  const years = Array.from(yearsSet).sort((a, b) => b - a);
  const yearMap = new Map<number, DatasetRow[]>(years.map((year) => [year, createEmptyYear(year)]));

  for (const expense of expenses) {
    const rows = yearMap.get(expense.date.getFullYear());
    if (!rows) continue;
    const row = rows[expense.date.getMonth()];
    if (!row) continue;

    if (expense.category === "MANUTENZIONE") row.maintenance += expense.amountEur;
    if (expense.category === "ASSICURAZIONE") row.insurance += expense.amountEur;
    if (expense.category === "BOLLO") row.tax += expense.amountEur;
  }

  for (const refuel of refuels) {
    const rows = yearMap.get(refuel.date.getFullYear());
    if (!rows) continue;
    const row = rows[refuel.date.getMonth()];
    if (!row) continue;
    row.fuel += refuel.amountEur;
  }

  const historicalRows = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, rows]) => rows);

  const datasets = [
    {
      key: "all",
      label: "Tutto lo storico",
      monthlyData: historicalRows.map((row) => ({
        month: `${MONTHS[row.monthIndex]} ${String(row.year).slice(-2)}`,
        total: row.fuel + row.maintenance + row.insurance + row.tax,
        fuel: row.fuel,
      })),
      pieData: [
        {
          name: "Carburante",
          value: historicalRows.reduce((sum, row) => sum + row.fuel, 0),
          color: CATEGORY_COLORS.Carburante,
        },
        {
          name: "Manutenzione",
          value: historicalRows.reduce((sum, row) => sum + row.maintenance, 0),
          color: CATEGORY_COLORS.Manutenzione,
        },
        {
          name: "Assicurazione",
          value: historicalRows.reduce((sum, row) => sum + row.insurance, 0),
          color: CATEGORY_COLORS.Assicurazione,
        },
        {
          name: "Bollo",
          value: historicalRows.reduce((sum, row) => sum + row.tax, 0),
          color: CATEGORY_COLORS.Bollo,
        },
      ].filter((item) => item.value > 0),
    },
    ...years.map((year) => {
      const rows = yearMap.get(year) ?? [];
      return {
        key: `${year}`,
        label: `${year}`,
        monthlyData: rows.map((row) => ({
          month: MONTHS[row.monthIndex],
          total: row.fuel + row.maintenance + row.insurance + row.tax,
          fuel: row.fuel,
        })),
        pieData: [
          {
            name: "Carburante",
            value: rows.reduce((sum, row) => sum + row.fuel, 0),
            color: CATEGORY_COLORS.Carburante,
          },
          {
            name: "Manutenzione",
            value: rows.reduce((sum, row) => sum + row.maintenance, 0),
            color: CATEGORY_COLORS.Manutenzione,
          },
          {
            name: "Assicurazione",
            value: rows.reduce((sum, row) => sum + row.insurance, 0),
            color: CATEGORY_COLORS.Assicurazione,
          },
          {
            name: "Bollo",
            value: rows.reduce((sum, row) => sum + row.tax, 0),
            color: CATEGORY_COLORS.Bollo,
          },
        ].filter((item) => item.value > 0),
      };
    }),
  ];

  const timelineEntries = [
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      kind: "Spesa",
      title: EXPENSE_LABELS[expense.category] ?? "Spesa",
      subtitle: expense.description ?? "Voce registrata",
      amount: expense.amountEur,
    })),
    ...refuels.map((refuel) => ({
      id: `refuel-${refuel.id}`,
      date: refuel.date,
      kind: "Rifornimento",
      title: "Rifornimento",
      subtitle: refuel.kwh
        ? `${refuel.kwh.toFixed(1)} kWh`
        : refuel.liters
          ? `${refuel.liters.toFixed(1)} l`
          : "Voce registrata",
      amount: refuel.amountEur,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalRecorded = timelineEntries.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
          Movimenti
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Storico economico del veicolo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Prima scorri i movimenti in ordine cronologico. I grafici restano sotto,
          come supporto per leggere i trend.
        </p>
      </div>

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Timeline movimenti</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tutte le spese e i rifornimenti in un unico flusso.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/vehicles/${vehicle.id}/expenses/new`}>Aggiungi spesa</Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href={`/vehicles/${vehicle.id}/refuels/new`}>Aggiungi rifornimento</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>
            Totale registrato:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(totalRecorded, currency)}
            </span>
          </span>
          <span>
            Voci totali:{" "}
            <span className="font-medium text-foreground">{timelineEntries.length}</span>
          </span>
        </div>

        <div className="mt-6 space-y-0">
          {timelineEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
              Nessun movimento registrato. Aggiungi una spesa o un rifornimento
              per iniziare a costruire lo storico.
            </div>
          ) : (
            timelineEntries.map((entry, index) => (
              <div key={entry.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex w-5 flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70" />
                  {index < timelineEntries.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-border/80" />
                  ) : null}
                </div>

                <div className="flex-1 border-b border-border/60 pb-4 last:border-b-0">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {entry.kind}
                        </span>
                        <p className="text-base font-medium text-foreground">{entry.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.subtitle}</p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(entry.amount, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.date.toLocaleDateString("it-IT")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="border-border/80 bg-card/90 p-6">
        <div className="mb-4">
          <p className="text-sm font-medium">Analisi</p>
          <p className="mt-1 text-sm text-muted-foreground">
            I grafici aiutano a leggere i trend dopo aver visto lo storico.
          </p>
        </div>

        <VehicleExpensesChart
          currency={currency}
          datasets={datasets}
        />
      </Card>
    </div>
  );
}
