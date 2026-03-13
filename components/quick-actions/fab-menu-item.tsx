"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FABMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  index: number;
  totalItems: number;
  isOpen: boolean;
};

/**
 * FAB Menu Item - Atomic Component
 * Individual action item in radial menu
 */
export const FABMenuItem = forwardRef<HTMLButtonElement, FABMenuItemProps>(
  ({ className, icon: Icon, label, index, totalItems, isOpen, ...props }, ref) => {
    // Calculate radial position
    // Items spread in a 90-degree arc from bottom-right
    const angle = (90 / (totalItems - 1)) * index - 90; // -90 to 0 degrees
    const radius = 80; // Distance from FAB center
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "absolute flex h-12 w-12 items-center justify-center rounded-full bg-background text-foreground shadow-lg ring-1 ring-border transition-all duration-300",
          "hover:bg-accent hover:text-accent-foreground hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-0 opacity-0",
          className
        )}
        style={{
          transform: isOpen
            ? `translate(${x}px, ${y}px) scale(1)`
            : "translate(0, 0) scale(0)",
          transitionDelay: isOpen ? `${index * 50}ms` : `${(totalItems - index - 1) * 50}ms`,
        }}
        aria-label={label}
        {...props}
      >
        <Icon className="h-5 w-5" />

        {/* Tooltip label */}
        <span
          className={cn(
            "absolute right-full mr-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md ring-1 ring-border transition-all duration-200",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{
            transitionDelay: isOpen ? `${index * 50 + 100}ms` : "0ms",
          }}
          aria-hidden="true"
        >
          {label}
        </span>
      </button>
    );
  }
);

FABMenuItem.displayName = "FABMenuItem";
