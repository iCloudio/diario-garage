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
import { Wrench, AlertCircle, Shield, DollarSign, ParkingCircle, Droplet, Route, FileText } from "lucide-react";

const EXPENSE_CATEGORIES = [
  { value: "MANUTENZIONE", label: "Manutenzione", description: "Tagliandi, riparazioni, ricambi", icon: Wrench },
  { value: "MULTA", label: "Multa", description: "Infrazioni, autovelox", icon: AlertCircle },
  { value: "ASSICURAZIONE", label: "Assicurazione", description: "RCA, Kasko", icon: Shield },
  { value: "BOLLO", label: "Bollo", description: "Tassa di circolazione", icon: DollarSign },
  { value: "PARCHEGGIO", label: "Parcheggio", description: "Sosta, abbonamenti", icon: ParkingCircle },
  { value: "LAVAGGIO", label: "Lavaggio", description: "Autolavaggio", icon: Droplet },
  { value: "PEDAGGI", label: "Pedaggi", description: "Autostrada, caselli", icon: Route },
  { value: "ALTRO", label: "Altro", description: "Altre spese", icon: FileText },
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
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Campi richiesti</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Per salvare una spesa bastano data, importo e categoria.
            </p>
          </div>

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
                {EXPENSE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <details className="rounded-2xl border border-border/80 bg-background/55 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Aggiungi dettagli facoltativi
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Descrizione, chilometraggio e note servono solo se vuoi uno storico piu preciso.
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione (facoltativa)</Label>
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
                <Label htmlFor="notes">Note (opzionali)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="es. Officina X, sostituiti filtri..."
                  rows={3}
                />
              </div>
            </div>
          </details>
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
