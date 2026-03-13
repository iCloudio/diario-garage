"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VehicleInlineCreateCard() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [submitPhase, setSubmitPhase] = useState<"idle" | "lookup" | "save">("idle");
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setPlate("");
    setIsOpen(false);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const normalizedPlate = plate.replace(/\s+/g, "").toUpperCase();
      let lookupPayload: {
        found?: boolean;
        cacheId?: string;
        data?: {
          make?: string;
          model?: string;
        };
        error?: string;
        message?: string;
      } | null = null;

      try {
        setSubmitPhase("lookup");
        const lookupResponse = await fetch("/api/plates/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plate: normalizedPlate }),
        });

        lookupPayload = await lookupResponse.json().catch(() => null);

        if (!lookupResponse.ok) {
          toast.message(
            lookupPayload?.error ??
              "Recupero dati non riuscito. Creo comunque il veicolo con la sola targa.",
          );
          lookupPayload = null;
        } else if (!lookupPayload?.found) {
          toast.message(
            lookupPayload?.message ??
              "Nessun dato trovato. Creo il veicolo con la sola targa.",
          );
          lookupPayload = null;
        }

        setSubmitPhase("save");
        const response = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plate: normalizedPlate,
            plateLookupCacheId: lookupPayload?.cacheId,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          toast.error(payload?.error ?? "Salvataggio non riuscito.");
          return;
        }

        toast.success(
          lookupPayload?.cacheId
            ? "Veicolo aggiunto con dati recuperati."
            : "Veicolo aggiunto.",
        );
        setPlate("");
        setIsOpen(false);
        router.refresh();
      } finally {
        setSubmitPhase("idle");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="block h-full text-left"
        onClick={() => setIsOpen(true)}
      >
        <Card className="flex h-full min-h-64 flex-col items-center justify-center gap-4 border-dashed border-border/80 bg-card/60 p-6 text-center transition hover:border-primary/35 hover:bg-card/80">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/80 bg-background/70">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground">Aggiungi veicolo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea una nuova scheda veicolo.
            </p>
          </div>
        </Card>
      </button>
    );
  }

  return (
    <Card className="h-full min-h-64 border-border/80 bg-card/90 p-6 animate-in fade-in-0 zoom-in-95">
      <form className="flex h-full flex-col" onSubmit={onSubmit}>
        <div>
          <p className="text-sm font-medium text-foreground">Nuovo veicolo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Inserisci solo la targa. I dati verranno recuperati automaticamente se disponibili.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inline-vehicle-plate">Targa</Label>
            <Input
              id="inline-vehicle-plate"
              value={plate}
              onChange={(event) => setPlate(event.target.value.toUpperCase())}
              placeholder="AB123CD"
              required
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-end gap-2 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={pending}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={pending}>
            {submitPhase === "lookup"
              ? "Recupero dati..."
              : submitPhase === "save"
                ? "Salvataggio..."
                : "Salva"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
