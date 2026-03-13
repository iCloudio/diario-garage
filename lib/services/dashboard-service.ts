/**
 * Dashboard Service
 * Aggregates data across all vehicles for dashboard overview
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type DashboardStats = {
  totalVehicles: number;
  activeVehicles: number;
  totalExpenses: number;
  totalRefuels: number;
  monthlyExpenses: number;
};

export type UpcomingDeadline = {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE";
  dueDate: Date;
  diffDays: number;
};

export type RecentActivity = {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: "expense" | "refuel" | "deadline";
  category: string;
  date: Date;
  amount: number | null;
};

const vehicleWithRelationsSelect = {
  id: true,
  plate: true,
  make: true,
  model: true,
  status: true,
  deadlines: {
    where: { deletedAt: null },
    select: {
      id: true,
      type: true,
      dueDate: true,
    },
    orderBy: { dueDate: "asc" as const },
  },
  expenses: {
    where: { deletedAt: null },
    select: {
      id: true,
      date: true,
      amountEur: true,
      category: true,
      description: true,
    },
    orderBy: { date: "desc" as const },
    take: 100,
  },
  refuels: {
    where: { deletedAt: null },
    select: {
      id: true,
      date: true,
      amountEur: true,
      fuelType: true,
      liters: true,
    },
    orderBy: { date: "desc" as const },
    take: 100,
  },
} satisfies Prisma.VehicleSelect;

export type VehicleWithRelations = Prisma.VehicleGetPayload<{
  select: typeof vehicleWithRelationsSelect;
}>;

/**
 * Get all vehicles with related data for dashboard
 * Optimized: single query with all needed relations
 */
export async function getDashboardVehicles(userId: string): Promise<VehicleWithRelations[]> {
  return db.vehicle.findMany({
    where: { userId, deletedAt: null },
    select: vehicleWithRelationsSelect,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Calculate dashboard statistics
 */
export function calculateDashboardStats(vehicles: VehicleWithRelations[]): DashboardStats {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalExpenses = 0;
  let totalRefuels = 0;
  let monthlyExpenses = 0;

  for (const vehicle of vehicles) {
    totalExpenses += vehicle.expenses.length;
    totalRefuels += vehicle.refuels.length;

    // Calculate current month expenses
    for (const expense of vehicle.expenses) {
      if (
        expense.date.getMonth() === currentMonth &&
        expense.date.getFullYear() === currentYear
      ) {
        monthlyExpenses += expense.amountEur;
      }
    }

    // Add refuels to monthly expenses
    for (const refuel of vehicle.refuels) {
      if (
        refuel.date.getMonth() === currentMonth &&
        refuel.date.getFullYear() === currentYear
      ) {
        monthlyExpenses += refuel.amountEur;
      }
    }
  }

  return {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "ATTIVO").length,
    totalExpenses,
    totalRefuels,
    monthlyExpenses,
  };
}

/**
 * Get upcoming deadlines across all vehicles
 * Sorted by urgency (soonest first)
 */
export function getUpcomingDeadlines(
  vehicles: VehicleWithRelations[],
  now: Date,
  limit = 10
): UpcomingDeadline[] {
  const upcomingDeadlines: UpcomingDeadline[] = [];

  for (const vehicle of vehicles) {
    for (const deadline of vehicle.deadlines) {
      const diffTime = deadline.dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Only include future deadlines or recently expired (within 7 days)
      if (diffDays >= -7) {
        upcomingDeadlines.push({
          id: deadline.id,
          vehicleId: vehicle.id,
          vehiclePlate: vehicle.plate,
          type: deadline.type,
          dueDate: deadline.dueDate,
          diffDays,
        });
      }
    }
  }

  // Sort by urgency (soonest first, then expired)
  upcomingDeadlines.sort((a, b) => {
    // Expired deadlines first
    if (a.diffDays < 0 && b.diffDays >= 0) return -1;
    if (a.diffDays >= 0 && b.diffDays < 0) return 1;
    // Then by days
    return a.diffDays - b.diffDays;
  });

  return upcomingDeadlines.slice(0, limit);
}

/**
 * Get recent activity across all vehicles
 * Combines expenses, refuels, and deadlines
 */
export function getRecentActivity(
  vehicles: VehicleWithRelations[],
  limit = 15
): RecentActivity[] {
  const activities: RecentActivity[] = [];

  for (const vehicle of vehicles) {
    // Add expenses
    for (const expense of vehicle.expenses) {
      activities.push({
        id: `expense-${expense.id}`,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        type: "expense",
        category: expense.category,
        date: expense.date,
        amount: expense.amountEur,
      });
    }

    // Add refuels
    for (const refuel of vehicle.refuels) {
      activities.push({
        id: `refuel-${refuel.id}`,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plate,
        type: "refuel",
        category: refuel.fuelType,
        date: refuel.date,
        amount: refuel.amountEur,
      });
    }
  }

  // Sort by date (most recent first)
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return activities.slice(0, limit);
}
