import Link from "next/link";
import { AlertCircle, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { DEADLINE_LABELS } from "@/lib/constants/labels";
import type { UpcomingDeadline } from "@/lib/services/dashboard-service";

type UpcomingDeadlinesWidgetProps = {
  deadlines: UpcomingDeadline[];
};

/**
 * Upcoming Deadlines Widget
 * Shows urgent and upcoming deadlines across all vehicles
 */
export function UpcomingDeadlinesWidget({ deadlines }: UpcomingDeadlinesWidgetProps) {
  const urgentDeadlines = deadlines.filter((d) => d.diffDays <= 7);
  const hasUrgent = urgentDeadlines.length > 0;

  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Scadenze imminenti
            </p>
          </div>
          {hasUrgent ? (
            <div className="mt-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {urgentDeadlines.length === 1
                  ? "1 scadenza richiede attenzione"
                  : `${urgentDeadlines.length} scadenze richiedono attenzione`}
              </p>
            </div>
          ) : deadlines.length > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Prossime {deadlines.length} scadenze
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Nessuna scadenza imminente</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex-1">
        {deadlines.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">Tutte le scadenze sono a posto! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deadlines.slice(0, 5).map((deadline) => (
              <Link
                key={deadline.id}
                href={`/vehicles/${deadline.vehicleId}`}
                className="block rounded-lg border border-border/50 bg-card/50 p-3 transition-colors hover:border-primary/35 hover:bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{deadline.vehiclePlate}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">·</span>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {DEADLINE_LABELS[deadline.type]}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {deadline.dueDate.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <DeadlineStatusChip dueDate={deadline.dueDate} />
                </div>
              </Link>
            ))}
            {deadlines.length > 5 ? (
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/vehicles">
                  Mostra tutte ({deadlines.length - 5} rimanenti)
                </Link>
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
}
