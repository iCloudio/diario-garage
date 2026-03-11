import { Card } from "@/components/ui/card";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</p>
        <h2 className="mt-2 text-2xl font-semibold">Stato account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nessun vincolo di piano o fatturazione attivo.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <p className="text-sm font-medium text-foreground">Accesso completo</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Il prodotto non applica limiti legati a piano, fatturazione o numero di
          veicoli. Le informazioni di questa sezione restano disponibili solo come
          segnaposto per future impostazioni account.
        </p>
      </Card>
    </div>
  );
}
