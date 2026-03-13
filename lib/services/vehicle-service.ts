/**
 * Servizio per gestione veicoli e query ottimizzate
 */

import { db } from "@/lib/db";

/**
 * Ottiene veicolo con tutte le relazioni necessarie
 * Query ottimizzata per ridurre round-trip al database
 */
export async function getVehicleWithStats(vehicleId: string, userId: string) {
  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
      refuels: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 100,
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 100,
      },
      drivers: {
        orderBy: {
          driver: { name: "asc" },
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              licenseExpiry: true,
            },
          },
        },
      },
    },
  });

  if (!vehicle) {
    return null;
  }

  // Aggrega totali in parallel con la query principale se necessario
  const [totalExpenses, totalRefuels] = await Promise.all([
    db.expense.aggregate({
      where: { vehicleId: vehicle.id, deletedAt: null },
      _sum: { amountEur: true },
    }),
    db.refuel.aggregate({
      where: { vehicleId: vehicle.id, deletedAt: null },
      _sum: { amountEur: true },
    }),
  ]);

  return {
    vehicle,
    totalExpenses: totalExpenses._sum.amountEur ?? 0,
    totalRefuels: totalRefuels._sum.amountEur ?? 0,
    lifetimeTotal: (totalExpenses._sum.amountEur ?? 0) + (totalRefuels._sum.amountEur ?? 0),
  };
}

/**
 * Ottiene tutti i guidatori disponibili per un utente
 */
export async function getAvailableDrivers(userId: string, excludeVehicleId?: string) {
  const allDrivers = await db.driver.findMany({
    where: { userId, deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      licenseExpiry: true,
    },
  });

  if (!excludeVehicleId) {
    return allDrivers;
  }

  const vehicleDrivers = await db.vehicleDriver.findMany({
    where: { vehicleId: excludeVehicleId },
    select: { driverId: true },
  });

  const assignedDriverIds = new Set(vehicleDrivers.map((vd) => vd.driverId));

  return allDrivers.filter((driver) => !assignedDriverIds.has(driver.id));
}
