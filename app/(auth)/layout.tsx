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
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_top_left,rgba(124,58,237,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_circle_at_bottom_right,rgba(99,102,241,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(124,58,237,0.3)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6 py-10">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="DiarioGarage"
              width={320}
              height={80}
              className="mx-auto block"
            />
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-400/80 via-indigo-300/70 to-purple-400/80">
            Il tuo garage sempre in ordine.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ti aiuto a non dimenticare la manutenzione e le scadenze periodiche,
            traccio i soldi spesi per ogni tuo veicolo.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
