import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VehicleDeadlinesForm } from "@/components/vehicle-deadlines-form";

export default async function VehicleDeadlinesPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const vehicle = await db.vehicle.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
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
      <VehicleDeadlinesForm vehicleId={vehicle.id} deadlines={deadlines} />

      <Card className="border-border bg-card p-6">
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
