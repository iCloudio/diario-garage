"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: "car" | "users" | "settings";
};

const iconMap = {
  car: Car,
  users: Users,
  settings: Settings,
} as const;

export function AppMobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border/80 bg-card/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-1 px-2 py-2 text-[11px] text-muted-foreground">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition",
                isActive
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-accent/40 hover:text-foreground",
              )}
              href={item.href}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
