/**
 * Servizio per gestione spese e calcoli aggregati
 */

import type { Expense, Refuel } from "@prisma/client";
import { EXPENSE_LABELS, FUEL_LABELS } from "@/lib/constants/labels";

export type ActivityEntry = {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  amount?: number;
};

export type ActivityEntryFormatted = {
  id: string;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  dateLabel: string;
  amountLabel?: string;
};

/**
 * Calcola giorni fa da una data
 */
export function calculateDaysAgo(date: Date, now: Date = new Date()): number {
  const refuelDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(
    0,
    Math.ceil((nowDay.getTime() - refuelDay.getTime()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Formatta label "X giorni fa"
 */
export function formatDaysAgoLabel(daysAgo: number): string {
  if (daysAgo === 0) return "oggi";
  return `${daysAgo} ${daysAgo === 1 ? "giorno" : "giorni"} fa`;
}

/**
 * Ottiene summary ultimo rifornimento
 */
export function getLatestRefuelSummary(
  refuel: Refuel | null,
  currency: string,
  now: Date = new Date()
): { fuel: string; amount: string; when: string } | null {
  if (!refuel) return null;

  const daysAgo = calculateDaysAgo(refuel.date, now);
  const fuelLabel = FUEL_LABELS[refuel.fuelType] ?? refuel.fuelType;
  const amountLabel = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
  }).format(refuel.amountEur);

  return {
    fuel: fuelLabel,
    amount: amountLabel,
    when: formatDaysAgoLabel(daysAgo),
  };
}

/**
 * Crea lista attività miste (scadenze, spese, rifornimenti)
 */
export function buildActivitiesTimeline(
  deadlines: Array<{ id: string; dueDate: Date; type: string }>,
  expenses: Expense[],
  refuels: Refuel[]
): ActivityEntry[] {
  const activities: ActivityEntry[] = [
    ...deadlines.map((deadline) => ({
      id: `deadline-${deadline.id}`,
      date: deadline.dueDate,
      title: deadline.type,
      subtitle: "Scadenza registrata",
      kind: "Scadenza" as const,
    })),
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: EXPENSE_LABELS[expense.category],
      subtitle: expense.description ?? "Spesa registrata",
      kind: "Spesa" as const,
      amount: expense.amountEur,
    })),
    ...refuels.map((refuel) => ({
      id: `refuel-${refuel.id}`,
      date: refuel.date,
      title: "Rifornimento",
      subtitle: FUEL_LABELS[refuel.fuelType] ?? refuel.fuelType,
      kind: "Rifornimento" as const,
      amount: refuel.amountEur,
    })),
  ];

  return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Formatta attività per display
 */
export function formatActivitiesForDisplay(
  activities: ActivityEntry[],
  currency: string
): ActivityEntryFormatted[] {
  return activities.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle,
    kind: entry.kind,
    dateLabel: entry.date.toLocaleDateString("it-IT"),
    amountLabel:
      entry.amount != null
        ? new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(
            entry.amount
          )
        : undefined,
  }));
}
