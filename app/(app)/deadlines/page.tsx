import Link from "next/link";
import { AlertTriangle, CalendarClock, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DeadlinesPage() {
  const user = await requireUser();
  const now = new Date();
  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

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

  const overdueCount = deadlines.filter((item) => item.dueDate < now).length;
  const dueSoonCount = deadlines.filter(
    (item) => item.dueDate >= now && item.dueDate <= in30
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
          Scadenze
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Scadenze principali</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Bollo, revisione e assicurazione ordinati per urgenza.
        </p>
      </div>

      {deadlines.length === 0 ? (
        <Card className="border-white/10 bg-black/40 p-6">
          <div className="flex items-center gap-3 text-zinc-300">
            <CalendarClock className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium text-white">Nessuna scadenza registrata</p>
              <p className="text-xs text-zinc-400">
                Inserisci una scadenza per restare in regola.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild>
              <Link href="/vehicles">
                <Plus className="mr-2 h-4 w-4" />
                Inserisci scadenze
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-black/40 p-5">
              <p className="text-sm text-zinc-400">Scadenze totali</p>
              <p className="mt-2 text-2xl font-semibold">{deadlines.length}</p>
            </Card>
            <Card className="border-white/10 bg-black/40 p-5">
              <p className="text-sm text-zinc-400">Entro 30 giorni</p>
              <p className="mt-2 text-2xl font-semibold">{dueSoonCount}</p>
            </Card>
            <Card className="border-white/10 bg-black/40 p-5">
              <p className="text-sm text-zinc-400">Scadute</p>
              <p className="mt-2 text-2xl font-semibold">{overdueCount}</p>
            </Card>
          </div>
          <div className="grid gap-4">
            {deadlines.map((deadline) => {
              const isOverdue = deadline.dueDate < now;
              const isSoon = deadline.dueDate >= now && deadline.dueDate <= in30;
              const badgeClass = isOverdue
                ? "border-red-500/40 text-red-300"
                : isSoon
                  ? "border-amber-500/40 text-amber-300"
                  : "border-white/10 text-zinc-200";

              return (
                <Card key={deadline.id} className="border-white/10 bg-black/40 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {isOverdue ? (
                          <AlertTriangle className="h-4 w-4 text-red-300" />
                        ) : (
                          <CalendarClock className="h-4 w-4 text-zinc-300" />
                        )}
                        <h3 className="text-lg font-semibold">{deadline.type}</h3>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {deadline.vehicle.plate} · {deadline.vehicle.make ?? ""} {deadline.vehicle.model ?? ""}
                      </p>
                      {deadline.amount != null && (
                        <p className="text-xs text-zinc-500">
                          Prezzo: €{deadline.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={badgeClass}>
                      {deadline.dueDate.toLocaleDateString("it-IT")}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
