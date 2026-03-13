"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currency";

type ExpensePoint = {
  month: string;
  total: number;
  fuel: number;
};

type PiePoint = {
  key: string;
  name: string;
  value: number;
};

type VehicleExpensesChartProps = {
  currency: string;
  datasets: Array<{
    key: string;
    label: string;
    monthlyData: ExpensePoint[];
    pieData: PiePoint[];
  }>;
};

export function VehicleExpensesChart({
  currency,
  datasets,
}: VehicleExpensesChartProps) {
  const [selectedKey, setSelectedKey] = useState(datasets[0]?.key ?? "all");
  const selected = datasets.find((item) => item.key === selectedKey) ?? datasets[0];
  const currencySymbol = getCurrencySymbol(currency);

  const currencyFormatter = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  const lineChartConfig = {
    total: {
      label: selected.label,
      color: "var(--chart-1)",
    },
    fuel: {
      label: "Carburante",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
  const pieChartConfig = {
    carburante: {
      label: "Carburante",
      color: "var(--chart-1)",
    },
    manutenzione: {
      label: "Manutenzione",
      color: "var(--chart-2)",
    },
    assicurazione: {
      label: "Assicurazione",
      color: "var(--chart-3)",
    },
    bollo: {
      label: "Bollo",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;
  const selectedPieData = selected.pieData.map((entry) => ({
    ...entry,
    fill: `var(--color-${entry.key})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {datasets.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-accent/40 hover:text-foreground",
              selectedKey === item.key && "border-primary/20 bg-primary/10 text-foreground"
            )}
            onClick={() => setSelectedKey(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl bg-background/45 p-5">
          <div className="mb-4">
            <p className="text-sm font-medium">Spese mensili</p>
            <p className="text-xs text-muted-foreground">
              {selected.key === "all"
                ? "Totale mensile con confronto carburante."
                : `${selected.label} mese per mese.`}
            </p>
          </div>
          <ChartContainer className="h-[18rem]" config={lineChartConfig}>
            <LineChart
              accessibilityLayer
              data={selected.monthlyData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />
              <YAxis
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${currencySymbol} ${value}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={currencyFormatter.format} indicator="line" />}
                cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-total)" }}
                strokeLinecap="round"
              />
              {selected.key === "all" ? (
                <Line
                  type="monotone"
                  dataKey="fuel"
                  stroke="var(--color-fuel)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-fuel)" }}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              ) : null}
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-2xl bg-background/45 p-5">
          <div className="mb-4">
            <p className="text-sm font-medium">Breakdown categorie</p>
            <p className="text-xs text-muted-foreground">
              Distribuzione per {selected.label.toLowerCase()}.
            </p>
          </div>
          {selectedPieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Nessun dato disponibile.
            </div>
          ) : (
            <ChartContainer className="h-[18rem]" config={pieChartConfig}>
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={currencyFormatter.format}
                      hideLabel
                      nameKey="key"
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent nameKey="key" />} />
                <Pie
                  data={selectedPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {selectedPieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={entry.fill}
                      name={entry.name}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
          <div className="mt-4 space-y-2 text-xs">
            {selectedPieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  {entry.name}
                </span>
                <span className="font-medium text-foreground">
                  {currencyFormatter.format(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
