/**
 * Vehicle Search Hook
 * Manages search state with debouncing
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { applyVehicleFilters } from "@/lib/search-utils";

type VehicleSearchable = {
  plate: string;
  make?: string | null;
  model?: string | null;
  type?: string | null;
  status?: string | null;
  deadlines?: Array<{ dueDate: Date }>;
};

export type VehicleFilters = {
  search: string;
  type: string | null;
  status: string | null;
  upcomingDeadlines: boolean;
};

export function useVehicleSearch<T extends VehicleSearchable>(
  vehicles: T[],
  debounceMs = 300
) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>("all");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [upcomingDeadlinesFilter, setUpcomingDeadlinesFilter] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Apply filters
  const filteredVehicles = useMemo(() => {
    return applyVehicleFilters(vehicles, {
      search: debouncedSearch,
      type: typeFilter,
      status: statusFilter,
      upcomingDeadlines: upcomingDeadlinesFilter,
    }) as T[];
  }, [vehicles, debouncedSearch, typeFilter, statusFilter, upcomingDeadlinesFilter]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.trim() !== "" ||
      (typeFilter !== null && typeFilter !== "all") ||
      (statusFilter !== null && statusFilter !== "all") ||
      upcomingDeadlinesFilter
    );
  }, [debouncedSearch, typeFilter, statusFilter, upcomingDeadlinesFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setUpcomingDeadlinesFilter(false);
  };

  return {
    // State
    search,
    typeFilter,
    statusFilter,
    upcomingDeadlinesFilter,

    // Computed
    filteredVehicles,
    hasActiveFilters,
    isSearching: search !== debouncedSearch, // Loading state while debouncing

    // Actions
    setSearch,
    setTypeFilter,
    setStatusFilter,
    setUpcomingDeadlinesFilter,
    clearFilters,
  };
}
