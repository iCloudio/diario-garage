"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type VehicleFiltersProps = {
  typeFilter: string | null;
  statusFilter: string | null;
  upcomingDeadlinesFilter: boolean;
  onTypeChange: (value: string | null) => void;
  onStatusChange: (value: string | null) => void;
  onUpcomingDeadlinesChange: (value: boolean) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

/**
 * Vehicle Filters
 * Filter dropdowns for vehicle type, status, and upcoming deadlines
 */
export function VehicleFilters({
  typeFilter,
  statusFilter,
  upcomingDeadlinesFilter,
  onTypeChange,
  onStatusChange,
  onUpcomingDeadlinesChange,
  onClearFilters,
  hasActiveFilters,
}: VehicleFiltersProps) {
  const activeFiltersCount = [
    typeFilter !== "all" && typeFilter !== null,
    statusFilter !== "all" && statusFilter !== null,
    upcomingDeadlinesFilter,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtri</span>
          {activeFiltersCount > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          ) : null}
        </div>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="mr-1 h-3 w-3" />
            Cancella
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter" className="text-xs text-muted-foreground">
            Tipo veicolo
          </Label>
          <Select
            value={typeFilter ?? "all"}
            onValueChange={(value) => onTypeChange(value === "all" ? null : value)}
          >
            <SelectTrigger id="type-filter" className="h-10">
              <SelectValue placeholder="Tutti i tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i tipi</SelectItem>
              <SelectItem value="AUTO">Auto</SelectItem>
              <SelectItem value="MOTO">Moto</SelectItem>
              <SelectItem value="CAMPER">Camper</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-xs text-muted-foreground">
            Stato
          </Label>
          <Select
            value={statusFilter ?? "all"}
            onValueChange={(value) => onStatusChange(value === "all" ? null : value)}
          >
            <SelectTrigger id="status-filter" className="h-10">
              <SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="ATTIVO">Attivo</SelectItem>
              <SelectItem value="VENDUTO">Venduto</SelectItem>
              <SelectItem value="ROTTAMATO">Rottamato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upcoming Deadlines Filter */}
        <div className="flex items-end space-x-2 pb-2">
          <Checkbox
            id="upcoming-deadlines"
            checked={upcomingDeadlinesFilter}
            onCheckedChange={(checked) => onUpcomingDeadlinesChange(checked === true)}
          />
          <Label
            htmlFor="upcoming-deadlines"
            className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Solo scadenze imminenti (30gg)
          </Label>
        </div>
      </div>
    </div>
  );
}
