import { Car, Fuel, Receipt, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { DashboardStats } from "@/lib/services/dashboard-service";

type QuickStatsWidgetProps = {
  stats: DashboardStats;
  currency: string;
};

/**
 * Quick Stats Widget
 * Displays key metrics at a glance
 */
export function QuickStatsWidget({ stats, currency }: QuickStatsWidgetProps) {
  const statsItems = [
    {
      label: "Veicoli",
      value: stats.totalVehicles.toString(),
      subtitle: `${stats.activeVehicles} attivi`,
      icon: Car,
      iconColor: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      label: "Rifornimenti",
      value: stats.totalRefuels.toString(),
      subtitle: "Totali registrati",
      icon: Fuel,
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Spese",
      value: stats.totalExpenses.toString(),
      subtitle: "Totali registrate",
      icon: Receipt,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Spesa mensile",
      value: formatCurrency(stats.monthlyExpenses, currency),
      subtitle: "Mese corrente",
      icon: TrendingUp,
      iconColor: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <div className={`rounded-lg ${item.bgColor} p-2`}>
                <Icon className={`h-5 w-5 ${item.iconColor}`} aria-hidden="true" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
