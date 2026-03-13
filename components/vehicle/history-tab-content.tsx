"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VehicleExpensesChart } from "@/components/vehicle-expenses-chart";
import { EmptyChart } from "@/components/empty-states";

type ActivityEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  dateLabel: string;
  amountLabel?: string;
};

type ChartDataset = {
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

type HistoryTabContentProps = {
  vehicleId: string;
  currency: string;
  activities: ActivityEntry[];
  totalRecordedLabel: string;
  chartDatasets: ChartDataset[];
};

const INITIAL_VISIBLE_ACTIVITIES = 10;

/**
 * History Tab Content
 * Shows charts and activity timeline
 */
export function HistoryTabContent({
  vehicleId,
  currency,
  activities,
  totalRecordedLabel,
  chartDatasets,
}: HistoryTabContentProps) {
  const [visibleActivities, setVisibleActivities] = useState(INITIAL_VISIBLE_ACTIVITIES);

  const visibleHistoryEntries = activities.slice(0, visibleActivities);
  const canShowMoreHistory = visibleActivities < activities.length;

  // Count total movements for chart threshold
  const totalMovements = activities.length;
  const minMovements = 3;
  const hasEnoughData = totalMovements >= minMovements;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Storico
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Andamento economico e attività registrate sul veicolo.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Totale registrato:{" "}
          <span className="font-medium text-foreground">{totalRecordedLabel}</span>
        </p>
      </div>

      {/* Charts Section */}
      {(() => {
        if (!hasEnoughData) {
          return (
            <div className="mt-5">
              <EmptyChart
                currentCount={totalMovements}
                requiredCount={minMovements}
                dataType="movimenti"
                ctaLabel="Aggiungi movimento"
                ctaHref={`/vehicles/${vehicleId}`}
              />
            </div>
          );
        }

        if (chartDatasets.length > 0) {
          return (
            <div className="mt-5">
              <VehicleExpensesChart currency={currency} datasets={chartDatasets} />
            </div>
          );
        }

        return null;
      })()}

      {/* Timeline Section */}
      <div className="mt-6">
        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
            Nessuna attività registrata.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {visibleHistoryEntries.map((entry, index) => (
              <div key={entry.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex w-5 flex-col items-center">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70" />
                  {index < visibleHistoryEntries.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-border/80" />
                  ) : null}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {entry.kind}
                        </span>
                        <p className="truncate text-base font-medium text-foreground">
                          {entry.title}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.subtitle}</p>
                    </div>

                    <div className="text-left md:text-right">
                      {entry.amountLabel ? (
                        <p className="text-sm font-medium text-foreground">
                          {entry.amountLabel}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{entry.dateLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canShowMoreHistory ? (
        <div className="mt-4">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              setVisibleActivities((current) => current + INITIAL_VISIBLE_ACTIVITIES)
            }
          >
            Mostra altro
          </Button>
        </div>
      ) : null}
    </div>
  );
}
