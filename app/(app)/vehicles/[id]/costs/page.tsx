import Link from "next/link";
import { AlertTriangle, BarChart3, LineChart, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  {
    label: "Grafici spese",
    href: "expenses",
    icon: LineChart,
    description: "Andamento mensile e breakdown categorie.",
  },
  {
    label: "Incidenti",
    href: "incidents",
    icon: AlertTriangle,
    description: "Costi, danni e coperture assicurative.",
  },
  {
    label: "Multe",
    href: "fines",
    icon: Ticket,
    description: "Registro e stato pagamenti.",
  },
  {
    label: "Statistiche",
    href: "statistics",
    icon: BarChart3,
    description: "Spese annuali e KPI principali.",
  },
];

export default function VehicleCostsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Costi & Eventi
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Spese e storico</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tieni traccia di eventi importanti e costi complessivi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label} className="border-border bg-card p-5">
            <Link
              href={`/vehicles/${params.id}/${item.href}`}
              className="flex items-start gap-3"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
