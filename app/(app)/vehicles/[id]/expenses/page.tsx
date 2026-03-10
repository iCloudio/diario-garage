"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { key: "fuel", label: "Carburante", color: "hsl(var(--primary))" },
  { key: "maintenance", label: "Manutenzione", color: "hsl(var(--accent))" },
  { key: "insurance", label: "Assicurazione", color: "hsl(var(--ring))" },
  { key: "tax", label: "Bollo", color: "hsl(var(--muted-foreground))" },
] as const;

const EXPENSES = [
  { year: 2025, month: "Gen", fuel: 110, maintenance: 80, insurance: 0, tax: 0 },
  { year: 2025, month: "Feb", fuel: 95, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2025, month: "Mar", fuel: 130, maintenance: 0, insurance: 120, tax: 0 },
  { year: 2025, month: "Apr", fuel: 105, maintenance: 50, insurance: 0, tax: 0 },
  { year: 2025, month: "Mag", fuel: 140, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2025, month: "Giu", fuel: 125, maintenance: 0, insurance: 0, tax: 90 },
  { year: 2025, month: "Lug", fuel: 150, maintenance: 120, insurance: 0, tax: 0 },
  { year: 2025, month: "Ago", fuel: 135, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2025, month: "Set", fuel: 160, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2025, month: "Ott", fuel: 120, maintenance: 220, insurance: 0, tax: 0 },
  { year: 2025, month: "Nov", fuel: 115, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2025, month: "Dic", fuel: 140, maintenance: 0, insurance: 140, tax: 0 },
  { year: 2026, month: "Gen", fuel: 130, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2026, month: "Feb", fuel: 120, maintenance: 90, insurance: 0, tax: 0 },
  { year: 2026, month: "Mar", fuel: 150, maintenance: 0, insurance: 0, tax: 0 },
  { year: 2026, month: "Apr", fuel: 135, maintenance: 0, insurance: 110, tax: 0 },
];

const CATEGORY_OPTIONS = [
  { value: "total", label: "Totale" },
  { value: "fuel", label: "Carburante" },
  { value: "maintenance", label: "Manutenzione" },
  { value: "insurance", label: "Assicurazione" },
  { value: "tax", label: "Bollo" },
];

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function sumRow(row: (typeof EXPENSES)[number]) {
  return CATEGORIES.reduce((acc, category) => acc + row[category.key], 0);
}

export default function VehicleExpensesPage() {
  const years = Array.from(new Set(EXPENSES.map((item) => item.year)));
  const [year, setYear] = useState(`${years[0] ?? new Date().getFullYear()}`);
  const [category, setCategory] = useState("total");

  const filtered = useMemo(
    () => EXPENSES.filter((item) => `${item.year}` === year),
    [year]
  );

  const monthlyData = useMemo(() => {
    return filtered.map((item) => {
      const total = category === "total" ? sumRow(item) : item[category as keyof typeof item];
      return {
        month: item.month,
        total,
        fuel: item.fuel,
      };
    });
  }, [filtered, category]);

  const pieData = useMemo(() => {
    return CATEGORIES.map((categoryItem) => ({
      name: categoryItem.label,
      value: filtered.reduce((acc, item) => acc + item[categoryItem.key], 0),
      color: categoryItem.color,
    }));
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Grafici spese
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Andamento spese</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Filtra anno e categoria per vedere l&apos;impatto sul budget.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Anno</p>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Anno" />
              </SelectTrigger>
              <SelectContent>
                {years.map((value) => (
                  <SelectItem key={value} value={`${value}`}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Categoria</p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-border bg-card p-6">
          <div className="mb-4">
            <p className="text-sm font-medium">Spese mensili</p>
            <p className="text-xs text-muted-foreground">
              Linee per totale e trend carburante.
            </p>
          </div>
          <ChartContainer>
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent formatter={currencyFormatter.format} />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Totale"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fuel"
                  name="Carburante"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="6 6"
                  strokeOpacity={0.45}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="mb-4">
            <p className="text-sm font-medium">Breakdown categorie</p>
            <p className="text-xs text-muted-foreground">Distribuzione annuale.</p>
          </div>
          <ChartContainer className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent formatter={currencyFormatter.format} />} />
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <span>{entry.name}</span>
                <span className="font-medium text-foreground">
                  {currencyFormatter.format(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
