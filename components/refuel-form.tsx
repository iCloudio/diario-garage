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

const FUEL_TYPES = [
  { value: "BENZINA", label: "⛽ Benzina" },
  { value: "DIESEL", label: "⛽ Diesel" },
  { value: "GPL", label: "🔥 GPL" },
  { value: "METANO", label: "💨 Metano" },
  { value: "ELETTRICO", label: "🔌 Elettrico" },
  { value: "IBRIDO_BENZINA", label: "🔋 Ibrido Benzina" },
  { value: "IBRIDO_DIESEL", label: "🔋 Ibrido Diesel" },
];

interface RefuelFormProps {
  vehicleId: string;
  currentOdometer: number;
}

export function RefuelForm({ vehicleId, currentOdometer }: RefuelFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      vehicleId,
      date: formData.get("date") as string,
      liters: formData.get("liters") ? parseFloat(formData.get("liters") as string) : null,
      amountEur: parseFloat(formData.get("amountEur") as string),
      odometerKm: parseInt(formData.get("odometerKm") as string),
      fuelType: formData.get("fuelType") as string,
      notes: formData.get("notes") as string || null,
    };

    // Calcola prezzo per litro
    let pricePerLiter = null;
    if (data.liters && data.liters > 0) {
      pricePerLiter = data.amountEur / data.liters;
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
      router.push(`/vehicles/${vehicleId}/expenses`);
      router.refresh();
    } catch (error) {
      toast.error("Errore durante il salvataggio del rifornimento");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border bg-card p-6">
        <div className="space-y-4">
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
              <Select name="fuelType" defaultValue="BENZINA" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((fuel) => (
                    <SelectItem key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amountEur">Importo (€)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="liters">
                Litri (opzionale per elettrico)
              </Label>
              <Input
                id="liters"
                name="liters"
                type="number"
                step="0.01"
                min="0"
                placeholder="es. 42.5"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="es. Stazione X, autostrada..."
              rows={2}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva rifornimento"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
        </div>
      </Card>
    </form>
  );
}
