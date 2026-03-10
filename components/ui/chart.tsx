"use client";

import * as React from "react";
import { Tooltip, type TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

export function ChartContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("h-64 w-full", className)}>{children}</div>;
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <Tooltip {...props} />;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
}: TooltipProps<number, string> & {
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-medium text-foreground">
              {formatter ? formatter(Number(entry.value)) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
