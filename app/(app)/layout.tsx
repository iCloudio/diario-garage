import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Car,
  Gauge,
  Home,
  Settings,
  Snowflake,
  Ticket,
  Users,
  Wrench,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/vehicles", label: "Veicolo", icon: Car },
  { href: "/deadlines", label: "Scadenze", icon: CalendarClock },
  { href: "/maintenance", label: "Manutenzioni", icon: Wrench },
  { href: "/tires", label: "Gomme", icon: Snowflake },
  { href: "/components", label: "Componenti", icon: Gauge },
  { href: "/warning-lights", label: "Spie", icon: AlertTriangle },
  { href: "/drivers", label: "Guidatori", icon: Users },
  { href: "/incidents", label: "Incidenti", icon: AlertTriangle },
  { href: "/fines", label: "Multe", icon: Ticket },
  { href: "/statistics", label: "Statistiche", icon: BarChart3 },
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
      <div className="w-full px-3 py-4 md:grid md:grid-cols-[240px_1fr] md:gap-4">
        <aside className="hidden md:block">
          <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex h-full flex-col">
            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                DiarioGarage
              </p>
              <p className="text-base font-semibold">
                Ciao{user.name ? `, ${user.name}` : ""}
              </p>
              <p className="text-xs text-zinc-400">
                Il tuo garage sempre in regola.
              </p>
            </div>

            <nav className="space-y-1 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-accent/40 hover:text-foreground"
                  href={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-3 border-t border-border pt-4">
              <LogoutButton />
            </div>
            </div>
          </div>
        </aside>

        <div>
          <main className="w-full pb-16">{children}</main>
        </div>
      </div>

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
