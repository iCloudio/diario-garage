import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, Pencil, FileDown, Fuel, DollarSign } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickAddFab } from "@/components/quick-add-fab";
import { VehicleLocalNav } from "@/components/vehicle-local-nav";

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
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  className="flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
                  href="/vehicles"
                >
                  <Car className="h-3.5 w-3.5" />
                  <span>Torna ai veicoli</span>
                </Link>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-primary/80">
                Veicolo
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{vehicle.plate}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {vehicle.make ?? "Marca"} {vehicle.model ?? ""} {vehicle.year ? `· ${vehicle.year}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{vehicleTypeLabel}</span>
                {formattedKm && (
                  <>
                    <span>·</span>
                    <span>{formattedKm} km</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/vehicles/${vehicle.id}/refuels/new`}>
                  <Fuel className="mr-2 h-4 w-4" />
                  Rifornimento
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={`/vehicles/${vehicle.id}/expenses/new`}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Spesa
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/vehicles/${vehicle.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifica
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href={`/api/vehicles/${vehicle.id}/export-pdf`} download>
                  <FileDown className="mr-2 h-4 w-4" />
                  PDF
                </a>
              </Button>
            </div>
          </div>

          <VehicleLocalNav vehicleId={vehicle.id} />
        </div>
      </Card>

      {children}

      <QuickAddFab vehicleId={vehicle.id} />
    </div>
  );
}
