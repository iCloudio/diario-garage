"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FABButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * Floating Action Button (FAB) - Atomic Component
 * Material Design inspired floating action button
 */
export const FABButton = forwardRef<HTMLButtonElement, FABButtonProps>(
  ({ className, isOpen = false, size = "md", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-12 w-12",
      md: "h-14 w-14",
      lg: "h-16 w-16",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "group relative flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          sizeClasses[size],
          className
        )}
        aria-label="Quick actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        {...props}
      >
        {children ?? (
          <Plus
            className={cn(
              "h-6 w-6 transition-transform duration-200",
              isOpen && "rotate-45"
            )}
          />
        )}

        {/* Ripple effect */}
        <span
          className="absolute inset-0 rounded-full bg-primary-foreground/10 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </button>
    );
  }
);

FABButton.displayName = "FABButton";
