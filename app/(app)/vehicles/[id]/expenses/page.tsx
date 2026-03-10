import Link from "next/link";
import { Plus, TrendingUp, Fuel, Wrench, CircleDollarSign, FileDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const CATEGORY_LABELS = {
  RIFORNIMENTO: "Rifornimento",
  MANUTENZIONE: "Manutenzione",
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  MULTA: "Multa",
  PARCHEGGIO: "Parcheggio",
  LAVAGGIO: "Lavaggio",
  PEDAGGI: "Pedaggi",
  ALTRO: "Altro",
} as const;

const CATEGORY_ICONS = {
  RIFORNIMENTO: Fuel,
  MANUTENZIONE: Wrench,
  ASSICURAZIONE: CircleDollarSign,
  BOLLO: CircleDollarSign,
  MULTA: CircleDollarSign,
  PARCHEGGIO: CircleDollarSign,
  LAVAGGIO: CircleDollarSign,
  PEDAGGI: CircleDollarSign,
  ALTRO: CircleDollarSign,
} as const;

export default async function VehicleExpensesPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const vehicle = await db.vehicle.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    include: {
      expenses: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
      },
      refuels: {
        where: { deletedAt: null },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!vehicle) return null;

  // Combina spese e rifornimenti in un unico array ordinato
  const allExpenses = [
    ...vehicle.expenses,
    ...vehicle.refuels.map((refuel) => ({
      id: refuel.id,
      date: refuel.date,
      category: "RIFORNIMENTO" as const,
      amountEur: refuel.amountEur,
      odometerKm: refuel.odometerKm,
      description: refuel.liters ? `${refuel.liters.toFixed(1)} litri` : "Ricarica",
      notes: refuel.notes,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calcola totali anno corrente
  const currentYear = new Date().getFullYear();
  const yearExpenses = allExpenses.filter((exp) => exp.date.getFullYear() === currentYear);
  const totalYear = yearExpenses.reduce((sum, exp) => sum + exp.amountEur, 0);

  // Calcola totali per categoria
  const categoryTotals = yearExpenses.reduce((acc, exp) => {
    const cat = exp.category;
    acc[cat] = (acc[cat] || 0) + exp.amountEur;
    return acc;
  }, {} as Record<string, number>);

  // Calcola costo/km se disponibile
  let costPerKm: number | null = null;
  if (vehicle.odometerKm && vehicle.odometerKm > 0) {
    costPerKm = totalYear / vehicle.odometerKm;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Spese
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Storico completo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tutte le spese del veicolo in un unico posto.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/vehicles/${id}/refuels/new`}>
              <Fuel className="mr-2 h-4 w-4" />
              Rifornimento
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/vehicles/${id}/expenses/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Spesa
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`/api/vehicles/${id}/export-pdf`} download>
              <FileDown className="mr-2 h-4 w-4" />
              Esporta PDF
            </a>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Totale {currentYear}</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">€{totalYear.toFixed(2)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Media mensile: €{(totalYear / new Date().getMonth() || 1).toFixed(2)}
          </p>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Voci registrate</p>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold">{allExpenses.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Quest&apos;anno: {yearExpenses.length}
          </p>
        </Card>

        <Card className="border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Costo per km</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {costPerKm !== null ? (
            <>
              <p className="mt-3 text-2xl font-semibold">€{costPerKm.toFixed(2)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Basato su {vehicle.odometerKm?.toLocaleString("it-IT")} km
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Km non specificati</p>
          )}
        </Card>
      </div>

      {/* Breakdown per categoria */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleDollarSign className="h-4 w-4" />
          <span className="font-medium text-foreground">Spese per categoria ({currentYear})</span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([category, total]) => {
              const percentage = ((total / totalYear) * 100).toFixed(0);
              const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
              return (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">€{total.toFixed(2)}</span>
                    <Badge variant="outline">{percentage}%</Badge>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Lista spese */}
      <Card className="border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Tutte le spese</p>
          <p className="text-xs text-muted-foreground">
            {allExpenses.length} voci
          </p>
        </div>
        <div className="mt-4 space-y-3">
          {allExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna spesa registrata.</p>
          ) : (
            allExpenses.slice(0, 20).map((expense) => {
              const Icon = CATEGORY_ICONS[expense.category as keyof typeof CATEGORY_ICONS];
              return (
                <div
                  key={expense.id}
                  className="flex flex-col gap-2 border-b border-border pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS]}
                      </p>
                      {expense.description && (
                        <p className="text-xs text-muted-foreground">{expense.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {expense.date.toLocaleDateString("it-IT")}
                        {expense.odometerKm && ` · ${expense.odometerKm.toLocaleString("it-IT")} km`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{expense.amountEur.toFixed(2)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {allExpenses.length > 20 && (
          <p className="mt-4 text-xs text-muted-foreground">
            Mostrando le prime 20 spese. Totale: {allExpenses.length}
          </p>
        )}
      </Card>

      {/* Nota sviluppo futuro */}
      <Card className="border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">
          📊 Grafico interattivo delle spese in arrivo nella prossima versione
        </p>
      </Card>
    </div>
  );
}
