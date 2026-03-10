"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Fuel, CircleDollarSign, CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface QuickAddFabProps {
  vehicleId?: string;
}

export function QuickAddFab({ vehicleId }: QuickAddFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!vehicleId) {
    return null;
  }

  const actions = [
    {
      label: "Rifornimento",
      href: `/vehicles/${vehicleId}/refuels/new`,
      icon: Fuel,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Spesa",
      href: `/vehicles/${vehicleId}/expenses/new`,
      icon: CircleDollarSign,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "Scadenza",
      href: `/vehicles/${vehicleId}/deadlines`,
      icon: CalendarClock,
      color: "bg-amber-500 hover:bg-amber-600",
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 md:hidden">
          <Card className="border-border bg-card p-3 shadow-lg">
            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: action.color.split(" ")[0].replace("bg-", "#") }}
                >
                  <action.icon className="h-5 w-5" />
                  {action.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* FAB Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </>
  );
}
