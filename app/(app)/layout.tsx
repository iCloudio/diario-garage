import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { AppHeaderNav } from "@/components/app-header-nav";
import { AppMobileNav } from "@/components/app-mobile-nav";

const navItems = [
  { href: "/vehicles", label: "Veicoli", icon: "car" as const },
  { href: "/drivers", label: "Guidatori", icon: "users" as const },
  { href: "/settings", label: "Impostazioni", icon: "settings" as const },
];

const headerNavItems = navItems.map(({ href, label }) => ({ href, label }));

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="app-dots-background relative min-h-screen overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/80 border-t-2 border-t-primary bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80">
              Libretto digitale
            </p>
            <p className="text-xs text-muted-foreground">Più ordine, meno sorprese.</p>
          </div>

          <AppHeaderNav items={headerNavItems} />

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs text-muted-foreground lg:block">
              Ciao{user.name ? `, ${user.name}` : ""}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-8 md:px-8 lg:px-10">
        {children}
      </main>

      <AppMobileNav items={navItems} />
    </div>
  );
}
