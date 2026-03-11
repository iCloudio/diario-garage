import Link from "next/link";
import { Car, Settings, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/vehicles", label: "Veicoli", icon: Car },
  { href: "/drivers", label: "Guidatori", icon: Users },
  { href: "/settings", label: "Impostazioni", icon: Settings },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Libretto digitale
            </p>
            <p className="text-xs text-muted-foreground">Più ordine, meno sorprese.</p>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="transition hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground lg:block">
              Ciao{user.name ? `, ${user.name}` : ""}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-8 md:px-8 lg:px-10">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-2 text-[11px] text-muted-foreground">
          {navItems.map((item) => (
            <Link key={item.href} className="flex flex-col items-center gap-1 px-3 py-2" href={item.href}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
