import Link from "next/link";
import { CalendarClock, Wrench, Snowflake, Gauge, AlertTriangle, BarChart3, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";

const actions = [
  { label: "Scadenze", href: "deadlines", icon: CalendarClock, description: "Bollo, assicurazione e revisione." },
  { label: "Manutenzioni", href: "maintenance", icon: Wrench, description: "Interventi e costi." },
  { label: "Gomme", href: "tires", icon: Snowflake, description: "Cambio stagionale e sostituzioni." },
  { label: "Componenti", href: "components", icon: Gauge, description: "Regole per cinghia, freni, filtri." },
  { label: "Incidenti", href: "incidents", icon: AlertTriangle, description: "Costi e copertura assicurativa." },
  { label: "Multe", href: "fines", icon: Ticket, description: "Registro e stato pagamenti." },
  { label: "Statistiche", href: "statistics", icon: BarChart3, description: "Costi annuali e KPI." },
  { label: "Spie", href: "warning-lights", icon: AlertTriangle, description: "Manuale spie del cruscotto." },
];

export default function VehicleOverviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {actions.map((action) => (
        <Card key={action.label} className="border-border bg-card p-5">
          <Link href={`/vehicles/${params.id}/${action.href}`} className="flex items-start gap-3">
            <action.icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}
