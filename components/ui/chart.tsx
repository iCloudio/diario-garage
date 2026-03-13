"use client";

import * as React from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
  type LegendProps,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

const THEMES = {
  light: "",
  dark: ".dark",
} as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<keyof typeof THEMES, string>;
  };
};

type ChartContextValue = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) {
  const colorConfig = Object.entries(config).filter(
    ([, value]) => value.color || value.theme,
  );

  if (!colorConfig.length) {
    return null;
  }

  const styles = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const declarations = colorConfig
        .map(([key, value]) => {
          const color = value.theme?.[theme as keyof typeof THEMES] ?? value.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");

      if (!declarations) {
        return null;
      }

      return `${prefix} [data-chart="${id}"] {\n${declarations}\n}`;
    })
    .filter(Boolean)
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styles }} />;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
}) {
  const uniqueId = React.useId().replace(/:/g, "");
  const chartId = `chart-${id ?? uniqueId}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex h-64 w-full justify-center text-xs",
          "[&_.recharts-wrapper]:overflow-visible",
          "[&_.recharts-surface]:overflow-visible",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          className,
        )}
      >
        <ChartStyle config={config} id={chartId} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = Tooltip;

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: Record<string, unknown>,
  key: string,
) {
  const payloadData = payload?.payload as Record<string, unknown> | undefined;
  const configKey =
    typeof payload[key] === "string"
      ? payload[key]
      : typeof payload.name === "string"
        ? payload.name
        : typeof payload.dataKey === "string"
          ? payload.dataKey
          : typeof payloadData === "object" &&
              payloadData !== null &&
              key in payloadData &&
              typeof payloadData[key] === "string"
            ? (payloadData[key] as string)
            : key;

  return config[configKey] ?? config[key];
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: TooltipProps<number, string> & {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line";
  nameKey?: string;
  labelKey?: string;
  labelClassName?: string;
  formatter?: (value: number, name?: string, item?: unknown) => React.ReactNode;
  labelFormatter?: (label: React.ReactNode, payload: unknown[]) => React.ReactNode;
  color?: string;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel = hideLabel
    ? null
    : labelFormatter
      ? labelFormatter(label, payload)
      : (() => {
          const item = payload[0];
          const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(
            config,
            item as unknown as Record<string, unknown>,
            key,
          );

          return itemConfig?.label ?? label;
        })();

  return (
    <div
      className={cn(
        "min-w-[12rem] rounded-lg border border-border/80 bg-card/95 px-3 py-2 text-xs shadow-lg",
        className,
      )}
    >
      {tooltipLabel ? (
        <p
          className={cn(
            "mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground",
            labelClassName,
          )}
        >
          {tooltipLabel}
        </p>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((item) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(
            config,
            item as unknown as Record<string, unknown>,
            key,
          );
          const indicatorColor =
            color ?? item.color ?? (item.payload as { fill?: string } | undefined)?.fill;

          return (
            <div key={item.dataKey ?? item.name} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                {!hideIndicator ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full",
                      indicator === "dot" ? "h-2.5 w-2.5" : "h-0.5 w-3",
                    )}
                    style={{ backgroundColor: indicatorColor }}
                  />
                ) : null}
                <span className="truncate text-muted-foreground">
                  {itemConfig?.label ?? item.name}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {formatter
                  ? formatter(Number(item.value), item.name, item)
                  : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = Legend;

export function ChartLegendContent({
  className,
  payload,
  hideIcon = false,
  nameKey,
}: LegendProps & {
  hideIcon?: boolean;
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-xs", className)}>
      {payload.map((item) => {
        const key = `${nameKey ?? item.dataKey ?? item.value ?? "value"}`;
        const itemConfig = getPayloadConfigFromPayload(
          config,
          item as unknown as Record<string, unknown>,
          key,
        );
        const Icon = itemConfig?.icon;

        return (
          <div key={item.value} className="inline-flex items-center gap-2 text-muted-foreground">
            {!hideIcon ? (
              Icon ? (
                <Icon />
              ) : (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )
            ) : null}
            <span>{itemConfig?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
