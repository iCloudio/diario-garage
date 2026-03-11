"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function AppHeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden self-stretch text-sm text-muted-foreground md:flex">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            className={cn(
              "relative flex items-center px-4 transition hover:text-foreground",
              isActive && "text-foreground",
            )}
            href={item.href}
          >
            {item.label}
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-x-[6px] border-x-transparent border-b-[6px] border-b-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
