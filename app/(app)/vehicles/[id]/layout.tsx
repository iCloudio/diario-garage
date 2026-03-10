import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, Pencil, FileDown } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleSubnav } from "@/components/vehicle-subnav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickAddFab } from "@/components/quick-add-fab";

export default async function VehicleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const formattedKm = vehicle.odometerKm
    ? new Intl.NumberFormat("it-IT").format(vehicle.odometerKm)
    : null;
  const vehicleTypeLabel =
    vehicle.type === "MOTO" ? "Moto" : vehicle.type === "CAMPER" ? "Camper" : "Auto";

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Veicolo
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{vehicle.plate}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {vehicleTypeLabel}
            </p>
            {formattedKm ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {formattedKm} km
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/vehicles/${vehicle.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifica dati
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/api/vehicles/${vehicle.id}/export-pdf`} download>
                <FileDown className="mr-2 h-4 w-4" />
                Esporta PDF
              </a>
            </Button>
            <Link
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              href="/vehicles"
            >
              <Car className="h-4 w-4" />
              Torna ai veicoli
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <VehicleSubnav vehicleId={vehicle.id} />
        </div>
      </Card>

      {children}

      <QuickAddFab vehicleId={vehicle.id} />
    </div>
  );
}
