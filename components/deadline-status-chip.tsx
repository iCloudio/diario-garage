import {
  getDeadlineChipAnimationClass,
  getDeadlineChipClass,
  getDeadlineChipLabel,
} from "@/lib/deadline-status";

export function DeadlineStatusChip({
  dueDate,
  now,
}: {
  dueDate: Date;
  now?: Date;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getDeadlineChipClass(
        dueDate,
        now,
      )} ${getDeadlineChipAnimationClass(dueDate, now)}`}
    >
      {getDeadlineChipLabel(dueDate, now)}
    </span>
  );
}
