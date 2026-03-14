"use client";

import { useState } from "react";
import { CalendarClock, CircleDollarSign, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { VehicleDriversSection } from "@/components/vehicle-drivers-section";
import { VehicleDeadlinesForm, type DeadlineInput } from "@/components/vehicle-deadlines-form";
import { RefuelForm } from "@/components/refuel-form";
import { ExpenseForm } from "@/components/expense-form";
import { ResponsiveOverlay } from "@/components/responsive-overlay";
import { getDeadlinePriority } from "@/lib/deadline-status";

type DeadlineRow = {
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE";
  label: string;
  dueDateLabel: string;
  dueDate: string | null;
  diffDays: number | null;
};

type DriverItem = {
  id: string;
  name: string;
  licenseExpiry: string;
};

type RefuelSummary = {
  fuel: string;
  amount: string;
  when: string;
};

type OverviewTabContentProps = {
  vehicleId: string;
  deadlineRows: DeadlineRow[];
  deadlineInputs: DeadlineInput[];
  drivers: DriverItem[];
  availableDrivers: DriverItem[];
  latestRefuelSummary: RefuelSummary | null;
  currentOdometer: number;
  vehicleFuelType: string | null;
};

/**
 * Overview Tab Content
 * Shows deadlines, drivers, and latest refuel
 */
export function OverviewTabContent({
  vehicleId,
  deadlineRows,
  deadlineInputs,
  drivers,
  availableDrivers,
  latestRefuelSummary,
  currentOdometer,
  vehicleFuelType,
}: OverviewTabContentProps) {
  const [isDeadlinesOpen, setIsDeadlinesOpen] = useState(false);
  const [isRefuelOpen, setIsRefuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Sort deadlines by priority
  const sortedDeadlines = [...deadlineRows].sort((a, b) => {
    const priorityA = getDeadlinePriority(a.diffDays);
    const priorityB = getDeadlinePriority(b.diffDays);
    return priorityA - priorityB;
  });

  const urgentDeadlines = deadlineRows.filter((d) => d.diffDays !== null && d.diffDays <= 7);
  const missingDeadlines = deadlineRows.filter((d) => d.dueDate === null);
  const isDeadlineSetupPending = missingDeadlines.length > 0;
  const deadlinesSummary =
    urgentDeadlines.length > 0
      ? urgentDeadlines.length === 1
        ? "1 urgente"
        : `${urgentDeadlines.length} urgenti`
      : missingDeadlines.length > 0
        ? missingDeadlines.length === 1
          ? "1 da inserire"
          : `${missingDeadlines.length} da inserire`
        : "In ordine";

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {/* Deadlines Section */}
        <section className="rounded-3xl border border-border/80 bg-card/90 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Scadenze
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{deadlinesSummary}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => setIsDeadlinesOpen(true)}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              {isDeadlineSetupPending ? "Imposta" : "Modifica"}
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {sortedDeadlines.map((item) => (
              <div
                key={item.type}
                className="flex items-start justify-between gap-4 rounded-2xl bg-background/55 px-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-muted-foreground">{item.dueDateLabel}</p>
                </div>
                <div className="shrink-0">
                  {item.dueDate ? (
                    <DeadlineStatusChip dueDate={new Date(item.dueDate)} />
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Da inserire
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Drivers Section */}
        <VehicleDriversSection
          vehicleId={vehicleId}
          drivers={drivers}
          availableDrivers={availableDrivers}
          embedded
        />

        {/* Refuel Section */}
        <section className="rounded-3xl border border-border/80 bg-card/90 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Carburante
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ultimo rifornimento e azioni rapide.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsRefuelOpen(true)}>
                <Fuel className="mr-2 h-4 w-4" />
                Rifornimento
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsExpenseOpen(true)}>
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Spesa
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {latestRefuelSummary ? (
              <div className="rounded-2xl bg-background/55 px-3 py-3 text-sm">
                <p className="font-medium text-foreground">{latestRefuelSummary.fuel}</p>
                <div className="mt-1 flex items-center justify-between gap-3 text-muted-foreground">
                  <span>{latestRefuelSummary.amount}</span>
                  <span>{latestRefuelSummary.when}</span>
                </div>
              </div>
            ) : (
              <p className="italic text-muted-foreground">Nessun rifornimento</p>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <ResponsiveOverlay
        open={isDeadlinesOpen}
        onOpenChange={setIsDeadlinesOpen}
        title={isDeadlineSetupPending ? "Imposta scadenze" : "Gestisci scadenze"}
        description={
          isDeadlineSetupPending
            ? "Inserisci le tre scadenze principali per completare il setup del veicolo."
            : "Aggiorna assicurazione, bollo e revisione senza uscire dalla scheda veicolo."
        }
        desktopClassName="max-w-3xl"
      >
        <VehicleDeadlinesForm
          vehicleId={vehicleId}
          deadlines={deadlineInputs}
          embedded
          mode={isDeadlineSetupPending ? "setup" : "manage"}
          onSuccess={() => setIsDeadlinesOpen(false)}
          onCancel={() => setIsDeadlinesOpen(false)}
        />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={isRefuelOpen}
        onOpenChange={setIsRefuelOpen}
        title="Registra rifornimento"
        description="Inserisci i dati del rifornimento appena effettuato."
        desktopClassName="max-w-2xl"
      >
        <RefuelForm
          vehicleId={vehicleId}
          currentOdometer={currentOdometer}
          vehicleFuelType={vehicleFuelType}
          embedded
          onSuccess={() => setIsRefuelOpen(false)}
          onCancel={() => setIsRefuelOpen(false)}
        />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={isExpenseOpen}
        onOpenChange={setIsExpenseOpen}
        title="Registra spesa"
        description="Inserisci una nuova spesa per il veicolo."
        desktopClassName="max-w-2xl"
      >
        <ExpenseForm
          vehicleId={vehicleId}
          embedded
          onSuccess={() => setIsExpenseOpen(false)}
          onCancel={() => setIsExpenseOpen(false)}
        />
      </ResponsiveOverlay>
    </>
  );
}
