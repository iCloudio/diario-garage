"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currency";

type ExpensePoint = {
  month: string;
  total: number;
  fuel: number;
};

type PiePoint = {
  name: string;
  value: number;
  color: string;
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
        <Card className="border-border bg-card p-6">
          <div className="mb-4">
            <p className="text-sm font-medium">Spese mensili</p>
            <p className="text-xs text-muted-foreground">
              {selected.key === "all"
                ? "Totale mensile con confronto carburante."
                : `${selected.label} mese per mese.`}
            </p>
          </div>
          <ChartContainer>
            <ResponsiveContainer>
              <LineChart
                data={selected.monthlyData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  width={42}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `${currencySymbol} ${value}`}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={currencyFormatter.format} />}
                  cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name={selected.label}
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4, fill: "#7c3aed" }}
                  strokeLinecap="round"
                />
                {selected.key === "all" ? (
                  <Line
                    type="monotone"
                    dataKey="fuel"
                    name="Carburante"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 4, fill: "#a78bfa" }}
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
              {selected.label}
            </span>
            {selected.key === "all" ? (
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]" />
                Carburante
              </span>
            ) : null}
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="mb-4">
            <p className="text-sm font-medium">Breakdown categorie</p>
            <p className="text-xs text-muted-foreground">
              Distribuzione per {selected.label.toLowerCase()}.
            </p>
          </div>
          <ChartContainer className="h-64">
            {selected.pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nessun dato disponibile.
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent formatter={currencyFormatter.format} />} />
                  <Pie
                    data={selected.pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {selected.pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
          <div className="mt-4 space-y-2 text-xs">
            {selected.pieData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
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
