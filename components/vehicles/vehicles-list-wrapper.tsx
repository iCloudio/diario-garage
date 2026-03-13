"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeadlineStatusChip } from "@/components/deadline-status-chip";
import { VehicleSearchBar } from "./vehicle-search-bar";
import { VehicleFilters } from "./vehicle-filters";
import { useVehicleSearch } from "@/hooks/use-vehicle-search";
import { cn } from "@/lib/utils";
import type { DEADLINE_LABELS, FUEL_LABELS, VEHICLE_LABELS } from "@/lib/constants/labels";

type Vehicle = {
  id: string;
  plate: string;
  make?: string | null;
  model?: string | null;
  type: keyof typeof VEHICLE_LABELS | null;
  status: "ATTIVO" | "VENDUTO" | "ROTTAMATO";
  firstRegistrationDate?: Date | null;
  odometerKm?: number | null;
  deadlines: Array<{
    id: string;
    type: keyof typeof DEADLINE_LABELS;
    dueDate: Date;
  }>;
  refuels: Array<{
    id: string;
    fuelType: keyof typeof FUEL_LABELS;
    amountEur: number;
    date: Date;
  }>;
  drivers: Array<{
    driver: {
      id: string;
      name: string;
      licenseExpiry: Date;
    };
  }>;
};

type VehiclesListWrapperProps = {
  vehicles: Vehicle[];
  currency: string;
  now: Date;
  VEHICLE_LABELS: typeof VEHICLE_LABELS;
  DEADLINE_LABELS: typeof DEADLINE_LABELS;
  FUEL_LABELS: typeof FUEL_LABELS;
  formatCurrency: (amount: number, currency: string) => string;
  calculateDaysAgo: (date: Date, now: Date) => number;
  formatDaysAgoLabel: (days: number) => string;
  getLicenseExpiryClass: (date: Date, now: Date) => string;
  getLicenseExpiryAnimationClass: (date: Date, now: Date) => string;
  formatLicenseExpiryLabel: (date: Date) => string;
  renderVehicleCard: (vehicle: Vehicle) => React.ReactNode;
};

/**
 * Vehicles List Wrapper
 * Client component that handles search and filtering
 */
export function VehiclesListWrapper({
  vehicles,
  renderVehicleCard,
}: Pick<VehiclesListWrapperProps, "vehicles" | "renderVehicleCard">) {
  const {
    search,
    typeFilter,
    statusFilter,
    upcomingDeadlinesFilter,
    filteredVehicles,
    hasActiveFilters,
    isSearching,
    setSearch,
    setTypeFilter,
    setStatusFilter,
    setUpcomingDeadlinesFilter,
    clearFilters,
  } = useVehicleSearch(vehicles);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <VehicleSearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
        isSearching={isSearching}
      />

      {/* Filters */}
      <VehicleFilters
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        upcomingDeadlinesFilter={upcomingDeadlinesFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        onUpcomingDeadlinesChange={setUpcomingDeadlinesFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results */}
      {filteredVehicles.length === 0 ? (
        <Card className="border-dashed p-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Nessun veicolo trovato
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Prova a modificare i filtri di ricerca"
              : "Non ci sono veicoli da visualizzare"}
          </p>
        </Card>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              {filteredVehicles.length === 1
                ? "1 veicolo trovato"
                : `${filteredVehicles.length} veicoli trovati`}
            </p>
            {hasActiveFilters && (
              <p className="text-xs">
                {vehicles.length === filteredVehicles.length
                  ? "Tutti i veicoli"
                  : `${filteredVehicles.length} di ${vehicles.length}`}
              </p>
            )}
          </div>

          {/* Vehicle cards grid */}
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => renderVehicleCard(vehicle))}
          </div>
        </>
      )}
    </div>
  );
}
