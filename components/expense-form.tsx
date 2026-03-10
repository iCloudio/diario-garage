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

const EXPENSE_CATEGORIES = [
  { value: "MANUTENZIONE", label: "🔧 Manutenzione", description: "Tagliandi, riparazioni, ricambi" },
  { value: "MULTA", label: "🚨 Multa", description: "Infrazioni, autovelox" },
  { value: "ASSICURAZIONE", label: "🛡️ Assicurazione", description: "RCA, Kasko" },
  { value: "BOLLO", label: "💰 Bollo", description: "Tassa di circolazione" },
  { value: "PARCHEGGIO", label: "🅿️ Parcheggio", description: "Sosta, abbonamenti" },
  { value: "LAVAGGIO", label: "🧼 Lavaggio", description: "Autolavaggio" },
  { value: "PEDAGGI", label: "🛣️ Pedaggi", description: "Autostrada, caselli" },
  { value: "ALTRO", label: "📝 Altro", description: "Altre spese" },
];

interface ExpenseFormProps {
  vehicleId: string;
  currentOdometer?: number;
}

export function ExpenseForm({ vehicleId, currentOdometer }: ExpenseFormProps) {
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
      category: formData.get("category") as string,
      amountEur: parseFloat(formData.get("amountEur") as string),
      odometerKm: formData.get("odometerKm") ? parseInt(formData.get("odometerKm") as string) : null,
      description: formData.get("description") as string || null,
      notes: formData.get("notes") as string || null,
    };

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Errore durante il salvataggio");
      }

      toast.success("Spesa registrata con successo!");
      router.push(`/vehicles/${vehicleId}/expenses`);
      router.refresh();
    } catch (error) {
      toast.error("Errore durante il salvataggio della spesa");
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
              <Label htmlFor="date">Data</Label>
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
              <Label htmlFor="amountEur">Importo (€)</Label>
              <Input
                id="amountEur"
                name="amountEur"
                type="number"
                step="0.01"
                min="0"
                placeholder="es. 280.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select name="category" defaultValue="MANUTENZIONE" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex flex-col">
                      <span>{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              name="description"
              placeholder="es. Tagliando 60.000 km"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odometerKm">Chilometraggio (opzionale)</Label>
            <Input
              id="odometerKm"
              name="odometerKm"
              type="number"
              min="0"
              defaultValue={currentOdometer}
              placeholder="es. 60120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="es. Officina X, sostituiti filtri..."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva spesa"}
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
