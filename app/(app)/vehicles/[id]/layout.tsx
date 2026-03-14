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
  const vehiclePowerLabel =
    vehicle.powerKw != null
      ? `${vehicle.powerKw.toLocaleString("it-IT", {
          maximumFractionDigits: 0,
        })} kW · ${Math.round(vehicle.powerKw * 1.35962).toLocaleString("it-IT")} CV`
      : null;
  const vehicleStatusLabel =
    vehicle.status === "VENDUTO"
      ? "Venduto"
      : vehicle.status === "ROTTAMATO"
        ? "Rottamato"
        : "Attivo";
  const vehicleIdentity = [vehicle.make, vehicle.model].filter(Boolean).join(" ");
  const firstRegistrationLabel = vehicle.firstRegistrationDate
    ? new Intl.DateTimeFormat("it-IT", {
        month: "2-digit",
        year: "numeric",
      }).format(vehicle.firstRegistrationDate)
    : null;
  const hasMissingProfileData =
    !vehicle.make || !vehicle.model || !vehicle.firstRegistrationDate || !formattedKm || !vehicle.fuelType;

  const profileFacts = [
    {
      label: "Immatr.",
      value: firstRegistrationLabel ?? "—",
      muted: !firstRegistrationLabel,
    },
    {
      label: "Tipo",
      value: vehicleTypeLabel,
      muted: false,
    },
    {
      label: "Km",
      value: formattedKm ? `${formattedKm} km` : "—",
      muted: !formattedKm,
    },
    {
      label: "Alim.",
      value: vehicleFuelLabel ?? "—",
      muted: !vehicleFuelLabel,
    },
    {
      label: "Potenza",
      value: vehiclePowerLabel ?? "—",
      muted: !vehiclePowerLabel,
      wide: true,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-border/80 bg-card/90 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-5">
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
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                {vehicle.plate}
              </p>
              <Badge variant={vehicle.status === "ATTIVO" ? "outline" : "secondary"}>
                {vehicleStatusLabel}
              </Badge>
            </div>

            {vehicleIdentity ? (
              <p className="mt-2 text-sm text-foreground/85 sm:mt-3 sm:text-base">
                {vehicleIdentity}
              </p>
            ) : (
              <p className="mt-2 text-sm italic text-muted-foreground sm:mt-3 sm:text-base">
                Marca e modello non ancora inseriti
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {profileFacts.map((fact) => (
                <div
                  key={fact.label}
                  className={`rounded-2xl border border-border/70 bg-background/60 px-3 py-2.5 ${
                    fact.wide ? "col-span-2" : ""
                  } sm:min-w-[8.5rem]`}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {fact.label}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      fact.muted ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {children}
    </div>
  );
}
