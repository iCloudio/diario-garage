/**
 * Servizio per gestione scadenze
 */

import type { Deadline } from "@prisma/client";
import { DEADLINE_TYPES } from "@/lib/constants/vehicle-types";
import { DEADLINE_LABELS } from "@/lib/constants/labels";

export type DeadlineWithStatus = {
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE";
  label: string;
  deadline: Deadline | null;
  diffDays: number | null;
  dueDateLabel: string;
  dueDate: string | null;
};

/**
 * Calcola i giorni mancanti tra ora e una data
 */
export function calculateDaysUntil(targetDate: Date, now: Date = new Date()): number {
  const targetDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.ceil((targetDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Trova una scadenza per tipo
 */
export function findDeadline(
  deadlines: Deadline[],
  type: "ASSICURAZIONE" | "BOLLO" | "REVISIONE"
): Deadline | null {
  return deadlines.find((item) => item.type === type) ?? null;
}

/**
 * Ottiene tutte le scadenze con status calcolato
 */
export function getDeadlinesWithStatus(
  deadlines: Deadline[],
  now: Date = new Date()
): DeadlineWithStatus[] {
  return DEADLINE_TYPES.map((type) => {
    const deadline = findDeadline(deadlines, type);
    const diffDays = deadline ? calculateDaysUntil(deadline.dueDate, now) : null;

    return {
      type,
      label: DEADLINE_LABELS[type],
      deadline,
      diffDays,
      dueDateLabel: deadline
        ? deadline.dueDate.toLocaleDateString("it-IT")
        : "Da inserire",
      dueDate: deadline ? deadline.dueDate.toISOString() : null,
    };
  });
}

/**
 * Filtra scadenze urgenti (entro 30 giorni)
 */
export function getUrgentDeadlines(deadlines: DeadlineWithStatus[]): DeadlineWithStatus[] {
  return deadlines.filter((item) => item.diffDays != null && item.diffDays <= 30);
}

/**
 * Filtra scadenze mancanti
 */
export function getMissingDeadlines(deadlines: DeadlineWithStatus[]): DeadlineWithStatus[] {
  return deadlines.filter((item) => item.diffDays == null);
}
