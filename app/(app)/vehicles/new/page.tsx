"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Fuel, Flame, Wind, Zap, Battery } from "lucide-react";
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
  const [modelDetail, setModelDetail] = useState("");
  const [firstRegistrationDate, setFirstRegistrationDate] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [type, setType] = useState("AUTO");
  const [fuelType, setFuelType] = useState("");
  const [plateLookupCacheId, setPlateLookupCacheId] = useState<string | null>(null);
  const [insuranceSummary, setInsuranceSummary] = useState<{
    company?: string;
    expiresAt?: string;
    present?: boolean;
    suspended?: boolean;
  } | null>(null);

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

    setPlateLookupCacheId(payload.cacheId ?? null);
    setMake(payload.data.make ?? "");
    setModel(payload.data.model ?? "");
    setModelDetail(payload.data.modelDetail ?? "");
    setFirstRegistrationDate(
      payload.data.firstRegistrationDate
        ? payload.data.firstRegistrationDate.slice(0, 10)
        : "",
    );
    if (payload.data.fuelType) {
      setFuelType(payload.data.fuelType);
    }
    if (payload.data.type) {
      setType(payload.data.type);
    }
    setInsuranceSummary(payload.data.insurance ?? null);
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
          modelDetail,
          firstRegistrationDate: firstRegistrationDate || null,
          odometerKm: safeKm,
          type,
          fuelType: fuelType || null,
          plateLookupCacheId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Salvataggio non riuscito.");
        return;
      }

      toast.success("Veicolo aggiunto.");
      router.push(`/vehicles/${payload.vehicle.id}`);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
          Veicoli
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Nuovo veicolo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Parti dal minimo indispensabile. Marca, modello, immatricolazione, km e alimentazione
          possono essere completati anche dopo.
        </p>
      </div>

      <Card className="border-border/80 bg-card/90 p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="rounded-2xl border border-border/80 bg-background/70 p-4">
            <p className="text-sm font-medium text-foreground">Campi richiesti per iniziare</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ti bastano targa e tipologia. Tutto il resto e&apos; facoltativo in questa fase.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="plate">Targa</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(event) => {
                  setPlate(event.target.value);
                  setPlateLookupCacheId(null);
                  setInsuranceSummary(null);
                }}
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

          {insuranceSummary?.expiresAt ? (
            <p className="text-sm text-muted-foreground">
              Assicurazione trovata
              {insuranceSummary.company ? `: ${insuranceSummary.company}` : ""}.
              {" "}Scadenza{" "}
              {new Date(insuranceSummary.expiresAt).toLocaleDateString("it-IT")}
              {insuranceSummary.suspended ? " · polizza sospesa" : ""}.
              Verrà salvata come scadenza assicurazione.
            </p>
          ) : insuranceSummary?.present === false ? (
            <p className="text-sm italic text-muted-foreground">
              Nessuna copertura RCA attiva trovata per questa targa.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label>Tipologia</Label>
            <Select value={type} onValueChange={(val) => setType(val as typeof type)}>
              <SelectTrigger className="w-full md:max-w-sm">
                <SelectValue placeholder="Seleziona tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTO">Auto</SelectItem>
                <SelectItem value="MOTO">Moto</SelectItem>
                <SelectItem value="CAMPER">Camper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <details className="rounded-2xl border border-border/80 bg-background/55 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Aggiungi ora i dati facoltativi
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              Marca, modello, dettaglio modello, immatricolazione, km e alimentazione possono anche essere compilati dopo.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="make">Marca (facoltativa)</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(event) => setMake(event.target.value)}
                  placeholder="Fiat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modello (facoltativo)</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="Panda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelDetail">Dettaglio modello (facoltativo)</Label>
                <Input
                  id="modelDetail"
                  value={modelDetail}
                  onChange={(event) => setModelDetail(event.target.value)}
                  placeholder="Golf 1.9 TDI 5P Sportline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstRegistrationDate">Prima immatricolazione (facoltativa)</Label>
                <Input
                  id="firstRegistrationDate"
                  value={firstRegistrationDate}
                  onChange={(event) => setFirstRegistrationDate(event.target.value)}
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="odometerKm">Km attuali (facoltativi)</Label>
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
                <Label>Alimentazione (facoltativa)</Label>
                <Select value={fuelType || undefined} onValueChange={setFuelType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona alimentazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BENZINA">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        <span>Benzina</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DIESEL">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        <span>Diesel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="GPL">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        <span>GPL</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="METANO">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        <span>Metano</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ELETTRICO">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Elettrico</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IBRIDO_BENZINA">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        <span>Ibrido Benzina</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="IBRIDO_DIESEL">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        <span>Ibrido Diesel</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </details>

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
