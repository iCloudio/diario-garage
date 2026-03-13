"use client";

import { MoreVertical, AlertCircle, Fuel, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VehicleTabs } from "./vehicle-tabs";
import { cn } from "@/lib/utils";

type QuickStat = {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  iconColor: string;
};

type VehicleHeroCardProps = {
  vehicleId: string;
  quickStats: QuickStat[];
  urgentDeadlinesCount: number;
  onRefuelClick: () => void;
  onExpenseClick: () => void;
  onEditClick: () => void;
  children: React.ReactNode;
};

/**
 * Vehicle Hero Card
 * Unified card with sticky header, quick stats, and integrated tabs
 */
export function VehicleHeroCard({
  vehicleId,
  quickStats,
  urgentDeadlinesCount,
  onRefuelClick,
  onExpenseClick,
  onEditClick,
  children,
}: VehicleHeroCardProps) {
  return (
    <Card className="overflow-hidden border-border/80 bg-card/95 backdrop-blur">
      <div className="border-b border-border/60 bg-gradient-to-b from-card/95 to-card/80">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-2"
                  >
                    <Icon className={cn("h-4 w-4", stat.iconColor)} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {stat.value}
                    </span>
                  </div>
                );
              })}

              {urgentDeadlinesCount > 0 ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-destructive/25 bg-destructive/10 px-3 py-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">Scadenze urgenti</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {urgentDeadlinesCount}
                  </span>
                </div>
              ) : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Azioni</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onRefuelClick}>
                  <Fuel className="mr-2 h-4 w-4" />
                  Nuovo rifornimento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExpenseClick}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Nuova spesa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditClick}>
                  Modifica veicolo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border-t border-border/40">
          <VehicleTabs vehicleId={vehicleId} defaultTab="overview" />
        </div>
      </div>

      <div className="px-6 py-6">{children}</div>
    </Card>
  );
}
