/**
 * Search Utilities
 * Helper functions for filtering and searching vehicles
 */

type VehicleSearchable = {
  plate: string;
  make?: string | null;
  model?: string | null;
  type?: string | null;
  status?: string | null;
  deadlines?: Array<{ dueDate: Date }>;
};

/**
 * Normalize string for search (lowercase, trim, remove accents)
 */
export function normalizeSearchString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents
}

/**
 * Filter vehicles by search query
 * Searches in: plate, make, model
 */
export function filterVehiclesBySearch(
  vehicles: VehicleSearchable[],
  query: string
): VehicleSearchable[] {
  if (!query.trim()) return vehicles;

  const normalizedQuery = normalizeSearchString(query);

  return vehicles.filter((vehicle) => {
    const searchableFields = [
      vehicle.plate,
      vehicle.make,
      vehicle.model,
    ].filter(Boolean);

    return searchableFields.some((field) =>
      normalizeSearchString(field!).includes(normalizedQuery)
    );
  });
}

/**
 * Filter vehicles by type
 */
export function filterVehiclesByType(
  vehicles: VehicleSearchable[],
  type: string | null
): VehicleSearchable[] {
  if (!type || type === "all") return vehicles;
  return vehicles.filter((vehicle) => vehicle.type === type);
}

/**
 * Filter vehicles by status
 */
export function filterVehiclesByStatus(
  vehicles: VehicleSearchable[],
  status: string | null
): VehicleSearchable[] {
  if (!status || status === "all") return vehicles;
  return vehicles.filter((vehicle) => vehicle.status === status);
}

/**
 * Filter vehicles with upcoming deadlines (within 30 days)
 */
export function filterVehiclesByUpcomingDeadlines(
  vehicles: VehicleSearchable[],
  enabled: boolean
): VehicleSearchable[] {
  if (!enabled) return vehicles;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return vehicles.filter((vehicle) => {
    if (!vehicle.deadlines || vehicle.deadlines.length === 0) return false;

    return vehicle.deadlines.some((deadline) => {
      return deadline.dueDate >= now && deadline.dueDate <= thirtyDaysFromNow;
    });
  });
}

/**
 * Apply all filters to vehicles
 */
export function applyVehicleFilters(
  vehicles: VehicleSearchable[],
  filters: {
    search: string;
    type: string | null;
    status: string | null;
    upcomingDeadlines: boolean;
  }
): VehicleSearchable[] {
  let filtered = vehicles;

  filtered = filterVehiclesBySearch(filtered, filters.search);
  filtered = filterVehiclesByType(filtered, filters.type);
  filtered = filterVehiclesByStatus(filtered, filters.status);
  filtered = filterVehiclesByUpcomingDeadlines(filtered, filters.upcomingDeadlines);

  return filtered;
}
