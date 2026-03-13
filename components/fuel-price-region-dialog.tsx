"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEL_PRICE_REGIONS } from "@/lib/fuel-price-regions";

type RegionalFuelRow = {
  region: string;
  BENZINA: string | null;
  GASOLIO: string | null;
  GPL: string | null;
  METANO: string | null;
};

export function FuelPriceRegionDialog({
  initialRegion,
  rows,
  snapshotDate,
  sourceUrl,
}: {
  initialRegion: string | null;
  rows: RegionalFuelRow[];
  snapshotDate: Date | null;
  sourceUrl?: string;
}) {
  const router = useRouter();
  const [region, setRegion] = useState(initialRegion ?? "__NONE__");
  const [pending, startTransition] = useTransition();

  const selectedRegion = region === "__NONE__" ? null : region;
  const selectedRow = useMemo(
    () => rows.find((row) => row.region === selectedRegion) ?? null,
    [rows, selectedRegion],
  );

  const summaryItems = selectedRow
    ? [
        { label: "Benzina", value: selectedRow.BENZINA ?? "N/D" },
        { label: "Diesel", value: selectedRow.GASOLIO ?? "N/D" },
        { label: "GPL", value: selectedRow.GPL ?? "N/D" },
        { label: "Metano", value: selectedRow.METANO ?? "N/D" },
      ]
    : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full text-left transition hover:opacity-90"
        >
          {selectedRow ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {summaryItems.map((item) => (
                <span key={item.label}>
                  {item.label}{" "}
                  <span className="font-medium text-foreground">{item.value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Seleziona regione per visualizzare prezzi medi carburante
            </p>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Prezzi medi carburante per regione</DialogTitle>
          <DialogDescription>
            Scegli la regione usata nell&apos;app per mostrare i prezzi medi ufficiali MIMIT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Regione</p>
            <Select
              value={region}
              onValueChange={(value) => {
                setRegion(value);
                startTransition(async () => {
                  const response = await fetch("/api/settings/fuel-price-region", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      region: value === "__NONE__" ? null : value,
                    }),
                  });

                  if (!response.ok) {
                    toast.error("Salvataggio regione non riuscito.");
                    return;
                  }

                  toast.success("Regione carburante aggiornata.");
                  router.refresh();
                });
              }}
            >
              <SelectTrigger className="w-full" disabled={pending}>
                <SelectValue placeholder="Seleziona regione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__NONE__">Nessuna regione</SelectItem>
                {FUEL_PRICE_REGIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRow ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/80 bg-background/60 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Seleziona regione per visualizzare prezzi medi carburante
            </p>
          )}

          <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
              {snapshotDate
                ? `Aggiornamento ${snapshotDate.toLocaleDateString("it-IT")}`
                : "Nessun dato disponibile"}
            </span>
            {sourceUrl ? (
              <a
                className="transition hover:text-foreground sm:text-right"
                href={sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Fonte MIMIT
              </a>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
