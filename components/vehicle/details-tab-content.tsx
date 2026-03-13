"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleEditForm } from "@/components/vehicle-edit-form";
import { VehicleDangerZone } from "@/components/vehicle-danger-zone";
import { ResponsiveOverlay } from "@/components/responsive-overlay";

type VehicleEditData = {
  initialPlate: string;
  initialMake?: string | null;
  initialModel?: string | null;
  initialModelDetail?: string | null;
  initialFirstRegistrationDate?: string | null;
  initialOdometerKm?: number | null;
  initialType?: "AUTO" | "MOTO" | "CAMPER";
  initialFuelType?:
    | "BENZINA"
    | "DIESEL"
    | "GPL"
    | "METANO"
    | "ELETTRICO"
    | "IBRIDO_BENZINA"
    | "IBRIDO_DIESEL"
    | null;
  initialStatus?: "ATTIVO" | "VENDUTO" | "ROTTAMATO";
  initialSoldDate?: string | null;
  initialSoldPrice?: number | null;
  initialSoldNotes?: string | null;
  initialPowerKw?: number | null;
  initialPowerHp?: number | null;
  initialCubicCapacity?: number | null;
  initialAlarmSystemType?: string | null;
  initialEnvironmentalClass?: string | null;
  initialListPriceAmount?: number | null;
  initialListPriceCurrency?: string | null;
  initialInsuranceCompany?: string | null;
  initialInsurancePolicyNumber?: string | null;
  initialInsurancePresent?: boolean | null;
  initialInsuranceSuspended?: boolean | null;
  initialInsuranceCompartmentExpiry?: string | null;
};

type DetailsTabContentProps = {
  vehicleId: string;
  vehiclePlate: string;
  currency: string;
  vehicleEditData: VehicleEditData;
};

/**
 * Details Tab Content
 * Shows vehicle details and edit form
 */
export function DetailsTabContent({
  vehicleId,
  vehiclePlate,
  currency,
  vehicleEditData,
}: DetailsTabContentProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const detailRows = [
    {
      label: "Targa",
      value: vehicleEditData.initialPlate,
    },
    {
      label: "Marca",
      value: vehicleEditData.initialMake?.trim() || "Non disponibile",
    },
    {
      label: "Modello",
      value: vehicleEditData.initialModel?.trim() || "Non disponibile",
    },
    {
      label: "Dettaglio modello",
      value: vehicleEditData.initialModelDetail?.trim() || "Non specificato",
    },
    {
      label: "Prima immatricolazione",
      value: vehicleEditData.initialFirstRegistrationDate
        ? new Date(vehicleEditData.initialFirstRegistrationDate).toLocaleDateString("it-IT")
        : "Non disponibile",
    },
    {
      label: "Chilometraggio",
      value:
        vehicleEditData.initialOdometerKm != null
          ? `${new Intl.NumberFormat("it-IT").format(vehicleEditData.initialOdometerKm)} km`
          : "Non disponibile",
    },
    {
      label: "Tipo",
      value:
        vehicleEditData.initialType === "AUTO"
          ? "Auto"
          : vehicleEditData.initialType === "MOTO"
            ? "Moto"
            : vehicleEditData.initialType === "CAMPER"
              ? "Camper"
              : "Non specificato",
    },
    {
      label: "Alimentazione",
      value: vehicleEditData.initialFuelType
        ? vehicleEditData.initialFuelType.replace("_", " ")
        : "Non specificato",
    },
    {
      label: "Potenza",
      value:
        vehicleEditData.initialPowerKw != null && vehicleEditData.initialPowerHp != null
          ? `${vehicleEditData.initialPowerKw} kW (${vehicleEditData.initialPowerHp} CV)`
          : vehicleEditData.initialPowerKw != null
            ? `${vehicleEditData.initialPowerKw} kW`
            : vehicleEditData.initialPowerHp != null
              ? `${vehicleEditData.initialPowerHp} CV`
              : "Non disponibile",
    },
    {
      label: "Cilindrata",
      value:
        vehicleEditData.initialCubicCapacity != null
          ? `${vehicleEditData.initialCubicCapacity} cc`
          : "Non disponibile",
    },
    {
      label: "Classe ambientale",
      value: vehicleEditData.initialEnvironmentalClass?.trim() || "Non specificata",
    },
    {
      label: "Antifurto",
      value: vehicleEditData.initialAlarmSystemType?.trim() || "Non specificato",
    },
    {
      label: "Listino",
      value:
        vehicleEditData.initialListPriceAmount != null &&
        vehicleEditData.initialListPriceCurrency
          ? new Intl.NumberFormat("it-IT", {
              style: "currency",
              currency: vehicleEditData.initialListPriceCurrency,
            }).format(vehicleEditData.initialListPriceAmount)
          : "Non disponibile",
    },
    {
      label: "Compagnia RCA",
      value: vehicleEditData.initialInsuranceCompany?.trim() || "Non disponibile",
    },
    {
      label: "Polizza RCA",
      value: vehicleEditData.initialInsurancePolicyNumber?.trim() || "Non disponibile",
    },
    {
      label: "Stato RCA",
      value:
        vehicleEditData.initialInsurancePresent == null
          ? "Non disponibile"
          : vehicleEditData.initialInsurancePresent
            ? vehicleEditData.initialInsuranceSuspended
              ? "Attiva ma sospesa"
              : "Attiva"
            : "Non presente",
    },
    {
      label: "Scadenza comparto RCA",
      value: vehicleEditData.initialInsuranceCompartmentExpiry
        ? new Date(vehicleEditData.initialInsuranceCompartmentExpiry).toLocaleDateString("it-IT")
        : "Non disponibile",
    },
    {
      label: "Stato amministrativo",
      value:
        vehicleEditData.initialStatus === "VENDUTO"
          ? "Venduto"
          : vehicleEditData.initialStatus === "ROTTAMATO"
            ? "Rottamato"
            : "Attivo",
    },
    {
      label: "Vendita",
      value:
        vehicleEditData.initialStatus === "VENDUTO" && vehicleEditData.initialSoldDate
          ? `${new Date(vehicleEditData.initialSoldDate).toLocaleDateString("it-IT")}${vehicleEditData.initialSoldPrice != null ? ` · ${new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(vehicleEditData.initialSoldPrice)}` : ""}`
          : "Non applicabile",
    },
    {
      label: "Note vendita",
      value: vehicleEditData.initialSoldNotes?.trim() || "Nessuna nota",
    },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Vehicle Details Section */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Dettagli veicolo
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Dati amministrativi e informazioni di vendita.
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setIsEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {detailRows.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <VehicleDangerZone vehicleId={vehicleId} vehiclePlate={vehiclePlate} />
      </div>

      {/* Edit Modal */}
      <ResponsiveOverlay
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Modifica veicolo"
        description="Aggiorna i dettagli del veicolo."
        desktopClassName="max-w-4xl"
      >
        <VehicleEditForm
          vehicleId={vehicleId}
          embedded
          onSuccess={() => setIsEditOpen(false)}
          onCancel={() => setIsEditOpen(false)}
          {...vehicleEditData}
        />
      </ResponsiveOverlay>
    </>
  );
}
