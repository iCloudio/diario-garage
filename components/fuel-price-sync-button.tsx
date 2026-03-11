"use client";

import { useState, useTransition } from "react";
import { RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function FuelPriceSyncButton() {
  const [pending, startTransition] = useTransition();
  const [lastSyncedLabel, setLastSyncedLabel] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">Aggiornamento prezzi MIMIT</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Esegue subito la sincronizzazione dei prezzi medi regionali ufficiali.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => {
            startTransition(async () => {
              const response = await fetch("/api/fuel-prices/sync", {
                method: "POST",
              });

              const payload = await response.json().catch(() => null);
              if (!response.ok) {
                toast.error(payload?.error ?? "Sincronizzazione non riuscita.");
                return;
              }

              const syncedAt = payload?.snapshotDate
                ? new Date(payload.snapshotDate).toLocaleDateString("it-IT")
                : null;

              setLastSyncedLabel(syncedAt);
              toast.success(
                syncedAt
                  ? `Prezzi aggiornati al ${syncedAt}.`
                  : "Prezzi aggiornati.",
              );
            });
          }}
          disabled={pending}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          {pending ? "Aggiornamento..." : "Aggiorna prezzi"}
        </Button>

        {lastSyncedLabel ? (
          <p className="text-xs text-muted-foreground">
            Ultimo snapshot caricato: {lastSyncedLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
