import { User, PhoneCall, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const drivers = [
  { name: "Mario Rossi", license: "12/04/2027", phone: "+39 333 1234567" },
  { name: "Laura Bianchi", license: "06/09/2025", phone: "+39 347 9876543" },
];

export default function DriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Guidatori</p>
          <h2 className="mt-2 text-2xl font-semibold">Patenti e contatti</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Reminder patente per ogni guidatore.
          </p>
        </div>
        <Button disabled>Aggiungi guidatore</Button>
      </div>

      <Card className="border-white/10 bg-black/40 p-6">
        <div className="space-y-3 text-sm text-zinc-300">
          {drivers.map((driver) => (
            <div key={driver.name} className="flex flex-col gap-2 border-b border-white/5 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium text-white">
                  <User className="h-4 w-4" />
                  {driver.name}
                </p>
                <p className="text-xs text-zinc-500">Patente: {driver.license}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Reminder attivo
                </span>
                <span className="flex items-center gap-1">
                  <PhoneCall className="h-3 w-3" />
                  {driver.phone}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Sezione in sviluppo: gestione guidatori in Fase 2.
        </p>
      </Card>
    </div>
  );
}
