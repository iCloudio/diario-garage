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
  initialOdometerKm?: number | null;
  initialType?: "AUTO" | "MOTO" | "CAMPER";
  initialFuelType?: "BENZINA" | "DIESEL" | "GPL" | "METANO" | "ELETTRICO" | "IBRIDO_BENZINA" | "IBRIDO_DIESEL" | null;
  initialStatus?: "ATTIVO" | "VENDUTO" | "ROTTAMATO";
  initialSoldDate?: Date | null;
  initialSoldPrice?: number | null;
  initialSoldNotes?: string | null;
};

export function VehicleEditForm({
  vehicleId,
  initialPlate,
  initialMake,
  initialModel,
  initialOdometerKm,
  initialType = "AUTO",
  initialFuelType,
  initialStatus = "ATTIVO",
  initialSoldDate,
  initialSoldPrice,
  initialSoldNotes,
}: VehicleEditFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [plate, setPlate] = useState(initialPlate);
  const [make, setMake] = useState(initialMake ?? "");
  const [model, setModel] = useState(initialModel ?? "");
  const [odometerKm, setOdometerKm] = useState(
    initialOdometerKm?.toString() ?? ""
  );
  const [type, setType] = useState(initialType);
  const [fuelType, setFuelType] = useState(initialFuelType ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [soldDate, setSoldDate] = useState(
    initialSoldDate ? initialSoldDate.toISOString().split("T")[0] : ""
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
      router.push(`/vehicles/${vehicleId}`);
      router.refresh();
    });
  }

  return (
    <Card className="border-border/80 bg-card/90 p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <p className="text-sm font-medium text-foreground">Dati principali</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Targa e tipologia identificano il veicolo. Marca, modello e alimentazione
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

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvataggio..." : "Salva modifiche"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
