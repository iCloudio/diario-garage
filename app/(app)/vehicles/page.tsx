import Link from "next/link";
import { Bike, Car, Caravan, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEADLINE_LABELS = {
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  REVISIONE: "Revisione",
} as const;

const DEADLINE_ORDER = ["ASSICURAZIONE", "BOLLO", "REVISIONE"] as const;
const VEHICLE_LABELS = {
  AUTO: "Auto",
  MOTO: "Moto",
  CAMPER: "Camper",
} as const;

type StatusTone = "muted" | "success" | "warning" | "danger";

function getVehicleIcon(type: keyof typeof VEHICLE_LABELS) {
  switch (type) {
    case "MOTO":
      return Bike;
    case "CAMPER":
      return Caravan;
    default:
      return Car;
  }
}

function formatDeadlineStatus(
  dueDate: Date | null | undefined,
  now: Date,
): { value: string; tone: StatusTone } {
  if (!dueDate) {
    return { value: "Da inserire", tone: "muted" };
  }

  const diffMs = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { value: "Scaduta", tone: "danger" };
  }

  if (diffDays <= 30) {
    return { value: `Scade tra ${diffDays} giorni`, tone: "danger" };
  }

  if (diffDays <= 90) {
    const diffMonths = Math.round(diffDays / 30);
    return { value: `Scade tra ${diffMonths} mesi`, tone: "warning" };
  }

  const formattedMonth = new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric",
  }).format(dueDate);

  return { value: `Fino a ${formattedMonth}`, tone: "success" };
}

function getStatusChipClass(tone: StatusTone) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "warning":
      return "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "danger":
      return "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-300";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export default async function VehiclesPage() {
  const user = await requireUser();
  const vehicles = await db.vehicle.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      deadlines: {
        where: { deletedAt: null },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const maxSlots = 6;
  const visibleVehicles = vehicles.slice(0, maxSlots);
  const emptySlots = Math.max(maxSlots - visibleVehicles.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Garage
          </p>
          <h2 className="mt-2 text-2xl font-semibold">I tuoi veicoli</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Controlla stato, scadenze e azioni da fare con un colpo d&apos;occhio.
          </p>
        </div>
      </div>

      <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleVehicles.map((item) => {
          const deadlinesByType = new Map(
            item.deadlines.map((deadline) => [deadline.type, deadline]),
          );
          const VehicleIcon = getVehicleIcon(item.type ?? "AUTO");
          return (
            <Link key={item.id} className="block" href={`/vehicles/${item.id}`}>
              <Card className="group h-full border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {VEHICLE_LABELS[item.type ?? "AUTO"]}
                      </p>
                      {item.status === "VENDUTO" && (
                        <Badge variant="secondary" className="text-xs">
                          Venduto
                        </Badge>
                      )}
                      {item.status === "ROTTAMATO" && (
                        <Badge variant="outline" className="text-xs">
                          Rottamato
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold">{item.plate}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.make ?? "Marca"} {item.model ?? ""}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/30">
                    <VehicleIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-xs">
                  {DEADLINE_ORDER.map((type) => {
                    const deadline = deadlinesByType.get(type);
                    const status = formatDeadlineStatus(deadline?.dueDate, now);
                    return (
                      <div key={type} className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">
                          {DEADLINE_LABELS[type]}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${getStatusChipClass(
                            status.tone,
                          )}`}
                        >
                          {status.value}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Tagliando</span>
                    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      Da fare
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, index) => (
          <Link key={`empty-${index}`} className="block" href="/vehicles/new">
            <Card className="flex h-full flex-col items-center justify-center gap-3 border-dashed border-border bg-card/60 p-6 text-center text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Aggiungi veicolo</p>
                <p className="text-xs text-muted-foreground">
                  Nuova targa, marca e modello.
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
