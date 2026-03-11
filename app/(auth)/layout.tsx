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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_top_left,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_bottom_right,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(124,58,237,0.3)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-10">
        <div className="text-center">
          <h1 className="mt-2 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400/80 via-indigo-300/70 to-purple-400/80">
            <span className="block text-4xl">Libretto digitale</span>
            <span className="block text-3xl">Più ordine, meno sorprese.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registra le manutenzioni, monitora i costi e ricevi avvisi per ogni
            scadenza. Tutto in un unico posto.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
