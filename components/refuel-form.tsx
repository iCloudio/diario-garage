"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Fuel, Flame, Wind, Zap, Battery } from "lucide-react";

const FUEL_TYPES = [
  { value: "BENZINA", label: "Benzina", icon: Fuel },
  { value: "DIESEL", label: "Diesel", icon: Fuel },
  { value: "GPL", label: "GPL", icon: Flame },
  { value: "METANO", label: "Metano", icon: Wind },
  { value: "ELETTRICO", label: "Elettrico", icon: Zap },
  { value: "IBRIDO_BENZINA", label: "Ibrido Benzina", icon: Battery },
  { value: "IBRIDO_DIESEL", label: "Ibrido Diesel", icon: Battery },
];

type FuelType = "BENZINA" | "DIESEL" | "GPL" | "METANO" | "ELETTRICO" | "IBRIDO_BENZINA" | "IBRIDO_DIESEL";

interface RefuelFormProps {
  vehicleId: string;
  currentOdometer: number;
  vehicleFuelType?: FuelType | null;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RefuelForm({
  vehicleId,
  currentOdometer,
  vehicleFuelType,
  embedded = false,
  onSuccess,
  onCancel,
}: RefuelFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>(vehicleFuelType || "BENZINA");

  const today = new Date().toISOString().split("T")[0];

  // Determina quali campi mostrare in base al tipo di carburante
  const showPrimaryFuel = ["BENZINA", "DIESEL", "IBRIDO_BENZINA", "IBRIDO_DIESEL"].includes(selectedFuelType);
  const showSecondaryFuel = ["GPL", "METANO"].includes(selectedFuelType);
  const showElectric = selectedFuelType === "ELETTRICO";
  const isGPL = selectedFuelType === "GPL";
  const isMetano = selectedFuelType === "METANO";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Per GPL/Metano: almeno uno dei due campi deve essere compilato
    const litersPrimary = formData.get("litersPrimary") ? parseFloat(formData.get("litersPrimary") as string) : null;
    const litersSecondary = formData.get("litersSecondary") ? parseFloat(formData.get("litersSecondary") as string) : null;
    const kwh = formData.get("kwh") ? parseFloat(formData.get("kwh") as string) : null;

    if ((isGPL || isMetano) && !litersPrimary && !litersSecondary) {
      toast.error("Compila almeno uno dei due carburanti");
      setIsSubmitting(false);
      return;
    }

    // Calcola il valore totale di litri/kwh in base al tipo
    let totalLiters = null;
    let totalKwh = null;

    if (showElectric) {
      totalKwh = kwh;
    } else if (showSecondaryFuel) {
      // Per GPL/Metano: somma entrambi se presenti (per tracking totale)
      // ma salviamo anche separatamente
      totalLiters = (litersPrimary || 0) + (litersSecondary || 0);
    } else {
      totalLiters = litersPrimary;
    }

    const amountEur = parseFloat(formData.get("amountEur") as string);

    const data = {
      vehicleId,
      date: formData.get("date") as string,
      liters: totalLiters,
      kwh: totalKwh,
      amountEur,
      odometerKm: parseInt(formData.get("odometerKm") as string),
      fuelType: selectedFuelType,
      notes: formData.get("notes") as string || null,
      // Dati aggiuntivi per GPL/Metano
      litersPrimary: showSecondaryFuel ? litersPrimary : null,
      litersSecondary: showSecondaryFuel ? litersSecondary : null,
    };

    // Calcola prezzo per litro/kwh
    let pricePerLiter = null;
    if (showElectric && totalKwh && totalKwh > 0) {
      pricePerLiter = amountEur / totalKwh; // €/kWh
    } else if (totalLiters && totalLiters > 0) {
      pricePerLiter = amountEur / totalLiters; // €/litro
    }

    try {
      const response = await fetch("/api/refuels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, pricePerLiter }),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      toast.success("Rifornimento registrato con successo!");
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/vehicles/${vehicleId}/expenses`);
      }
    } catch (error) {
      toast.error("Errore durante il salvataggio del rifornimento");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Campi richiesti</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Per registrare un rifornimento servono data, importo, chilometraggio
              e tipo di carburante.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Data rifornimento</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                max={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType">Tipo carburante</Label>
              <Select
                name="fuelType"
                value={selectedFuelType}
                onValueChange={(val) => setSelectedFuelType(val as FuelType)}
                disabled={!!vehicleFuelType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((fuel) => {
                    const Icon = fuel.icon;
                    return (
                      <SelectItem key={fuel.value} value={fuel.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{fuel.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {vehicleFuelType && (
                <p className="text-xs text-muted-foreground">
                  Tipo carburante impostato dal veicolo
                </p>
              )}
            </div>
          </div>

          {/* Importo totale sempre visibile */}
          <div className="space-y-2">
            <Label htmlFor="amountEur">Importo totale (€)</Label>
            <Input
              id="amountEur"
              name="amountEur"
              type="number"
              step="0.01"
              min="0"
              placeholder="es. 75.50"
              required
            />
          </div>

          {/* Campi per carburanti tradizionali (benzina/diesel) */}
          {showPrimaryFuel && !showSecondaryFuel && (
            <div className="space-y-2">
              <Label htmlFor="litersPrimary">
                Litri {selectedFuelType === "DIESEL" ? "diesel" : "benzina"}
              </Label>
              <Input
                id="litersPrimary"
                name="litersPrimary"
                type="number"
                step="0.01"
                min="0"
                placeholder="es. 42.5"
                required
              />
            </div>
          )}

          {/* Campi per elettrico */}
          {showElectric && (
            <div className="space-y-2">
              <Label htmlFor="kwh">kWh ricaricati</Label>
              <Input
                id="kwh"
                name="kwh"
                type="number"
                step="0.01"
                min="0"
                placeholder="es. 25.5"
                required
              />
            </div>
          )}

          {/* Campi per GPL/Metano (doppio carburante) */}
          {showSecondaryFuel && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                Rifornimento misto - Compila solo quello che hai effettivamente rifornito
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="litersPrimary" className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    Litri benzina
                  </Label>
                  <Input
                    id="litersPrimary"
                    name="litersPrimary"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="es. 30.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="litersSecondary" className="flex items-center gap-2">
                    {isGPL ? <Flame className="h-4 w-4" /> : <Wind className="h-4 w-4" />}
                    {isGPL ? "Litri GPL" : "kg Metano"}
                  </Label>
                  <Input
                    id="litersSecondary"
                    name="litersSecondary"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={isGPL ? "es. 15.0" : "es. 10.5"}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="odometerKm">Chilometraggio attuale (km)</Label>
            <Input
              id="odometerKm"
              name="odometerKm"
              type="number"
              min="0"
              defaultValue={currentOdometer}
              placeholder="es. 123450"
              required
            />
            <p className="text-xs text-muted-foreground">
              Inserisci il chilometraggio al momento del rifornimento
            </p>
          </div>

          <details className="rounded-2xl border border-border/80 bg-background/55 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Aggiungi note facoltative
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Usa le note solo se vuoi ricordare stazione di servizio o altri dettagli.
            </p>

            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Note (opzionali)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="es. Stazione X, autostrada..."
                rows={2}
              />
            </div>
          </details>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva rifornimento"}
          </Button>
          {embedded ? (
            onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annulla
              </Button>
            ) : null
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
          )}
        </div>
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      {embedded ? content : <Card className="border-border/80 bg-card/90 p-5 sm:p-6">{content}</Card>}
    </form>
  );
}
