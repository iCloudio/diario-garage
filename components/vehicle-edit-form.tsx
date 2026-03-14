"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Fuel, Flame, Wind, Zap, Battery, CheckCircle, DollarSign, Trash2 } from "lucide-react";

type VehicleEditFormProps = {
  vehicleId: string;
  initialPlate: string;
  initialMake?: string | null;
  initialModel?: string | null;
  initialModelDetail?: string | null;
  initialFirstRegistrationDate?: string | null;
  initialOdometerKm?: number | null;
  initialType?: "AUTO" | "MOTO" | "CAMPER";
  initialFuelType?: "BENZINA" | "DIESEL" | "GPL" | "METANO" | "ELETTRICO" | "IBRIDO_BENZINA" | "IBRIDO_DIESEL" | null;
  initialStatus?: "ATTIVO" | "VENDUTO" | "ROTTAMATO";
  initialSoldDate?: string | null;
  initialSoldPrice?: number | null;
  initialSoldNotes?: string | null;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function VehicleEditForm({
  vehicleId,
  initialPlate,
  initialMake,
  initialModel,
  initialModelDetail,
  initialFirstRegistrationDate,
  initialOdometerKm,
  initialType = "AUTO",
  initialFuelType,
  initialStatus = "ATTIVO",
  initialSoldDate,
  initialSoldPrice,
  initialSoldNotes,
  embedded = false,
  onSuccess,
  onCancel,
}: VehicleEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [plate, setPlate] = useState(initialPlate);
  const [make, setMake] = useState(initialMake ?? "");
  const [model, setModel] = useState(initialModel ?? "");
  const [modelDetail, setModelDetail] = useState(initialModelDetail ?? "");
  const [firstRegistrationDate, setFirstRegistrationDate] = useState(
    initialFirstRegistrationDate ? initialFirstRegistrationDate.slice(0, 10) : "",
  );
  const [odometerKm, setOdometerKm] = useState(
    initialOdometerKm?.toString() ?? ""
  );
  const [type, setType] = useState(initialType);
  const [fuelType, setFuelType] = useState(initialFuelType ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [soldDate, setSoldDate] = useState(
    initialSoldDate ? initialSoldDate.slice(0, 10) : ""
  );
  const [soldPrice, setSoldPrice] = useState(initialSoldPrice?.toString() ?? "");
  const [soldNotes, setSoldNotes] = useState(initialSoldNotes ?? "");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const parsedKm = odometerKm.trim()
        ? Number.parseInt(odometerKm, 10)
        : null;
      const safeKm = Number.isNaN(parsedKm) ? null : parsedKm;

      const parsedSoldPrice = soldPrice.trim()
        ? Number.parseFloat(soldPrice)
        : null;
      const safeSoldPrice = Number.isNaN(parsedSoldPrice) ? null : parsedSoldPrice;

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
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
          status,
          soldDate: soldDate ? new Date(soldDate).toISOString() : null,
          soldPrice: safeSoldPrice,
          soldNotes: soldNotes || null,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error ?? "Aggiornamento non riuscito.");
        return;
      }

      toast.success("Veicolo aggiornato.");
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/vehicles/${vehicleId}`);
      }
    });
  }

  const content = (
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <p className="text-sm font-medium text-foreground">Dati principali</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Targa e tipologia identificano il veicolo. Marca, modello, immatricolazione e alimentazione
            servono solo a completare la scheda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

        <div className="space-y-4 border-t border-border pt-6">
          <div>
            <Label className="text-base font-semibold">Stato amministrativo</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Usa questa sezione solo per chiudere o aggiornare lo stato del veicolo.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Stato</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as typeof status)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTIVO">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Attivo</span>
                  </div>
                </SelectItem>
                <SelectItem value="VENDUTO">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Venduto</span>
                  </div>
                </SelectItem>
                <SelectItem value="ROTTAMATO">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Rottamato</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "VENDUTO" && (
            <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label htmlFor="soldDate">Data vendita</Label>
                <Input
                  id="soldDate"
                  type="date"
                  value={soldDate}
                  onChange={(e) => setSoldDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="soldPrice">Prezzo di vendita (€)</Label>
                <Input
                  id="soldPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  placeholder="es. 5500"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="soldNotes">Note vendita</Label>
                <Input
                  id="soldNotes"
                  value={soldNotes}
                  onChange={(e) => setSoldNotes(e.target.value)}
                  placeholder="es. Venduto a privato, buone condizioni..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {embedded && onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
              Annulla
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </div>
      </form>
  );

  return embedded ? (
    content
  ) : (
    <Card className="border-border/80 bg-card/90 p-6">{content}</Card>
  );
}
