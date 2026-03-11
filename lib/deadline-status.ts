function toCalendarDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function getDeadlineDiffDays(dueDate: Date, now = new Date()) {
  const dueDay = toCalendarDay(dueDate);
  const nowDay = toCalendarDay(now);

  return Math.ceil((dueDay.getTime() - nowDay.getTime()) / (1000 * 60 * 60 * 24));
}

export function getDeadlineChipClass(dueDate: Date, now = new Date()) {
  const diffDays = getDeadlineDiffDays(dueDate, now);

  if (diffDays <= 30) {
    return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300";
  }

  if (diffDays <= 90) {
    return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
}

export function getDeadlineChipLabel(dueDate: Date, now = new Date()) {
  const diffDays = getDeadlineDiffDays(dueDate, now);

  if (diffDays <= 0) return "Scaduto";
  if (diffDays <= 30) return `Tra ${diffDays} ${diffDays === 1 ? "giorno" : "giorni"}`;

  const diffMonths = Math.ceil(diffDays / 30);
  return `Tra ${diffMonths} ${diffMonths === 1 ? "mese" : "mesi"}`;
}

export function getDeadlineChipAnimationClass(dueDate: Date, now = new Date()) {
  return getDeadlineDiffDays(dueDate, now) <= 0 ? "deadline-chip-alert" : "";
}

export function getDeadlinePriority(diffDays: number | null) {
  if (diffDays == null) return 3;
  if (diffDays <= 0) return 0;
  if (diffDays <= 30) return 1;
  if (diffDays <= 90) return 2;
  return 4;
}
