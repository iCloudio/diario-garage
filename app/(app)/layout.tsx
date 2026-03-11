import { requireUser } from "@/lib/auth";
import { AppMobileNav } from "@/components/app-mobile-nav";
import { AppUserMenu } from "@/components/app-user-menu";

const navItems = [
  { href: "/vehicles", label: "Veicoli", icon: "car" as const },
  { href: "/settings", label: "Impostazioni", icon: "settings" as const },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="app-dots-background app-shell-background relative min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/80 border-t-2 border-t-primary bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">
              Libretto digitale
            </p>
            <p className="text-xs text-muted-foreground">Più ordine, meno sorprese.</p>
          </div>

          <AppUserMenu userName={user.name} />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-8 md:px-8 lg:px-10">
        {children}
      </main>

      <AppMobileNav items={navItems} />
    </div>
  );
}
