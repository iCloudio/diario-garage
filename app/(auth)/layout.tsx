import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/vehicles");
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_top_left,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(540px_circle_at_bottom_right,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(124,58,237,0.28)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-10">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80">
            Libretto digitale
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground">
            Libretto Digitale: Più ordine, meno sorprese.
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Registra le manutenzioni, monitora i costi e ricevi avvisi per ogni
            scadenza. Tutto in un unico posto.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
