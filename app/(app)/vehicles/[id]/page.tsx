import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getVehicleWithStats, getAvailableDrivers } from "@/lib/services/vehicle-service";
import { getDeadlinesWithStatus } from "@/lib/services/deadline-service";
import { buildActivitiesTimeline, formatActivitiesForDisplay, getLatestRefuelSummary } from "@/lib/services/expense-service";
import { buildChartDatasets } from "@/lib/services/chart-service";
import { DEADLINE_LABELS } from "@/lib/constants/labels";
import { VehicleSaleAnalysis } from "@/components/vehicle-sale-analysis";
import { VehicleDetailHero } from "@/components/vehicle/vehicle-detail-hero";

export default async function VehicleOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const now = new Date();

  // Query ottimizzata: tutte le relazioni in una chiamata
  const [profile, vehicleData, allDrivers] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currency: true, fuelPriceRegion: true },
    }),
    getVehicleWithStats(id, user.id),
    getAvailableDrivers(user.id),
  ]);

  if (!vehicleData) {
    redirect("/vehicles");
  }

  const { vehicle, lifetimeTotal } = vehicleData;
  const currency = profile?.currency ?? "EUR";

  // Calcola scadenze con status
  const deadlinesWithStatus = getDeadlinesWithStatus(vehicle.deadlines, now);

  // Prepara dati guidatori
  const assignedDriverIds = new Set(vehicle.drivers.map(({ driverId }) => driverId));
  const availableDrivers = allDrivers.filter((driver) => !assignedDriverIds.has(driver.id));
  const assignedDrivers = vehicle.drivers.map(({ driver }) => ({
    id: driver.id,
    name: driver.name,
    licenseExpiry: driver.licenseExpiry.toISOString(),
  }));
  const unassignedDrivers = availableDrivers.map((driver) => ({
    id: driver.id,
    name: driver.name,
    licenseExpiry: driver.licenseExpiry.toISOString(),
  }));

  // Prepara dati scadenze per form
  const deadlineInputs = vehicle.deadlines.map((deadline) => ({
    type: deadline.type,
    dueDate: deadline.dueDate.toISOString().slice(0, 10),
    amount: deadline.amount ?? null,
  }));

  // Calcola ultimo rifornimento
  const latestRefuel = vehicle.refuels[0] ?? null;
  const latestRefuelSummary = getLatestRefuelSummary(latestRefuel, currency, now);

  // Costruisci timeline attività
  const activities = buildActivitiesTimeline(
    vehicle.deadlines.map((d) => ({ id: d.id, dueDate: d.dueDate, type: DEADLINE_LABELS[d.type] })),
    vehicle.expenses,
    vehicle.refuels
  );
  const hubActivities = formatActivitiesForDisplay(activities, currency);

  // Costruisci dataset grafici
  const chartDatasets = buildChartDatasets(vehicle.expenses, vehicle.refuels);

  // Prepara dati veicolo per form edit
  const vehicleEditData = {
    initialPlate: vehicle.plate,
    initialMake: vehicle.make,
    initialModel: vehicle.model,
    initialModelDetail: vehicle.modelDetail,
    initialFirstRegistrationDate: vehicle.firstRegistrationDate?.toISOString() ?? null,
    initialOdometerKm: vehicle.odometerKm,
    initialType: vehicle.type,
    initialFuelType: vehicle.fuelType,
    initialStatus: vehicle.status,
    initialSoldDate: vehicle.soldDate?.toISOString() ?? null,
    initialSoldPrice: vehicle.soldPrice,
    initialSoldNotes: vehicle.soldNotes,
    initialPowerKw: vehicle.powerKw,
    initialPowerHp: vehicle.powerHp,
    initialCubicCapacity: vehicle.cubicCapacity,
    initialAlarmSystemType: vehicle.alarmSystemType,
    initialEnvironmentalClass: vehicle.environmentalClass,
    initialListPriceAmount: vehicle.listPriceAmount,
    initialListPriceCurrency: vehicle.listPriceCurrency,
    initialInsuranceCompany: vehicle.insuranceCompany,
    initialInsurancePolicyNumber: vehicle.insurancePolicyNumber,
    initialInsurancePresent: vehicle.insurancePresent,
    initialInsuranceSuspended: vehicle.insuranceSuspended,
    initialInsuranceCompartmentExpiry: vehicle.insuranceCompartmentExpiry?.toISOString() ?? null,
  };

  // Calculate stats for hero card
  const totalExpenses = vehicle.expenses.length;
  const totalRefuels = vehicle.refuels.length;

  return (
    <div className="space-y-6">
      <VehicleDetailHero
        vehicleId={vehicle.id}
        vehiclePlate={vehicle.plate}
        vehicleFuelType={vehicle.fuelType}
        vehicleOdometerKm={vehicle.odometerKm}
        currency={currency}
        totalExpenses={totalExpenses}
        totalRefuels={totalRefuels}
        lifetimeTotal={lifetimeTotal}
        deadlineRows={deadlinesWithStatus}
        deadlineInputs={deadlineInputs}
        drivers={assignedDrivers}
        availableDrivers={unassignedDrivers}
        latestRefuelSummary={latestRefuelSummary}
        activities={hubActivities}
        chartDatasets={chartDatasets}
        vehicleEditData={vehicleEditData}
      />

      {vehicle.status === "VENDUTO" && vehicle.soldPrice && vehicle.soldDate ? (
        <VehicleSaleAnalysis
          soldPrice={vehicle.soldPrice}
          soldDate={vehicle.soldDate}
          soldNotes={vehicle.soldNotes}
          totalExpenses={lifetimeTotal}
          currency={currency}
          purchaseDate={vehicle.createdAt}
          odometerKm={vehicle.odometerKm}
        />
      ) : null}
    </div>
  );
}
