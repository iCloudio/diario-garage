import Link from "next/link";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
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
        </div>
      </Card>

      {children}
    </div>
  );
}
