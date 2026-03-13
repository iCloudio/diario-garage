"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { LayoutGrid, History, FileText } from "lucide-react";

export type TabId = "overview" | "history" | "details";

type Tab = {
  id: TabId;
  label: string;
  icon: typeof LayoutGrid;
};

const tabs: Tab[] = [
  { id: "overview", label: "Panoramica", icon: LayoutGrid },
  { id: "history", label: "Storico", icon: History },
  { id: "details", label: "Dettagli", icon: FileText },
];

function buildVehicleTabUrl(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
  vehicleId: string,
  defaultTab: TabId,
  tabId: TabId,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (tabId === defaultTab) {
    params.delete("tab");
  } else {
    params.set("tab", tabId);
  }

  const queryString = params.toString();
  return queryString ? `/vehicles/${vehicleId}?${queryString}` : `/vehicles/${vehicleId}`;
}

type VehicleTabsProps = {
  vehicleId: string;
  defaultTab?: TabId;
  onTabChange?: (tab: TabId) => void;
};

/**
 * Vehicle Tabs Navigation
 * URL-synced tabs with keyboard navigation
 */
export function VehicleTabs({
  vehicleId,
  defaultTab = "overview",
  onTabChange,
}: VehicleTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabId) || defaultTab;

  const handleTabChange = (tabId: TabId) => {
    const newUrl = buildVehicleTabUrl(searchParams, vehicleId, defaultTab, tabId);
    router.push(newUrl, { scroll: false });
    onTabChange?.(tabId);
  };

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is on the tabs
      if (!document.activeElement?.closest('[role="tablist"]')) return;

      const currentIndex = tabs.findIndex((t) => t.id === currentTab);
      let newIndex = currentIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = tabs.length - 1;
      } else {
        return;
      }

      const newTab = tabs[newIndex];
      const newUrl = buildVehicleTabUrl(searchParams, vehicleId, defaultTab, newTab.id);
      router.push(newUrl, { scroll: false });
      onTabChange?.(newTab.id);

      // Focus the new tab button
      setTimeout(() => {
        const tabButton = document.querySelector(
          `[role="tab"][data-tab="${newTab.id}"]`
        ) as HTMLElement;
        tabButton?.focus();
      }, 0);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentTab, defaultTab, onTabChange, router, searchParams, vehicleId]);

  return (
    <div className="border-b border-border/80">
      <div
        className="flex gap-1 overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Vehicle sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              data-tab={tab.id}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tab Panel Wrapper
 * Wrapper for tab content with proper ARIA attributes
 */
type TabPanelProps = {
  tabId: TabId;
  activeTab: TabId;
  children: React.ReactNode;
};

export function TabPanel({ tabId, activeTab, children }: TabPanelProps) {
  const isActive = tabId === activeTab;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={cn("pt-6", !isActive && "hidden")}
    >
      {children}
    </div>
  );
}
