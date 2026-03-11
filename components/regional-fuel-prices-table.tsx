import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RegionalFuelPricesTableProps = {
  snapshotDate: Date | null;
  sourceUrl?: string;
  selectedRegion?: string | null;
  rows: Array<{
    region: string;
    BENZINA: string | null;
    GASOLIO: string | null;
    GPL: string | null;
    METANO: string | null;
  }>;
};

export function RegionalFuelPricesTable({
  snapshotDate,
  sourceUrl,
  selectedRegion,
  rows,
}: RegionalFuelPricesTableProps) {
  return (
    <Card className="border-border/80 bg-card/90 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Prezzi medi carburante per regione
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Valori ufficiali MIMIT. In tabella mostriamo la colonna `self service`.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {snapshotDate ? (
            <span>Aggiornamento {snapshotDate.toLocaleDateString("it-IT")}</span>
          ) : (
            <span>Nessun dato disponibile</span>
          )}
          {sourceUrl ? (
            <a
              className="ml-3 transition hover:text-foreground"
              href={sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              Fonte MIMIT
            </a>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
          Nessun dato MIMIT disponibile al momento.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Regione</th>
                <th className="px-3 py-2 font-medium">Benzina</th>
                <th className="px-3 py-2 font-medium">Gasolio</th>
                <th className="px-3 py-2 font-medium">GPL</th>
                <th className="px-3 py-2 font-medium">Metano</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = selectedRegion === row.region;

                return (
                  <tr
                    key={row.region}
                    className={cn(
                      "rounded-2xl bg-background/65",
                      isSelected && "bg-primary/8 ring-1 ring-primary/20",
                    )}
                  >
                    <td className="rounded-l-2xl px-3 py-3 font-medium text-foreground">
                      {row.region}
                    </td>
                    <td className="px-3 py-3 text-foreground">{row.BENZINA ?? "N/D"}</td>
                    <td className="px-3 py-3 text-foreground">{row.GASOLIO ?? "N/D"}</td>
                    <td className="px-3 py-3 text-foreground">{row.GPL ?? "N/D"}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-foreground">{row.METANO ?? "N/D"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
