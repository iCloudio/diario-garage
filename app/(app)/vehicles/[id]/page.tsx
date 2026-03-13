import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VehicleSaleAnalysis } from "@/components/vehicle-sale-analysis";
import { VehicleOverviewHub } from "@/components/vehicle-overview-hub";
import { formatCurrency } from "@/lib/currency";

const MONTHS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

const EXPENSE_LABELS = {
  MANUTENZIONE: "Manutenzione",
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  MULTA: "Multa",
  PARCHEGGIO: "Parcheggio",
  LAVAGGIO: "Lavaggio",
  PEDAGGI: "Pedaggi",
  ALTRO: "Altro",
} as const;

const FUEL_LABELS = {
  BENZINA: "Benzina",
  DIESEL: "Diesel",
  GPL: "GPL",
  METANO: "Metano",
  ELETTRICO: "Elettrico",
  IBRIDO_BENZINA: "Ibrido benzina",
  IBRIDO_DIESEL: "Ibrido diesel",
} as const;

type DatasetRow = {
  year: number;
  monthIndex: number;
  fuel: number;
  maintenance: number;
  insurance: number;
  tax: number;
};

type ActivityEntry = {
  id: string;
  date: Date;
  title: string;
  subtitle: string;
  kind: "Scadenza" | "Spesa" | "Rifornimento";
  amount?: number;
};

function createEmptyYear(year: number): DatasetRow[] {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    year,
    monthIndex,
    fuel: 0,
    maintenance: 0,
    insurance: 0,
    tax: 0,
  }));
}

export default async function VehicleOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const now = new Date();

  const [profile, vehicle, allDrivers] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currency: true, fuelPriceRegion: true },
    }),
    db.vehicle.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: {
        deadlines: {
          where: { deletedAt: null },
          orderBy: { dueDate: "asc" },
        },
        refuels: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 100,
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: "desc" },
          take: 100,
        },
        drivers: {
          orderBy: {
            driver: { name: "asc" },
          },
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                licenseExpiry: true,
              },
            },
          },
        },
      },
    }),
    db.driver.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        licenseExpiry: true,
      },
    }),
  ]);

  if (!vehicle) {
    redirect("/vehicles");
  }

  const currency = profile?.currency ?? "EUR";

  const deadlinesWithStatus = (["ASSICURAZIONE", "BOLLO", "REVISIONE"] as const).map((type) => {
    const deadline = vehicle.deadlines.find((item) => item.type === type) ?? null;
    const diffDays = deadline
      ? Math.ceil(
          (new Date(
            deadline.dueDate.getFullYear(),
            deadline.dueDate.getMonth(),
            deadline.dueDate.getDate(),
          ).getTime() -
            new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      type,
      deadline,
      diffDays,
    };
  });

  const latestRefuel = vehicle.refuels[0] ?? null;
  const latestRefuelSummary = (() => {
    if (!latestRefuel) return null;

    const refuelDay = new Date(
      latestRefuel.date.getFullYear(),
      latestRefuel.date.getMonth(),
      latestRefuel.date.getDate(),
    );
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.max(
      0,
      Math.ceil((nowDay.getTime() - refuelDay.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      fuel: FUEL_LABELS[latestRefuel.fuelType] ?? latestRefuel.fuelType,
      amount: formatCurrency(latestRefuel.amountEur, currency),
      when:
        diffDays === 0
          ? "oggi"
          : `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`,
    };
  })();

  const activityEntries: ActivityEntry[] = [
    ...vehicle.deadlines.map((deadline) => ({
      id: `deadline-${deadline.id}`,
      date: deadline.dueDate,
      title: DEADLINE_LABELS[deadline.type],
      subtitle: "Scadenza registrata",
      kind: "Scadenza" as const,
    })),
    ...vehicle.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      title: EXPENSE_LABELS[expense.category],
      subtitle: expense.description ?? "Spesa registrata",
      kind: "Spesa" as const,
      amount: expense.amountEur,
    })),
    ...vehicle.refuels.map((refuel) => ({
      id: `refuel-${refuel.id}`,
      date: refuel.date,
      title: "Rifornimento",
      subtitle: FUEL_LABELS[refuel.fuelType] ?? refuel.fuelType,
      kind: "Rifornimento" as const,
      amount: refuel.amountEur,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

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

  const deadlineInputs = vehicle.deadlines.map((deadline) => ({
    type: deadline.type,
    dueDate: deadline.dueDate.toISOString().slice(0, 10),
    amount: deadline.amount ?? null,
  }));

  const totalExpenses = await db.expense.aggregate({
    where: { vehicleId: vehicle.id, deletedAt: null },
    _sum: { amountEur: true },
  });
  const totalRefuels = await db.refuel.aggregate({
    where: { vehicleId: vehicle.id, deletedAt: null },
    _sum: { amountEur: true },
  });
  const lifetimeTotal =
    (totalExpenses._sum.amountEur ?? 0) + (totalRefuels._sum.amountEur ?? 0);

  const yearsSet = new Set<number>();
  vehicle.expenses.forEach((item) => yearsSet.add(item.date.getFullYear()));
  vehicle.refuels.forEach((item) => yearsSet.add(item.date.getFullYear()));
  if (yearsSet.size === 0) {
    yearsSet.add(new Date().getFullYear());
  }

  const years = Array.from(yearsSet).sort((a, b) => b - a);
  const yearMap = new Map<number, DatasetRow[]>(years.map((year) => [year, createEmptyYear(year)]));

  for (const expense of vehicle.expenses) {
    const rows = yearMap.get(expense.date.getFullYear());
    if (!rows) continue;
    const row = rows[expense.date.getMonth()];
    if (!row) continue;

    if (expense.category === "MANUTENZIONE") row.maintenance += expense.amountEur;
    if (expense.category === "ASSICURAZIONE") row.insurance += expense.amountEur;
    if (expense.category === "BOLLO") row.tax += expense.amountEur;
  }

  for (const refuel of vehicle.refuels) {
    const rows = yearMap.get(refuel.date.getFullYear());
    if (!rows) continue;
    const row = rows[refuel.date.getMonth()];
    if (!row) continue;
    row.fuel += refuel.amountEur;
  }

  const historicalRows = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([, rows]) => rows);

  const chartDatasets = [
    {
      key: "all",
      label: "Tutto lo storico",
      monthlyData: historicalRows.map((row) => ({
        month: `${MONTHS[row.monthIndex]} ${String(row.year).slice(-2)}`,
        total: row.fuel + row.maintenance + row.insurance + row.tax,
        fuel: row.fuel,
      })),
      pieData: [
        {
          key: "carburante",
          name: "Carburante",
          value: historicalRows.reduce((sum, row) => sum + row.fuel, 0),
        },
        {
          key: "manutenzione",
          name: "Manutenzione",
          value: historicalRows.reduce((sum, row) => sum + row.maintenance, 0),
        },
        {
          key: "assicurazione",
          name: "Assicurazione",
          value: historicalRows.reduce((sum, row) => sum + row.insurance, 0),
        },
        {
          key: "bollo",
          name: "Bollo",
          value: historicalRows.reduce((sum, row) => sum + row.tax, 0),
        },
      ].filter((item) => item.value > 0),
    },
    ...years.map((year) => {
      const rows = yearMap.get(year) ?? [];
      return {
        key: `${year}`,
        label: `${year}`,
        monthlyData: rows.map((row) => ({
          month: MONTHS[row.monthIndex],
          total: row.fuel + row.maintenance + row.insurance + row.tax,
          fuel: row.fuel,
        })),
        pieData: [
          {
            key: "carburante",
            name: "Carburante",
            value: rows.reduce((sum, row) => sum + row.fuel, 0),
          },
          {
            key: "manutenzione",
            name: "Manutenzione",
            value: rows.reduce((sum, row) => sum + row.maintenance, 0),
          },
          {
            key: "assicurazione",
            name: "Assicurazione",
            value: rows.reduce((sum, row) => sum + row.insurance, 0),
          },
          {
            key: "bollo",
            name: "Bollo",
            value: rows.reduce((sum, row) => sum + row.tax, 0),
          },
        ].filter((item) => item.value > 0),
      };
    }),
  ];

  const hubActivities = activityEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: entry.subtitle,
    kind: entry.kind,
    dateLabel: entry.date.toLocaleDateString("it-IT"),
    amountLabel: entry.amount != null ? formatCurrency(entry.amount, currency) : undefined,
  }));

  return (
    <div className="space-y-6">
      <VehicleOverviewHub
        vehicleId={vehicle.id}
        vehiclePlate={vehicle.plate}
        currency={currency}
        deadlineRows={deadlinesWithStatus.map((item) => ({
          type: item.type,
          label: DEADLINE_LABELS[item.type],
          dueDateLabel: item.deadline
            ? item.deadline.dueDate.toLocaleDateString("it-IT")
            : "Da inserire",
          dueDate: item.deadline ? item.deadline.dueDate.toISOString() : null,
          diffDays:
            item.deadline != null
              ? Math.ceil(
                  (new Date(
                    item.deadline.dueDate.getFullYear(),
                    item.deadline.dueDate.getMonth(),
                    item.deadline.dueDate.getDate(),
                  ).getTime() -
                    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : null,
        }))}
        deadlineInputs={deadlineInputs}
        drivers={assignedDrivers}
        availableDrivers={unassignedDrivers}
        latestRefuelSummary={latestRefuelSummary}
        currentOdometer={vehicle.odometerKm ?? 0}
        vehicleFuelType={vehicle.fuelType}
        activities={hubActivities}
        totalRecordedLabel={formatCurrency(lifetimeTotal, currency)}
        chartDatasets={chartDatasets}
        vehicleEditData={{
          initialPlate: vehicle.plate,
          initialMake: vehicle.make,
          initialModel: vehicle.model,
          initialModelDetail: vehicle.modelDetail,
          initialFirstRegistrationDate:
            vehicle.firstRegistrationDate?.toISOString() ?? null,
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
          initialInsuranceCompartmentExpiry:
            vehicle.insuranceCompartmentExpiry?.toISOString() ?? null,
        }}
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
