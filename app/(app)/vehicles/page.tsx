import Link from "next/link";
import { Bike, Car, Caravan, CalendarClock, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    return { value: `Tra ${diffDays} giorni`, tone: "danger" };
  }

  if (diffDays <= 90) {
    const diffMonths = Math.round(diffDays / 30);
    return { value: `Tra ${diffMonths} mesi`, tone: "warning" };
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
      return "border-border/80 bg-muted/40 text-muted-foreground";
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

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
              Garage
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Veicoli sotto controllo, senza caos visivo.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Ogni card ti mostra solo cio&apos; che serve: identita&apos; del veicolo,
              stato delle scadenze e il prossimo punto da controllare.
            </p>
          </div>

          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi veicolo
            </Link>
          </Button>
        </div>
      </Card>

      {vehicles.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-card/75 p-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-foreground">
              Nessun veicolo inserito
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aggiungi il primo mezzo per iniziare a monitorare documenti,
              scadenze, spese e rifornimenti in un unico posto.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/vehicles/new">Crea il primo veicolo</Link>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((item) => {
            const deadlinesByType = new Map(
              item.deadlines.map((deadline) => [deadline.type, deadline]),
            );
            const VehicleIcon = getVehicleIcon(item.type ?? "AUTO");
            const nextDeadline = item.deadlines.find((deadline) => deadline.dueDate >= now) ?? null;
            const urgentCount = item.deadlines.filter((deadline) => {
              const diffDays = Math.ceil(
                (deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              return diffDays >= 0 && diffDays <= 30;
            }).length;

            return (
              <Link key={item.id} className="block" href={`/vehicles/${item.id}`}>
                <Card className="h-full border-border/80 bg-card/90 p-6 transition hover:border-primary/35 hover:bg-card hover:shadow-lg">
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
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        {item.plate}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.make ?? "Marca"} {item.model ?? ""}
                        {item.year ? ` · ${item.year}` : ""}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-background/70">
                      <VehicleIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/80 bg-background/65 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Prossima scadenza
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {nextDeadline
                            ? DEADLINE_LABELS[nextDeadline.type]
                            : "Nessuna scadenza inserita"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {nextDeadline
                            ? nextDeadline.dueDate.toLocaleDateString("it-IT")
                            : "Aggiungi bollo, assicurazione o revisione"}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CalendarClock className="h-4 w-4 text-primary" />
                      </div>
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
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-xs">
                    <span className="text-muted-foreground">
                      {item.deadlines.length > 0
                        ? `${item.deadlines.length} scadenze monitorate`
                        : "Configurazione da completare"}
                    </span>
                    <span className={urgentCount > 0 ? "font-medium text-amber-600 dark:text-amber-300" : "text-muted-foreground"}>
                      {urgentCount > 0 ? `${urgentCount} urgenti` : "Tutto sotto controllo"}
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
