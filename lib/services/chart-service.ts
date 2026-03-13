/**
 * Servizio per preparazione dati grafici
 */

import type { Expense, Refuel } from "@prisma/client";
import { MONTHS } from "@/lib/constants/labels";

export type DatasetRow = {
  year: number;
  monthIndex: number;
  fuel: number;
  maintenance: number;
  insurance: number;
  tax: number;
};

export type ChartDataset = {
  key: string;
  label: string;
  monthlyData: Array<{
    month: string;
    total: number;
    fuel: number;
  }>;
  pieData: Array<{
    key: string;
    name: string;
    value: number;
  }>;
};

/**
 * Crea array vuoto per un anno
 */
export function createEmptyYear(year: number): DatasetRow[] {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    year,
    monthIndex,
    fuel: 0,
    maintenance: 0,
    insurance: 0,
    tax: 0,
  }));
}

/**
 * Popola dataset con spese
 */
export function populateExpensesData(
  yearMap: Map<number, DatasetRow[]>,
  expenses: Expense[]
): void {
  for (const expense of expenses) {
    const rows = yearMap.get(expense.date.getFullYear());
    if (!rows) continue;

    const row = rows[expense.date.getMonth()];
    if (!row) continue;

    if (expense.category === "MANUTENZIONE") row.maintenance += expense.amountEur;
    if (expense.category === "ASSICURAZIONE") row.insurance += expense.amountEur;
    if (expense.category === "BOLLO") row.tax += expense.amountEur;
  }
}

/**
 * Popola dataset con rifornimenti
 */
export function populateRefuelsData(
  yearMap: Map<number, DatasetRow[]>,
  refuels: Refuel[]
): void {
  for (const refuel of refuels) {
    const rows = yearMap.get(refuel.date.getFullYear());
    if (!rows) continue;

    const row = rows[refuel.date.getMonth()];
    if (!row) continue;

    row.fuel += refuel.amountEur;
  }
}

/**
 * Costruisce dataset per grafici
 */
export function buildChartDatasets(
  expenses: Expense[],
  refuels: Refuel[]
): ChartDataset[] {
  const yearsSet = new Set<number>();

  expenses.forEach((item) => yearsSet.add(item.date.getFullYear()));
  refuels.forEach((item) => yearsSet.add(item.date.getFullYear()));

  if (yearsSet.size === 0) {
    yearsSet.add(new Date().getFullYear());
  }

  const years = Array.from(yearsSet).sort((a, b) => b - a);
  const yearMap = new Map<number, DatasetRow[]>(
    years.map((year) => [year, createEmptyYear(year)])
  );

  populateExpensesData(yearMap, expenses);
  populateRefuelsData(yearMap, refuels);

  const historicalRows = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, rows]) => rows);

  const datasets: ChartDataset[] = [
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
          key: "carburante",
          name: "Carburante",
          value: historicalRows.reduce((sum, row) => sum + row.fuel, 0),
        },
        {
          key: "manutenzione",
          name: "Manutenzione",
          value: historicalRows.reduce((sum, row) => sum + row.maintenance, 0),
        },
        {
          key: "assicurazione",
          name: "Assicurazione",
          value: historicalRows.reduce((sum, row) => sum + row.insurance, 0),
        },
        {
          key: "bollo",
          name: "Bollo",
          value: historicalRows.reduce((sum, row) => sum + row.tax, 0),
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
            key: "carburante",
            name: "Carburante",
            value: rows.reduce((sum, row) => sum + row.fuel, 0),
          },
          {
            key: "manutenzione",
            name: "Manutenzione",
            value: rows.reduce((sum, row) => sum + row.maintenance, 0),
          },
          {
            key: "assicurazione",
            name: "Assicurazione",
            value: rows.reduce((sum, row) => sum + row.insurance, 0),
          },
          {
            key: "bollo",
            name: "Bollo",
            value: rows.reduce((sum, row) => sum + row.tax, 0),
          },
        ].filter((item) => item.value > 0),
      };
    }),
  ];

  return datasets;
}
