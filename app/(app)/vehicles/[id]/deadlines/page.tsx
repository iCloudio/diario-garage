import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleDeadlinesForm } from "@/components/vehicle-deadlines-form";

export default async function VehicleDeadlinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      deadlines: { where: { deletedAt: null }, orderBy: { dueDate: "asc" } },
    },
  });

  if (!vehicle) {
    return null;
  }

  const deadlines = vehicle.deadlines.map((deadline) => ({
    type: deadline.type,
    dueDate: deadline.dueDate.toISOString().slice(0, 10),
    amount: deadline.amount ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-primary/80">
          Scadenze
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Gestisci bollo, assicurazione e revisione
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Qui aggiorni tutte le scadenze importanti senza dover cercare tra altre
          informazioni del veicolo.
        </p>
      </div>

      <VehicleDeadlinesForm vehicleId={vehicle.id} deadlines={deadlines} />

      <Card className="border-border/80 bg-card/90 p-6">
        <p className="text-sm text-muted-foreground">Scadenze salvate</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
          {vehicle.deadlines.length === 0 ? (
            <p>Nessuna scadenza inserita.</p>
          ) : (
            vehicle.deadlines.map((deadline) => (
              <Badge key={deadline.id} variant="outline">
                {deadline.type} · {deadline.dueDate.toLocaleDateString("it-IT")}
              </Badge>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
