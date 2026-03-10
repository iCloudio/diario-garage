"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewVehiclePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lookupPending, setLookupPending] = useState(false);

  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [type, setType] = useState("AUTO");
  const [fuelType, setFuelType] = useState("");
  async function handleLookup() {
    if (!plate.trim()) {
      toast.error("Inserisci una targa.");
      return;
    }

    setLookupPending(true);
    const response = await fetch("/api/plates/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate }),
    });
    const payload = await response.json().catch(() => null);
    setLookupPending(false);

    if (!response.ok) {
      toast.error(payload?.error ?? "Lookup non riuscito.");
      return;
    }

    if (!payload?.found) {
      toast.message(payload?.message ?? "Nessun dato trovato.");
      return;
    }

    setMake(payload.data.make ?? "");
    setModel(payload.data.model ?? "");
    toast.success("Dati recuperati.");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const parsedKm = odometerKm.trim()
        ? Number.parseInt(odometerKm, 10)
        : undefined;
      const safeKm = Number.isNaN(parsedKm) ? undefined : parsedKm;

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate,
          make,
          model,
          odometerKm: safeKm,
          type,
          fuelType: fuelType || null,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Salvataggio non riuscito.");
        return;
      }

      toast.success("Veicolo aggiunto.");
      router.push("/vehicles");
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Veicoli
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Nuovo veicolo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inserisci i dati manualmente o usa la ricerca targa.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <p className="text-xs text-muted-foreground">
            In questa versione puoi inserire un solo veicolo.
          </p>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="plate">Targa</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(event) => setPlate(event.target.value)}
                placeholder="AB123CD"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="secondary" onClick={handleLookup} disabled={lookupPending}>
                <Search className="mr-2 h-4 w-4" />
                {lookupPending ? "Ricerca..." : "Lookup targa"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="make">Marca</Label>
              <Input
                id="make"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                placeholder="Fiat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modello</Label>
              <Input
                id="model"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="Panda"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipologia</Label>
              <Select value={type} onValueChange={(val) => setType(val as typeof type)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona tipologia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="MOTO">Moto</SelectItem>
                  <SelectItem value="CAMPER">Camper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometerKm">Km attuali</Label>
              <Input
                id="odometerKm"
                value={odometerKm}
                onChange={(event) => setOdometerKm(event.target.value)}
                placeholder="Es. 82000"
                inputMode="numeric"
                type="number"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Alimentazione</Label>
              <Select value={fuelType || undefined} onValueChange={setFuelType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona alimentazione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BENZINA">⛽ Benzina</SelectItem>
                  <SelectItem value="DIESEL">⛽ Diesel</SelectItem>
                  <SelectItem value="GPL">🔥 GPL</SelectItem>
                  <SelectItem value="METANO">💨 Metano</SelectItem>
                  <SelectItem value="ELETTRICO">🔌 Elettrico</SelectItem>
                  <SelectItem value="IBRIDO_BENZINA">🔋 Ibrido Benzina</SelectItem>
                  <SelectItem value="IBRIDO_DIESEL">🔋 Ibrido Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvataggio..." : "Salva veicolo"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
