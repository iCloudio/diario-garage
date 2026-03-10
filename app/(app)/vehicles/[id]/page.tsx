import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const tabs = [
  { value: "deadlines", label: "Scadenze", href: "/vehicles" },
  { value: "maintenance", label: "Manutenzioni", href: "/maintenance" },
  { value: "tires", label: "Gomme", href: "/tires" },
  { value: "components", label: "Componenti", href: "/components" },
];

export default function VehicleDetailPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Veicolo</p>
        <h2 className="mt-2 text-2xl font-semibold">Dettaglio veicolo</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Questa pagina e&apos; un&apos;anteprima della struttura multi-veicolo.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <Tabs defaultValue="deadlines">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="deadlines" className="mt-4 text-sm text-zinc-400">
            In MVP la gestione scadenze vive nella pagina Veicolo.
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
