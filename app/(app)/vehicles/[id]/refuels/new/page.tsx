import { RefuelForm } from "@/components/refuel-form";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function NewRefuelPage({ params }: { params: Promise<{ id: string }> }) {
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
          Nuovo rifornimento
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Aggiungi rifornimento</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Registra un nuovo rifornimento per {vehicle.plate}
        </p>
      </div>

      <RefuelForm vehicleId={vehicle.id} currentOdometer={vehicle.odometerKm ?? 0} />
    </div>
  );
}
