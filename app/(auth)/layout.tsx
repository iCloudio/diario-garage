import { redirect } from "next/navigation";
import Link from "next/link";
import { Car, CalendarCheck, Wrench } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            DiarioGarage
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            Il tuo garage sempre in regola.
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Non trascurare la tua auto: scadenze e manutenzione sotto controllo.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <CalendarCheck className="h-4 w-4 text-foreground" />
            <span>Scadenze chiare e sempre aggiornate.</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Wrench className="h-4 w-4 text-foreground" />
            <span>Storico manutenzioni essenziale e pulito.</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <Car className="h-4 w-4 text-foreground" />
            <span>Gestisci il tuo veicolo senza confusione.</span>
          </div>
        </div>

        {children}

        <div className="text-xs text-zinc-500">
          I piani e la sitemap sono disponibili nelle impostazioni.
        </div>
      </div>
    </div>
  );
}
