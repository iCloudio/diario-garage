import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Home,
  Settings,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
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
      <div className="w-full px-3 py-4 md:grid md:grid-cols-[240px_1fr] md:gap-4">
        <aside className="hidden md:block">
          <div className="sticky top-4 h-[calc(100vh-2rem)] rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex h-full flex-col">
            <div className="mb-6 space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                DiarioGarage
              </p>
              <p className="text-base font-semibold">
                Ciao{user.name ? `, ${user.name}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
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

            <div className="mt-auto space-y-3">
              <div className="border-t border-border pt-4">
                <LogoutButton />
              </div>

              <div className="border-t border-border pt-3 text-center">
                <a
                  href="https://fulmi.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground transition hover:opacity-80"
                >
                  <span>Sviluppato da</span>
                  <Image
                    src="/fulminetLogo.png"
                    alt="Fulminet"
                    width={64}
                    height={14}
                    className="inline-block"
                  />
                </a>
              </div>
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
