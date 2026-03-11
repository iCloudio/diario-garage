import Link from "next/link";
import { notFound } from "next/navigation";
import { Car, Pencil, FileDown, Fuel, DollarSign } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickAddFab } from "@/components/quick-add-fab";
import { VehicleLocalNav } from "@/components/vehicle-local-nav";
import { Badge } from "@/components/ui/badge";

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
  const vehicleStatusLabel =
    vehicle.status === "VENDUTO"
      ? "Venduto"
      : vehicle.status === "ROTTAMATO"
        ? "Rottamato"
        : "Attivo";

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Link
                className="flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
                href="/vehicles"
              >
                <Car className="h-3.5 w-3.5" />
                <span>Torna ai veicoli</span>
              </Link>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <p className="text-4xl font-semibold tracking-tight md:text-5xl">
                  {vehicle.plate}
                </p>
                <Badge variant={vehicle.status === "ATTIVO" ? "outline" : "secondary"}>
                  {vehicleStatusLabel}
                </Badge>
              </div>

              <p className="mt-3 text-base text-foreground/85">
                {vehicle.make ?? "Marca"} {vehicle.model ?? ""}
                {vehicle.year ? ` · ${vehicle.year}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{vehicleTypeLabel}</span>
                {formattedKm ? <span>· {formattedKm} km</span> : null}
                {vehicle.fuelType ? <span>· {vehicle.fuelType.replaceAll("_", " ")}</span> : null}
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-border/80 bg-background/75 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                Azioni rapide
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/vehicles/${vehicle.id}/expenses/new`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Aggiungi spesa
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/vehicles/${vehicle.id}/refuels/new`}>
                    <Fuel className="mr-2 h-4 w-4" />
                    Aggiungi rifornimento
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/vehicles/${vehicle.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Modifica
                  </Link>
                </Button>
              </div>
              <a
                href={`/api/vehicles/${vehicle.id}/export-pdf`}
                download
                className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <FileDown className="h-3.5 w-3.5" />
                Esporta PDF
              </a>
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
