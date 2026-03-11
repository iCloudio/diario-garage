"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FUEL_PRICE_REGIONS } from "@/lib/fuel-price-regions";

export function FuelPriceRegionSettingsForm({
  initialRegion,
}: {
  initialRegion: string | null;
}) {
  const [region, setRegion] = useState(initialRegion ?? "__NONE__");
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Regione prezzi carburante</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Usata per confrontare i tuoi rifornimenti con il prezzo medio ufficiale MIMIT.
        </p>
      </div>
      <Select
        value={region}
        onValueChange={(value) => {
          setRegion(value);
          startTransition(async () => {
            const response = await fetch("/api/settings/fuel-price-region", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ region: value === "__NONE__" ? null : value }),
            });

            if (!response.ok) {
              toast.error("Salvataggio regione non riuscito.");
              return;
            }

            toast.success("Regione carburante aggiornata.");
          });
        }}
      >
        <SelectTrigger className="w-full max-w-sm" disabled={pending}>
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
  );
}
