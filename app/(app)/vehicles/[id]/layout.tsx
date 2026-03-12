import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
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
  const vehicleFuelLabel = vehicle.fuelType
    ? vehicle.fuelType
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^\w/, (char) => char.toUpperCase())
    : null;
  const vehicleStatusLabel =
    vehicle.status === "VENDUTO"
      ? "Venduto"
      : vehicle.status === "ROTTAMATO"
        ? "Rottamato"
        : "Attivo";
  const vehicleIdentity = [vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const hasMissingProfileData =
    !vehicle.make || !vehicle.model || !vehicle.year || !formattedKm || !vehicle.fuelType;

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-background hover:text-foreground"
              href="/vehicles"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Veicoli</span>
            </Link>

            {hasMissingProfileData ? (
              <Link
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                href="#vehicle-details"
              >
                Completa dati
              </Link>
            ) : null}
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-4xl font-semibold tracking-tight md:text-5xl">
                {vehicle.plate}
              </p>
              <Badge variant={vehicle.status === "ATTIVO" ? "outline" : "secondary"}>
                {vehicleStatusLabel}
              </Badge>
            </div>

            {vehicleIdentity ? (
              <p className="mt-3 text-base text-foreground/85">{vehicleIdentity}</p>
            ) : (
              <p className="mt-3 text-base italic text-muted-foreground">
                Marca e modello non ancora inseriti
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={vehicle.year ? "" : "text-muted-foreground"}
              >
                {vehicle.year ? `Anno ${vehicle.year}` : "Anno non inserito"}
              </Badge>
              <Badge variant="outline">{vehicleTypeLabel}</Badge>
              <Badge
                variant="outline"
                className={formattedKm ? "" : "text-muted-foreground"}
              >
                {formattedKm ? `${formattedKm} km` : "Km non inseriti"}
              </Badge>
              <Badge
                variant="outline"
                className={vehicleFuelLabel ? "" : "text-muted-foreground"}
              >
                {vehicleFuelLabel ?? "Alimentazione non inserita"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {children}
    </div>
  );
}
