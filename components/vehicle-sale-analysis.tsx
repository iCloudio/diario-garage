import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CalendarDays, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

interface VehicleSaleAnalysisProps {
  soldPrice: number;
  soldDate: Date;
  soldNotes?: string | null;
  totalExpenses: number;
  currency: string;
  purchaseDate: Date; // createdAt del veicolo come proxy
  odometerKm?: number | null;
}

export function VehicleSaleAnalysis({
  soldPrice,
  soldDate,
  soldNotes,
  totalExpenses,
  currency,
  purchaseDate,
  odometerKm,
}: VehicleSaleAnalysisProps) {
  const netResult = soldPrice - totalExpenses;
  const isProfit = netResult >= 0;

  // Calcola durata possesso in mesi
  const diffMs = soldDate.getTime() - purchaseDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffMonths = Math.round(diffDays / 30);
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  const avgMonthlyCost = diffMonths > 0 ? totalExpenses / diffMonths : 0;
  const costPerKm = odometerKm && odometerKm > 0 ? totalExpenses / odometerKm : null;

  return (
    <Card className="border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <p className="text-base font-semibold">Analisi Vendita</p>
        <Badge variant={isProfit ? "default" : "destructive"}>
          {isProfit ? "Guadagno" : "Perdita"}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Riepilogo finanziario */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Prezzo di vendita</p>
            <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">
              +{formatCurrency(soldPrice, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Spese totali</p>
            <p className="mt-2 text-2xl font-semibold text-red-600 dark:text-red-400">
              -{formatCurrency(totalExpenses, currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Bilancio netto</p>
            <div className="mt-2 flex items-center gap-2">
              {isProfit ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`text-2xl font-semibold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {isProfit ? "+" : ""}{formatCurrency(netResult, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiche possesso */}
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Durata possesso</span>
            </div>
            <span className="font-medium">
              {years > 0 && `${years} ${years === 1 ? "anno" : "anni"}`}
              {years > 0 && months > 0 && " e "}
              {months > 0 && `${months} ${months === 1 ? "mese" : "mesi"}`}
              {years === 0 && months === 0 && "Meno di un mese"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-muted-foreground">Costo medio/mese</span>
            <span className="font-medium">{formatCurrency(avgMonthlyCost, currency)}</span>
          </div>

          {costPerKm !== null && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <span className="text-muted-foreground">Costo per km</span>
              <span className="font-medium">{formatCurrency(costPerKm, currency)}</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-muted-foreground">Data vendita</span>
            <span className="font-medium">{soldDate.toLocaleDateString("it-IT")}</span>
          </div>
        </div>

        {soldNotes && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground mb-2">Note vendita</p>
            <p className="text-sm">{soldNotes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
