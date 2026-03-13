"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CircleDollarSign, Fuel, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { VehicleDeadlinesForm, type DeadlineInput } from "@/components/vehicle-deadlines-form";
import { VehicleDriversSection } from "@/components/vehicle-drivers-section";
import { RefuelForm } from "@/components/refuel-form";
import { ExpenseForm } from "@/components/expense-form";
import { VehicleEditForm } from "@/components/vehicle-edit-form";
import { VehicleExpensesChart } from "@/components/vehicle-expenses-chart";
import { VehicleDangerZone } from "@/components/vehicle-danger-zone";
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
  initialModelDetail?: string | null;
  initialFirstRegistrationDate?: string | null;
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
  initialPowerKw?: number | null;
  initialPowerHp?: number | null;
  initialCubicCapacity?: number | null;
  initialAlarmSystemType?: string | null;
  initialEnvironmentalClass?: string | null;
  initialListPriceAmount?: number | null;
  initialListPriceCurrency?: string | null;
  initialInsuranceCompany?: string | null;
  initialInsurancePolicyNumber?: string | null;
  initialInsurancePresent?: boolean | null;
  initialInsuranceSuspended?: boolean | null;
  initialInsuranceCompartmentExpiry?: string | null;
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

type VehicleOverviewHubProps = {
  vehicleId: string;
  vehiclePlate: string;
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

const INITIAL_VISIBLE_ACTIVITIES = 12;
export function VehicleOverviewHub({
  vehicleId,
  vehiclePlate,
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
  const isDeadlineSetupPending = missingDeadlines.length === sortedDeadlines.length;

  const visibleHistoryEntries = activities.slice(0, visibleActivities);
  const canShowMoreHistory = activities.length > visibleActivities;

  const detailRows = [
    {
      label: "Prima immatricolazione",
      value: vehicleEditData.initialFirstRegistrationDate
        ? new Date(vehicleEditData.initialFirstRegistrationDate).toLocaleDateString("it-IT")
        : "Non specificata",
    },
    {
      label: "Alimentazione",
      value: vehicleEditData.initialFuelType
        ? vehicleEditData.initialFuelType.replaceAll("_", " ").toLowerCase()
        : "Non specificata",
    },
    {
      label: "Dettaglio modello",
      value: vehicleEditData.initialModelDetail?.trim() || "Non specificato",
    },
    {
      label: "Potenza",
      value:
        vehicleEditData.initialPowerKw != null
          ? `${vehicleEditData.initialPowerKw.toLocaleString("it-IT", {
              maximumFractionDigits: 1,
            })} kW${vehicleEditData.initialPowerHp != null ? ` · ${vehicleEditData.initialPowerHp.toLocaleString("it-IT", {
              maximumFractionDigits: 1,
            })} CV` : ""}`
          : "Non specificata",
    },
    {
      label: "Cilindrata",
      value:
        vehicleEditData.initialCubicCapacity != null
          ? `${new Intl.NumberFormat("it-IT").format(vehicleEditData.initialCubicCapacity)} cc`
          : "Non specificata",
    },
    {
      label: "Classe ambientale",
      value: vehicleEditData.initialEnvironmentalClass?.trim() || "Non specificata",
    },
    {
      label: "Antifurto",
      value: vehicleEditData.initialAlarmSystemType?.trim() || "Non specificato",
    },
    {
      label: "Listino",
      value:
        vehicleEditData.initialListPriceAmount != null &&
        vehicleEditData.initialListPriceCurrency
          ? new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: vehicleEditData.initialListPriceCurrency,
            }).format(vehicleEditData.initialListPriceAmount)
          : "Non disponibile",
    },
    {
      label: "Compagnia RCA",
      value: vehicleEditData.initialInsuranceCompany?.trim() || "Non disponibile",
    },
    {
      label: "Polizza RCA",
      value: vehicleEditData.initialInsurancePolicyNumber?.trim() || "Non disponibile",
    },
    {
      label: "Stato RCA",
      value:
        vehicleEditData.initialInsurancePresent == null
          ? "Non disponibile"
          : vehicleEditData.initialInsurancePresent
            ? vehicleEditData.initialInsuranceSuspended
              ? "Attiva ma sospesa"
              : "Attiva"
            : "Non presente",
    },
    {
      label: "Scadenza comparto RCA",
      value: vehicleEditData.initialInsuranceCompartmentExpiry
        ? new Date(vehicleEditData.initialInsuranceCompartmentExpiry).toLocaleDateString("it-IT")
        : "Non disponibile",
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
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-3">
          <section className="rounded-3xl border border-border/80 bg-card/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Scadenze
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {urgentDeadlines.length > 0
                    ? urgentDeadlines.length === 1
                      ? "Una scadenza richiede attenzione immediata."
                      : `${urgentDeadlines.length} scadenze richiedono attenzione immediata.`
                    : missingDeadlines.length > 0
                      ? missingDeadlines.length === 1
                        ? "Manca ancora una scadenza principale."
                        : `Mancano ancora ${missingDeadlines.length} scadenze principali.`
                      : "Tutte le scadenze principali risultano registrate."}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsDeadlinesOpen(true)}>
                <CalendarClock className="mr-2 h-4 w-4" />
                {isDeadlineSetupPending ? "Imposta" : "Modifica"}
              </Button>
            </div>

            <div className="mt-5 space-y-3">
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
          </section>

          <VehicleDriversSection
            vehicleId={vehicleId}
            drivers={drivers}
            availableDrivers={availableDrivers}
            embedded
          />

          <section className="rounded-3xl border border-border/80 bg-card/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Carburante
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ultimo rifornimento registrato e azioni rapide.
                </p>
              </div>
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

            <div className="mt-5">
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
          </section>
        </div>

        <section
          id="vehicle-details"
          className="rounded-3xl border border-border/80 bg-card/90 p-6"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Storico
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Andamento economico e attivita&apos; registrate sul veicolo.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Totale registrato:{" "}
              <span className="font-medium text-foreground">{totalRecordedLabel}</span>
            </p>
          </div>

          {chartDatasets.length > 0 ? (
            <div className="mt-5">
              <VehicleExpensesChart currency={currency} datasets={chartDatasets} />
            </div>
          ) : null}

          <div className="mt-6">
            {activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
                Nessuna attivita&apos; registrata.
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
        </section>

        <section className="rounded-3xl border border-border/80 bg-card/90 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Dettagli veicolo
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Dati amministrativi e informazioni di vendita.
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {detailRows.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <VehicleDangerZone vehicleId={vehicleId} vehiclePlate={vehiclePlate} />
      </div>

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
