"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Unlink } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveOverlay } from "@/components/responsive-overlay";
import {
  formatLicenseExpiryLabel,
  getLicenseExpiryAnimationClass,
  getLicenseExpiryClass,
} from "@/lib/license-status";

type DriverItem = {
  id: string;
  name: string;
  licenseExpiry: string;
};

type VehicleDriversSectionProps = {
  vehicleId: string;
  drivers: DriverItem[];
  availableDrivers: DriverItem[];
  embedded?: boolean;
};

export function VehicleDriversSection({
  vehicleId,
  drivers,
  availableDrivers,
  embedded = false,
}: VehicleDriversSectionProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(availableDrivers[0]?.id ?? "");
  const [editingDriver, setEditingDriver] = useState<DriverItem | null>(null);

  const availableDriverOptions = useMemo(
    () => availableDrivers.map((driver) => ({ ...driver })),
    [availableDrivers],
  );

  function refreshWithSuccess(message: string) {
    toast.success(message);
    router.refresh();
  }

  function handleCreateDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "create",
          name: formData.get("name"),
          licenseExpiry: formData.get("licenseExpiry"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Salvataggio non riuscito.");
        return;
      }

      setIsAddOpen(false);
      refreshWithSuccess("Guidatore aggiunto.");
    });
  }

  function handleAssignExistingDriver() {
    if (!selectedDriverId) {
      toast.error("Seleziona un guidatore.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "assign",
          driverId: selectedDriverId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Associazione non riuscita.");
        return;
      }

      setIsAddOpen(false);
      refreshWithSuccess("Guidatore associato.");
    });
  }

  function handleUpdateDriver(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingDriver) return;

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const response = await fetch(`/api/drivers/${editingDriver.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          licenseExpiry: formData.get("licenseExpiry"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Aggiornamento non riuscito.");
        return;
      }

      setEditingDriver(null);
      refreshWithSuccess("Guidatore aggiornato.");
    });
  }

  function handleDetachDriver(driverId: string) {
    if (!window.confirm("Vuoi scollegare questo guidatore dal veicolo?")) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}/drivers`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Operazione non riuscita.");
        return;
      }

      refreshWithSuccess("Guidatore scollegato.");
    });
  }

  const content = (
    <>
      <div
        className={
          embedded
            ? "rounded-3xl border border-border/80 bg-card/90 p-4"
            : "rounded-3xl border border-border/80 bg-card/90 p-6"
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Guidatori
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Guidatori associati e patente.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {drivers.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">Nessun guidatore</p>
          ) : (
            drivers.map((driver) => {
              const licenseExpiry = new Date(driver.licenseExpiry);

              return (
                <div
                  key={driver.id}
                  className="rounded-2xl bg-background/55 px-3 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{driver.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Patente {formatLicenseExpiryLabel(licenseExpiry)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getLicenseExpiryClass(
                          licenseExpiry,
                        )} ${getLicenseExpiryAnimationClass(licenseExpiry)}`}
                      >
                        {formatLicenseExpiryLabel(licenseExpiry)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDriver(driver)}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Modifica
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDetachDriver(driver.id)}
                        disabled={pending}
                      >
                        <Unlink className="mr-2 h-3.5 w-3.5" />
                        Scollega
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ResponsiveOverlay
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Gestisci guidatori"
        description="Associa un guidatore esistente oppure creane uno nuovo senza uscire dalla scheda."
        desktopClassName="max-w-lg"
      >
        <div className="space-y-6">
          {availableDriverOptions.length > 0 ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Associa guidatore esistente</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Seleziona un profilo già presente e collegalo a questo veicolo.
                </p>
              </div>
              <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona guidatore" />
                </SelectTrigger>
                <SelectContent>
                  {availableDriverOptions.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name} · {formatLicenseExpiryLabel(new Date(driver.licenseExpiry))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleAssignExistingDriver}
                disabled={pending}
              >
                {pending ? "Salvataggio..." : "Associa guidatore"}
              </Button>
            </div>
          ) : null}

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Nuovo guidatore</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Per iniziare bastano nome e scadenza della patente.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateDriver}>
              <div className="space-y-2">
                <Label htmlFor="driver-name">Nome</Label>
                <Input id="driver-name" name="name" placeholder="es. Mario Rossi" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver-license-expiry">Scadenza patente</Label>
                <Input id="driver-license-expiry" name="licenseExpiry" type="date" required />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddOpen(false)}
                  disabled={pending}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Salvataggio..." : "Crea e collega"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={!!editingDriver}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDriver(null);
          }
        }}
        title="Modifica guidatore"
        description="Aggiorna nome e scadenza patente direttamente dalla scheda veicolo."
        desktopClassName="max-w-md"
      >
        {editingDriver ? (
          <form className="space-y-4" onSubmit={handleUpdateDriver}>
            <div className="space-y-2">
              <Label htmlFor="edit-driver-name">Nome</Label>
              <Input
                id="edit-driver-name"
                name="name"
                defaultValue={editingDriver.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-driver-license-expiry">Scadenza patente</Label>
              <Input
                id="edit-driver-license-expiry"
                name="licenseExpiry"
                type="date"
                defaultValue={editingDriver.licenseExpiry.slice(0, 10)}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingDriver(null)}
                disabled={pending}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Salvataggio..." : "Salva modifiche"}
              </Button>
            </div>
          </form>
        ) : null}
      </ResponsiveOverlay>
    </>
  );

  return content;
}
