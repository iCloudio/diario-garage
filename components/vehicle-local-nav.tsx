"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "", label: "Panoramica" },
  { href: "deadlines", label: "Scadenze" },
  { href: "expenses", label: "Spese" },
  { href: "edit", label: "Dettagli" },
];

export function VehicleLocalNav({ vehicleId }: { vehicleId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const href = item.href ? `/vehicles/${vehicleId}/${item.href}` : `/vehicles/${vehicleId}`;
        const active =
          pathname === href || (item.href !== "" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-full border border-border/80 bg-background/80 px-4 py-2 text-sm text-muted-foreground transition hover:bg-accent/40 hover:text-foreground",
              active && "border-primary/25 bg-primary/10 text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
