import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleEditForm } from "@/components/vehicle-edit-form";

export default async function VehicleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Veicolo
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Modifica dati veicolo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aggiorna targa, modello e chilometraggio.
        </p>
      </div>

      <VehicleEditForm
        vehicleId={vehicle.id}
        initialPlate={vehicle.plate}
        initialMake={vehicle.make}
        initialModel={vehicle.model}
        initialOdometerKm={vehicle.odometerKm}
        initialType={vehicle.type}
        initialFuelType={vehicle.fuelType}
        initialStatus={vehicle.status}
        initialSoldDate={vehicle.soldDate}
        initialSoldPrice={vehicle.soldPrice}
        initialSoldNotes={vehicle.soldNotes}
      />
    </div>
  );
}
