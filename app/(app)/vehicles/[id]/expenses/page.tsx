import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleExpensesChart } from "@/components/vehicle-expenses-chart";

const CATEGORY_COLORS = {
  Carburante: "#7c3aed",
  Manutenzione: "#8b5cf6",
  Assicurazione: "#a78bfa",
  Bollo: "#c4b5fd",
} as const;

const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

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

  const [expenses, refuels] = await Promise.all([
    db.expense.findMany({
      where: { vehicleId: vehicle.id, deletedAt: null },
      select: { date: true, category: true, amountEur: true },
      orderBy: { date: "asc" },
    }),
    db.refuel.findMany({
      where: { vehicleId: vehicle.id, deletedAt: null },
      select: { date: true, amountEur: true },
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Grafici spese
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Andamento spese</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Leggi il totale per anno o apri tutto lo storico in una vista unica.
        </p>
      </div>

      <VehicleExpensesChart
        currency={profile?.currency ?? "EUR"}
        datasets={datasets}
      />
    </div>
  );
}
