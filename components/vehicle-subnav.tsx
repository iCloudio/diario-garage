"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { slug: "", label: "Panoramica" },
  { slug: "deadlines", label: "Scadenze" },
  { slug: "maintenance", label: "Manutenzioni" },
  { slug: "tires", label: "Gomme" },
  { slug: "components", label: "Componenti" },
  { slug: "incidents", label: "Incidenti" },
  { slug: "fines", label: "Multe" },
  { slug: "statistics", label: "Statistiche" },
  { slug: "warning-lights", label: "Spie" },
];

export function VehicleSubnav({ vehicleId }: { vehicleId: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const href = tab.slug
          ? `/vehicles/${vehicleId}/${tab.slug}`
          : `/vehicles/${vehicleId}`;
        const isActive = pathname === href;

        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground",
              isActive && "bg-accent/50 text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
