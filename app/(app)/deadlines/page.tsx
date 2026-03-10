import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DeadlinesPage() {
  const user = await requireUser();
  const deadlines = await db.deadline.findMany({
    where: {
      vehicle: { userId: user.id, deletedAt: null },
      deletedAt: null,
    },
    include: {
      vehicle: { select: { plate: true, make: true, model: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Scadenze</h2>
        <p className="text-sm text-zinc-400">
          Bollo, revisione e assicurazione sempre sotto controllo.
        </p>
      </div>

      {deadlines.length === 0 ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <p className="text-sm text-zinc-400">Nessuna scadenza registrata.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deadlines.map((deadline) => (
            <Card key={deadline.id} className="border-white/10 bg-black/40 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{deadline.type}</h3>
                  <p className="text-sm text-zinc-400">
                    {deadline.vehicle.plate} · {deadline.vehicle.make ?? ""} {deadline.vehicle.model ?? ""}
                  </p>
                </div>
                <Badge variant="outline">
                  {deadline.dueDate.toLocaleDateString("it-IT")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
