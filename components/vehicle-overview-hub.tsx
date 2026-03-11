"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CircleDollarSign, Fuel, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { VehicleDeadlinesForm, type DeadlineInput } from "@/components/vehicle-deadlines-form";
import { VehicleDriversSection } from "@/components/vehicle-drivers-section";
import { RefuelForm } from "@/components/refuel-form";
import { ExpenseForm } from "@/components/expense-form";
import { VehicleEditForm } from "@/components/vehicle-edit-form";
import { VehicleExpensesChart } from "@/components/vehicle-expenses-chart";
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

type ActivityEntry = {
  id: string;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  dateLabel: string;
  amountLabel?: string;
};

type VehicleEditData = {
  initialPlate: string;
  initialMake?: string | null;
  initialModel?: string | null;
  initialOdometerKm?: number | null;
  initialType?: "AUTO" | "MOTO" | "CAMPER";
  initialFuelType?:
    | "BENZINA"
    | "DIESEL"
    | "GPL"
    | "METANO"
    | "ELETTRICO"
    | "IBRIDO_BENZINA"
    | "IBRIDO_DIESEL"
    | null;
  initialStatus?: "ATTIVO" | "VENDUTO" | "ROTTAMATO";
  initialSoldDate?: string | null;
  initialSoldPrice?: number | null;
  initialSoldNotes?: string | null;
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
    name: string;
    value: number;
    color: string;
  }>;
};

type HistoryFilter = "Tutto" | "Spesa" | "Rifornimento" | "Scadenza";

type VehicleOverviewHubProps = {
  vehicleId: string;
  currency: string;
  deadlineRows: DeadlineRow[];
  deadlineInputs: DeadlineInput[];
  drivers: DriverItem[];
  availableDrivers: DriverItem[];
  latestRefuelSummary: RefuelSummary | null;
  currentOdometer: number;
  vehicleFuelType?:
    | "BENZINA"
    | "DIESEL"
    | "GPL"
    | "METANO"
    | "ELETTRICO"
    | "IBRIDO_BENZINA"
    | "IBRIDO_DIESEL"
    | null;
  activities: ActivityEntry[];
  totalRecordedLabel: string;
  chartDatasets: ChartDataset[];
  vehicleEditData: VehicleEditData;
};

const HISTORY_FILTERS: HistoryFilter[] = ["Tutto", "Spesa", "Rifornimento", "Scadenza"];
const INITIAL_VISIBLE_ACTIVITIES = 12;
export function VehicleOverviewHub({
  vehicleId,
  currency,
  deadlineRows,
  deadlineInputs,
  drivers,
  availableDrivers,
  latestRefuelSummary,
  currentOdometer,
  vehicleFuelType,
  activities,
  totalRecordedLabel,
  chartDatasets,
  vehicleEditData,
}: VehicleOverviewHubProps) {
  const [isDeadlinesOpen, setIsDeadlinesOpen] = useState(false);
  const [isRefuelOpen, setIsRefuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("Tutto");
  const [visibleActivities, setVisibleActivities] = useState(INITIAL_VISIBLE_ACTIVITIES);

  const sortedDeadlines = useMemo(
    () =>
      [...deadlineRows].sort((a, b) => {
        const priorityDiff = getDeadlinePriority(a.diffDays) - getDeadlinePriority(b.diffDays);
        if (priorityDiff !== 0) return priorityDiff;
        if (a.diffDays == null && b.diffDays == null) return a.label.localeCompare(b.label, "it-IT");
        if (a.diffDays == null) return 1;
        if (b.diffDays == null) return -1;
        return a.diffDays - b.diffDays;
      }),
    [deadlineRows],
  );

  const urgentDeadlines = sortedDeadlines.filter(
    (item) => item.diffDays != null && item.diffDays <= 30,
  );
  const missingDeadlines = sortedDeadlines.filter((item) => item.diffDays == null);

  const filteredActivities = useMemo(() => {
    if (historyFilter === "Tutto") return activities;
    return activities.filter((entry) => entry.kind === historyFilter);
  }, [activities, historyFilter]);

  const visibleHistoryEntries = filteredActivities.slice(0, visibleActivities);
  const canShowMoreHistory = filteredActivities.length > visibleActivities;

  const detailRows = [
    {
      label: "Alimentazione",
      value: vehicleEditData.initialFuelType
        ? vehicleEditData.initialFuelType.replaceAll("_", " ").toLowerCase()
        : "Non specificata",
    },
    {
      label: "Stato amministrativo",
      value:
        vehicleEditData.initialStatus === "VENDUTO"
          ? "Venduto"
          : vehicleEditData.initialStatus === "ROTTAMATO"
            ? "Rottamato"
            : "Attivo",
    },
    {
      label: "Vendita",
      value:
        vehicleEditData.initialStatus === "VENDUTO" && vehicleEditData.initialSoldDate
          ? `${new Date(vehicleEditData.initialSoldDate).toLocaleDateString("it-IT")}${vehicleEditData.initialSoldPrice != null ? ` · ${new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(vehicleEditData.initialSoldPrice)}` : ""}`
          : "Non applicabile",
    },
    {
      label: "Note vendita",
      value: vehicleEditData.initialSoldNotes?.trim() || "Nessuna nota",
    },
  ];

  return (
    <>
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Gestione veicolo
          </p>
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/55 p-5">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Scadenze
              </p>
              <div className="h-px flex-1 bg-border/70" />
              <Button size="sm" variant="ghost" onClick={() => setIsDeadlinesOpen(true)}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Modifica
              </Button>
            </div>

            {urgentDeadlines.length > 0 ? (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">
                {urgentDeadlines.length === 1
                  ? "Una scadenza richiede attenzione immediata."
                  : `${urgentDeadlines.length} scadenze richiedono attenzione immediata.`}
              </p>
            ) : missingDeadlines.length > 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {missingDeadlines.length === 1
                  ? "Manca ancora una scadenza principale."
                  : `Mancano ancora ${missingDeadlines.length} scadenze principali.`}
              </p>
            ) : (
              <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
                Tutte le scadenze principali risultano registrate.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {sortedDeadlines.map((item) => (
                <div key={item.type} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-muted-foreground">{item.dueDateLabel}</p>
                  </div>
                  {item.dueDate ? (
                    <DeadlineStatusChip dueDate={new Date(item.dueDate)} />
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Da inserire
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <VehicleDriversSection
            vehicleId={vehicleId}
            drivers={drivers}
            availableDrivers={availableDrivers}
            embedded
          />

          <div className="rounded-2xl border border-border/70 bg-background/55 p-5">
            <div className="flex items-center gap-3">
              <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Carburante
              </p>
              <div className="h-px flex-1 bg-border/70" />
              <div className="flex items-center gap-1">
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
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <p className="text-left text-foreground">{latestRefuelSummary.fuel}</p>
                  <p className="text-center text-foreground">{latestRefuelSummary.amount}</p>
                  <p className="text-right text-foreground">{latestRefuelSummary.when}</p>
                </div>
              ) : (
                <p className="italic text-muted-foreground">Nessun rifornimento</p>
              )}
            </div>
          </div>
        </div>

        <div className="my-6 h-px bg-border/70" />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Storico
            </p>
            <div className="h-px min-w-16 flex-1 bg-border/70" />
            <p className="text-sm text-muted-foreground">
              Totale registrato:{" "}
              <span className="font-medium text-foreground">{totalRecordedLabel}</span>
            </p>
          </div>

          {chartDatasets.length > 0 ? (
            <div className="mt-4">
              <VehicleExpensesChart currency={currency} datasets={chartDatasets} />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {HISTORY_FILTERS.map((filter) => (
              <Button
                key={filter}
                type="button"
                size="sm"
                variant={historyFilter === filter ? "secondary" : "outline"}
                onClick={() => {
                  setHistoryFilter(filter);
                  setVisibleActivities(INITIAL_VISIBLE_ACTIVITIES);
                }}
              >
                {filter}
              </Button>
            ))}
          </div>

          <details className="mt-6 rounded-2xl border border-border/70 bg-background/45 p-5">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Mostra attivita&apos; registrate
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Se vuoi verificare tutto il dettaglio cronologico, qui trovi l&apos;elenco completo.
            </p>

            <div className="mt-4 space-y-0">
              {filteredActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
                  Nessuna voce presente per il filtro selezionato.
                </div>
              ) : (
                visibleHistoryEntries.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex w-5 flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary/70" />
                      {index < visibleHistoryEntries.length - 1 ? (
                        <span className="mt-2 h-full w-px bg-border/80" />
                      ) : null}
                    </div>

                    <div className="flex-1 border-b border-border/60 pb-4 last:border-b-0">
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
                ))
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
          </details>
        </div>

        <div className="my-6 h-px bg-border/70" />

        <div>
          <div className="flex items-center gap-3">
            <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Dettagli veicolo
            </p>
            <div className="h-px flex-1 bg-border/70" />
            <Button size="sm" variant="ghost" onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {detailRows.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <ResponsiveOverlay
        open={isDeadlinesOpen}
        onOpenChange={setIsDeadlinesOpen}
        title="Gestisci scadenze"
        description="Aggiorna assicurazione, bollo e revisione senza uscire dalla scheda veicolo."
        desktopClassName="max-w-3xl"
      >
        <VehicleDeadlinesForm
          vehicleId={vehicleId}
          deadlines={deadlineInputs}
          embedded
          onSuccess={() => setIsDeadlinesOpen(false)}
        />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={isRefuelOpen}
        onOpenChange={setIsRefuelOpen}
        title="Aggiungi rifornimento"
        description="Registra il rifornimento direttamente da questa scheda."
        desktopClassName="max-w-3xl"
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
        title="Aggiungi spesa"
        description="Registra una spesa senza lasciare la scheda del veicolo."
        desktopClassName="max-w-3xl"
      >
        <ExpenseForm
          vehicleId={vehicleId}
          currentOdometer={currentOdometer || undefined}
          embedded
          onSuccess={() => setIsExpenseOpen(false)}
          onCancel={() => setIsExpenseOpen(false)}
        />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifica veicolo"
        description="Aggiorna anagrafica, stato e dati amministrativi senza cambiare pagina."
        desktopClassName="max-w-4xl"
      >
        <VehicleEditForm
          vehicleId={vehicleId}
          embedded
          onSuccess={() => setIsEditOpen(false)}
          onCancel={() => setIsEditOpen(false)}
          {...vehicleEditData}
        />
      </ResponsiveOverlay>
    </>
  );
}
