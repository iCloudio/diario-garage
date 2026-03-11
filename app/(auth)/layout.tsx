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
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_top_left,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_bottom_right,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 px-6 py-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            DiarioGarage
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">
            La gestione del tuo veicolo, semplice e precisa.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Un solo posto per scadenze, manutenzione e spese del tuo veicolo.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
