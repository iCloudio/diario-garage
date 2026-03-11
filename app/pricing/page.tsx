import { Card } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</p>
          <h1 className="mt-3 text-3xl font-semibold">
            Nessun piano attivo
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Questa installazione non usa pricing, fatturazione o limiti di utilizzo.
          </p>
        </div>

        <Card className="border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">Accesso completo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Puoi usare tutte le funzionalita&apos; disponibili senza differenze di
            piano. La pagina resta solo per compatibilita&apos; con i link esistenti.
          </p>
        </Card>
      </div>
    </div>
  );
}
