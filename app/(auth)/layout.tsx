import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1b1b1f,_#0a0a0b_55%,_#050506_100%)] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            DiarioGarage
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Tutto il tuo parco auto in un unico diario.
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Accesso rapido, scadenze essenziali, zero rumore.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
