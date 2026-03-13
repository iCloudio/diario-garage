import Link from "next/link";
import { Activity, Fuel, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { EXPENSE_LABELS, FUEL_LABELS } from "@/lib/constants/labels";
import type { RecentActivity } from "@/lib/services/dashboard-service";

type RecentActivityWidgetProps = {
  activities: RecentActivity[];
  currency: string;
};

/**
 * Recent Activity Widget
 * Shows recent expenses and refuels across all vehicles
 */
export function RecentActivityWidget({ activities, currency }: RecentActivityWidgetProps) {
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Attività recenti
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {activities.length === 0
              ? "Nessuna attività"
              : `Ultimi ${Math.min(activities.length, 10)} movimenti`}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        {activities.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Inizia a registrare spese e rifornimenti
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 10).map((activity) => {
              const isExpense = activity.type === "expense";
              const Icon = isExpense ? Receipt : Fuel;
              const categoryLabel = isExpense
                ? EXPENSE_LABELS[activity.category as keyof typeof EXPENSE_LABELS] ??
                  activity.category
                : FUEL_LABELS[activity.category as keyof typeof FUEL_LABELS] ??
                  activity.category;

              return (
                <Link
                  key={activity.id}
                  href={`/vehicles/${activity.vehicleId}`}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-colors hover:border-primary/35 hover:bg-card"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isExpense ? "bg-chart-3/10" : "bg-chart-2/10"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isExpense ? "text-chart-3" : "text-chart-2"}`}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{activity.vehiclePlate}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">·</span>
                      <p className="shrink-0 text-xs text-muted-foreground">{categoryLabel}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.date.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {activity.amount !== null ? (
                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatCurrency(activity.amount, currency)}
                    </p>
                  ) : null}
                </Link>
              );
            })}
            {activities.length > 10 ? (
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/vehicles">Mostra tutto</Link>
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
