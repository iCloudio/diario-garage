"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewVehiclePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lookupPending, setLookupPending] = useState(false);

  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const [bollo, setBollo] = useState("");
  const [revisione, setRevisione] = useState("");
  const [assicurazione, setAssicurazione] = useState("");

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
    setYear(payload.data.year ? String(payload.data.year) : "");
    toast.success("Dati recuperati.");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const deadlines = [
        bollo ? { type: "BOLLO", dueDate: bollo } : null,
        revisione ? { type: "REVISIONE", dueDate: revisione } : null,
        assicurazione ? { type: "ASSICURAZIONE", dueDate: assicurazione } : null,
      ].filter((item): item is { type: string; dueDate: string } => Boolean(item));

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate,
          make,
          model,
          year: year ? Number(year) : undefined,
          deadlines,
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
        <h2 className="text-2xl font-semibold">Nuovo veicolo</h2>
        <p className="text-sm text-zinc-400">
          Inserisci i dati manualmente o usa la ricerca targa.
        </p>
      </div>

      <Card className="border-white/10 bg-black/40 p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
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
                {lookupPending ? "Ricerca..." : "Lookup targa"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
              <Label htmlFor="year">Anno</Label>
              <Input
                id="year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="2019"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bollo">Bollo</Label>
              <Input
                id="bollo"
                type="date"
                value={bollo}
                onChange={(event) => setBollo(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revisione">Revisione</Label>
              <Input
                id="revisione"
                type="date"
                value={revisione}
                onChange={(event) => setRevisione(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assicurazione">Assicurazione</Label>
              <Input
                id="assicurazione"
                type="date"
                value={assicurazione}
                onChange={(event) => setAssicurazione(event.target.value)}
              />
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
