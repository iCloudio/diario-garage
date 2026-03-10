import Link from "next/link";
import { Card } from "@/components/ui/card";

const groups = [
  {
    title: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Veicolo", href: "/vehicles" },
      { label: "Scadenze", href: "/deadlines" },
      { label: "Manutenzioni", href: "/maintenance" },
      { label: "Gomme", href: "/tires" },
      { label: "Componenti", href: "/components" },
      { label: "Spie", href: "/warning-lights" },
      { label: "Guidatori", href: "/drivers" },
      { label: "Incidenti", href: "/incidents" },
      { label: "Multe", href: "/fines" },
      { label: "Statistiche", href: "/statistics" },
      { label: "Impostazioni", href: "/settings" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Login", href: "/login" },
      { label: "Registrazione", href: "/register" },
    ],
  },
  {
    title: "Info",
    items: [
      { label: "Piani", href: "/pricing" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Sitemap</p>
          <h1 className="mt-3 text-3xl font-semibold">Pagine principali</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Accesso rapido alle sezioni principali dell&apos;app.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.title} className="border-white/10 bg-black/40 p-6">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {group.items.map((item) => (
                  <Link key={item.href} className="block hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
