"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveOverlay } from "@/components/responsive-overlay";

type VehicleDangerZoneProps = {
  vehicleId: string;
  vehiclePlate: string;
};

export function VehicleDangerZone({
  vehicleId,
  vehiclePlate,
}: VehicleDangerZoneProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmationPlate, setConfirmationPlate] = useState("");
  const [pending, startTransition] = useTransition();

  const normalizedConfirmation = confirmationPlate.replace(/\s+/g, "").toUpperCase();
  const normalizedPlate = vehiclePlate.replace(/\s+/g, "").toUpperCase();
  const canDelete = normalizedConfirmation === normalizedPlate;

  function handleDelete() {
    startTransition(async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(payload?.error ?? "Eliminazione non riuscita.");
        return;
      }

      toast.success("Veicolo eliminato definitivamente.");
      router.push("/vehicles");
      router.refresh();
    });
  }

  return (
    <>
      <section className="rounded-3xl border border-red-500/30 bg-red-500/[0.06] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                Zona pericolosa
              </p>
            </div>
            <p className="text-sm text-red-900/80 dark:text-red-100/85">
              Elimina definitivamente questo veicolo e tutti i dati collegati del tuo account.
              I dati importati da API per la targa resteranno in cache e non verranno cancellati.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina veicolo
          </Button>
        </div>
      </section>

      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Elimina definitivamente il veicolo"
        description="Questa azione rimuove veicolo, scadenze, rifornimenti, spese e associazioni guidatori del tuo account. La cache API della targa resta salvata."
        desktopClassName="max-w-xl"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4 text-sm text-red-900/80 dark:text-red-100/85">
            Per confermare, scrivi la targa <span className="font-semibold">{normalizedPlate}</span>.
          </div>

          <div className="space-y-2">
            <Label htmlFor="danger-confirm-plate">Targa di conferma</Label>
            <Input
              id="danger-confirm-plate"
              value={confirmationPlate}
              onChange={(event) => setConfirmationPlate(event.target.value)}
              placeholder={normalizedPlate}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Annulla
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || pending}
            >
              {pending ? "Eliminazione..." : "Elimina definitivamente"}
            </Button>
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  );
}
