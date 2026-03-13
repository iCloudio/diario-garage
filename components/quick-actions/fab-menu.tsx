"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fuel, DollarSign, Calendar } from "lucide-react";
import { FABButton } from "./fab-button";
import { FABMenuItem } from "./fab-menu-item";

type FABMenuProps = {
  vehicleId: string;
};

/**
 * FAB Menu - Quick Actions Component
 * Floating Action Button with radial menu for mobile
 * Only visible on mobile (<768px) in vehicle detail page
 */
export function FABMenu({ vehicleId }: FABMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Quick actions configuration
  const actions = [
    {
      icon: Fuel,
      label: "Nuovo rifornimento",
      href: `/vehicles/${vehicleId}/refuels/new`,
    },
    {
      icon: DollarSign,
      label: "Nuova spesa",
      href: `/vehicles/${vehicleId}/expenses/new`,
    },
    {
      icon: Calendar,
      label: "Nuova scadenza",
      href: `/vehicles/${vehicleId}/deadlines/new`,
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Focus trap when menu is open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);

    return () => {
      document.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleActionClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div
      ref={menuRef}
      className="fixed bottom-20 right-6 z-40 md:hidden"
      role="navigation"
      aria-label="Quick actions menu"
    >
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Menu items */}
      <div className="relative" role="menu" aria-orientation="vertical">
        {actions.map((action, index) => (
          <FABMenuItem
            key={action.label}
            icon={action.icon}
            label={action.label}
            index={index}
            totalItems={actions.length}
            isOpen={isOpen}
            onClick={() => handleActionClick(action.href)}
            role="menuitem"
          />
        ))}

        {/* Main FAB button */}
        <FABButton
          isOpen={isOpen}
          onClick={handleToggle}
          aria-label={isOpen ? "Chiudi azioni rapide" : "Apri azioni rapide"}
        />
      </div>
    </div>
  );
}
