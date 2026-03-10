import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/vehicles", label: "Veicoli" },
  { href: "/deadlines", label: "Scadenze" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              DiarioGarage
            </p>
            <p className="mt-1 text-lg font-semibold">
              Ciao{user.name ? `, ${user.name}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-sm text-zinc-300 md:flex">
              {navItems.map((item) => (
                <Link key={item.href} className="hover:text-white" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-24 pt-6">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/70 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-3 text-xs text-zinc-300">
          {navItems.map((item) => (
            <Link key={item.href} className="px-3 py-2" href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
