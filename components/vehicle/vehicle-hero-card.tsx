"use client";

import { MoreVertical, AlertCircle, Fuel, Pencil, TrendingUp } from "lucide-react";
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
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Button type="button" variant="secondary" size="sm" onClick={onRefuelClick}>
                <Fuel className="mr-2 h-4 w-4" />
                Rifornimento
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={onExpenseClick}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Spesa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="col-span-2"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifica veicolo
              </Button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2.5 sm:inline-flex sm:items-center sm:gap-2 sm:rounded-full sm:px-3 sm:py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", stat.iconColor)} />
                        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground sm:text-xs sm:normal-case sm:tracking-normal">
                          {stat.label}
                        </span>
                      </div>
                      <span className="mt-1 block text-sm font-semibold tabular-nums text-foreground sm:mt-0">
                        {stat.value}
                      </span>
                    </div>
                  );
                })}

                {urgentDeadlinesCount > 0 ? (
                  <div className="col-span-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-destructive sm:inline-flex sm:items-center sm:gap-2 sm:rounded-full sm:px-3 sm:py-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-[11px] uppercase tracking-[0.12em] sm:text-xs sm:normal-case sm:tracking-normal">
                        Scadenze urgenti
                      </span>
                    </div>
                    <span className="mt-1 block text-sm font-semibold tabular-nums sm:mt-0">
                      {urgentDeadlinesCount}
                    </span>
                  </div>
                ) : null}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden shrink-0 sm:inline-flex">
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
        </div>

        <div className="border-t border-border/40">
          <VehicleTabs vehicleId={vehicleId} defaultTab="overview" />
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6">{children}</div>
    </Card>
  );
}
