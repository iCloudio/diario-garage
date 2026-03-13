"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp, Fuel, Calendar, Gauge } from "lucide-react";
import { VehicleHeroCard } from "./vehicle-hero-card";
import { TabPanel, type TabId } from "./vehicle-tabs";
import { OverviewTabContent } from "./overview-tab-content";
import { HistoryTabContent } from "./history-tab-content";
import { DetailsTabContent } from "./details-tab-content";
import { RefuelForm } from "@/components/refuel-form";
import { ExpenseForm } from "@/components/expense-form";
import { VehicleEditForm } from "@/components/vehicle-edit-form";
import { ResponsiveOverlay } from "@/components/responsive-overlay";

type DeadlineRow = {
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE";
  label: string;
  dueDateLabel: string;
  dueDate: string | null;
  diffDays: number | null;
};

type DeadlineInput = {
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE";
  dueDate: string;
  amount: number | null;
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

type VehicleDetailHeroProps = {
  vehicleId: string;
  vehiclePlate: string;
  vehicleFuelType?: string | null;
  vehicleOdometerKm?: number | null;
  currency: string;
  totalExpenses: number;
  totalRefuels: number;
  lifetimeTotal: number;
  deadlineRows: DeadlineRow[];
  deadlineInputs: DeadlineInput[];
  drivers: DriverItem[];
  availableDrivers: DriverItem[];
  latestRefuelSummary: RefuelSummary | null;
  activities: ActivityEntry[];
  chartDatasets: ChartDataset[];
  vehicleEditData: VehicleEditData;
};

/**
 * Vehicle Detail Hero
 * Main component for vehicle detail page with hero card layout
 */
export function VehicleDetailHero({
  vehicleId,
  vehiclePlate,
  vehicleFuelType,
  vehicleOdometerKm,
  currency,
  totalExpenses,
  totalRefuels,
  lifetimeTotal,
  deadlineRows,
  deadlineInputs,
  drivers,
  availableDrivers,
  latestRefuelSummary,
  activities,
  chartDatasets,
  vehicleEditData,
}: VehicleDetailHeroProps) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) || "overview";

  const [isRefuelOpen, setIsRefuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Calculate urgent deadlines count
  const urgentDeadlinesCount = deadlineRows.filter(
    (d) => d.diffDays !== null && d.diffDays <= 7
  ).length;

  // Prepare quick stats
  const quickStats = [
    {
      label: "Spese totali",
      value: new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(lifetimeTotal),
      icon: TrendingUp,
      iconColor: "text-chart-1",
    },
    {
      label: "Rifornimenti",
      value: totalRefuels.toString(),
      icon: Fuel,
      iconColor: "text-chart-2",
    },
    {
      label: "Spese",
      value: totalExpenses.toString(),
      icon: Calendar,
      iconColor: "text-chart-3",
    },
  ];

  // Add odometer to stats if available
  if (vehicleOdometerKm) {
    quickStats.push({
      label: "Chilometri",
      value: new Intl.NumberFormat("it-IT").format(vehicleOdometerKm),
      icon: Gauge,
      iconColor: "text-chart-4",
    });
  }

  const totalRecordedLabel = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(lifetimeTotal);

  return (
    <>
      <VehicleHeroCard
        vehicleId={vehicleId}
        quickStats={quickStats}
        urgentDeadlinesCount={urgentDeadlinesCount}
        onRefuelClick={() => setIsRefuelOpen(true)}
        onExpenseClick={() => setIsExpenseOpen(true)}
        onEditClick={() => setIsEditOpen(true)}
      >
        {/* Overview Tab */}
        <TabPanel tabId="overview" activeTab={activeTab}>
          <OverviewTabContent
            vehicleId={vehicleId}
            deadlineRows={deadlineRows}
            deadlineInputs={deadlineInputs}
            drivers={drivers}
            availableDrivers={availableDrivers}
            latestRefuelSummary={latestRefuelSummary}
            currentOdometer={vehicleOdometerKm ?? 0}
            vehicleFuelType={vehicleFuelType}
          />
        </TabPanel>

        {/* History Tab */}
        <TabPanel tabId="history" activeTab={activeTab}>
          <HistoryTabContent
            vehicleId={vehicleId}
            currency={currency}
            activities={activities}
            totalRecordedLabel={totalRecordedLabel}
            chartDatasets={chartDatasets}
          />
        </TabPanel>

        {/* Details Tab */}
        <TabPanel tabId="details" activeTab={activeTab}>
          <DetailsTabContent
            vehicleId={vehicleId}
            vehiclePlate={vehiclePlate}
            currency={currency}
            vehicleEditData={vehicleEditData}
          />
        </TabPanel>
      </VehicleHeroCard>

      {/* Modals */}
      <ResponsiveOverlay
        open={isRefuelOpen}
        onOpenChange={setIsRefuelOpen}
        title="Registra rifornimento"
        description="Inserisci i dati del rifornimento appena effettuato."
        desktopClassName="max-w-2xl"
      >
        <RefuelForm
          vehicleId={vehicleId}
          currentOdometer={vehicleOdometerKm ?? 0}
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

      <ResponsiveOverlay
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifica veicolo"
        description="Aggiorna i dettagli del veicolo."
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
