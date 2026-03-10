import Link from "next/link";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VehicleSubnav } from "@/components/vehicle-subnav";
import { Card } from "@/components/ui/card";

export default async function VehicleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const user = await requireUser();
  const vehicle = await db.vehicle.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
  });

  if (!vehicle) {
    notFound();
  }

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
          </div>
          <Link className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground" href="/vehicles">
            <Car className="h-4 w-4" />
            Torna al veicolo
          </Link>
        </div>
        <div className="mt-4">
          <VehicleSubnav vehicleId={vehicle.id} />
        </div>
      </Card>

      {children}
    </div>
  );
}
