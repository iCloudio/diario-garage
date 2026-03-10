import Link from "next/link";
import { CalendarClock, CircleDollarSign, Fuel, TrendingUp, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VehicleSaleAnalysis } from "@/components/vehicle-sale-analysis";

const FUEL_LABELS = {
  BENZINA: "Benzina",
  DIESEL: "Diesel",
  GPL: "GPL",
  METANO: "Metano",
  ELETTRICO: "Elettrico",
  IBRIDO_BENZINA: "Ibrido Benzina",
  IBRIDO_DIESEL: "Ibrido Diesel",
} as const;

export default async function VehicleOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null, dueDate: { gte: new Date() } },
        orderBy: { dueDate: "asc" },
        take: 1,
      },
      refuels: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        take: 1,
      },
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!vehicle) return null;

  const nextDeadline = vehicle.deadlines[0];
  const lastRefuel = vehicle.refuels[0];

  // Calcola spese anno corrente
  const currentYear = new Date().getFullYear();
  const yearExpenses = vehicle.expenses.filter(
    (exp) => exp.date.getFullYear() === currentYear
  );
  const totalYearExpenses = yearExpenses.reduce((sum, exp) => sum + exp.amountEur, 0);

  // Calcola consumo medio se ci sono almeno 2 rifornimenti
  const recentRefuels = await db.refuel.findMany({
    where: { vehicleId: vehicle.id, deletedAt: null, liters: { not: null } },
    orderBy: { date: "desc" },
    take: 10,
  });

  let avgConsumption: number | null = null;
  if (recentRefuels.length >= 2) {
    const totalLiters = recentRefuels.reduce((sum, r) => sum + (r.liters || 0), 0);
    const totalKm = recentRefuels[0].odometerKm - recentRefuels[recentRefuels.length - 1].odometerKm;
    if (totalKm > 0) {
      avgConsumption = (totalLiters / totalKm) * 100;
    }
  }

  // Calcola totale spese se venduto
  const allExpenses = [
    ...vehicle.expenses,
    ...vehicle.refuels.map((r) => ({ amountEur: r.amountEur })),
  ];
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amountEur, 0);

  return (
    <div className="space-y-6">
      {/* Analisi vendita se venduto */}
      {vehicle.status === "VENDUTO" && vehicle.soldPrice && vehicle.soldDate && (
        <VehicleSaleAnalysis
          soldPrice={vehicle.soldPrice}
          soldDate={vehicle.soldDate}
          soldNotes={vehicle.soldNotes}
          totalExpenses={totalExpenses}
          purchaseDate={vehicle.createdAt}
          odometerKm={vehicle.odometerKm}
        />
      )}

      {/* Dati veicolo */}
      <Card className="border-border bg-card p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Informazioni veicolo
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Marca e modello</span>
              <span className="font-medium">
                {vehicle.make ?? "—"} {vehicle.model ?? ""}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anno</span>
              <span className="font-medium">{vehicle.year ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">
                {vehicle.type === "MOTO" ? "Moto" : vehicle.type === "CAMPER" ? "Camper" : "Auto"}
              </span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alimentazione</span>
              <span className="font-medium">
                {vehicle.fuelType ? FUEL_LABELS[vehicle.fuelType] : "Non specificata"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chilometraggio</span>
              <span className="font-medium">
                {vehicle.odometerKm ? `${new Intl.NumberFormat("it-IT").format(vehicle.odometerKm)} km` : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato</span>
              <Badge variant={vehicle.status === "ATTIVO" ? "default" : "secondary"}>
                {vehicle.status === "ATTIVO" ? "Attivo" : vehicle.status === "VENDUTO" ? "Venduto" : "Rottamato"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats - Card cliccabili */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={`/vehicles/${id}/deadlines`}>
          <Card className="border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Prossima scadenza</p>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </div>
            {nextDeadline ? (
              <>
                <p className="mt-3 text-xl font-semibold">{nextDeadline.type}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {nextDeadline.dueDate.toLocaleDateString("it-IT")}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nessuna scadenza</p>
            )}
          </Card>
        </Link>

        <Link href={`/vehicles/${id}/expenses`}>
          <Card className="border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Spese {currentYear}</p>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-xl font-semibold">
              €{totalYearExpenses.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {yearExpenses.length} voci registrate
            </p>
          </Card>
        </Link>

        <Link href={`/vehicles/${id}/expenses`}>
          <Card className="border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Consumo medio</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {avgConsumption !== null ? (
              <>
                <p className="mt-3 text-xl font-semibold">
                  {avgConsumption.toFixed(1)} l/100km
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Basato su {recentRefuels.length} rifornimenti
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Dati insufficienti</p>
            )}
          </Card>
        </Link>
      </div>

      {/* Ultimo rifornimento */}
      {lastRefuel && (
        <Link href={`/vehicles/${id}/expenses`}>
          <Card className="border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Ultimo rifornimento</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRefuel.date.toLocaleDateString("it-IT")}
              </p>
            </div>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Importo</p>
                <p className="mt-1 font-medium">€{lastRefuel.amountEur.toFixed(2)}</p>
              </div>
              {lastRefuel.liters && (
                <>
                  <div>
                    <p className="text-muted-foreground">Litri</p>
                    <p className="mt-1 font-medium">{lastRefuel.liters.toFixed(1)} l</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prezzo/litro</p>
                    <p className="mt-1 font-medium">
                      €{lastRefuel.pricePerLiter?.toFixed(2) ?? "—"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Link>
      )}
    </div>
  );
}
