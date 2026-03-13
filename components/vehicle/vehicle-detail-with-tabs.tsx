"use client";

import { useSearchParams } from "next/navigation";
import { VehicleTabs, TabPanel, type TabId } from "./vehicle-tabs";
import type { ReactNode } from "react";

type VehicleDetailWithTabsProps = {
  vehicleId: string;
  overviewContent: ReactNode;
  historyContent: ReactNode;
  detailsContent: ReactNode;
};

/**
 * Vehicle Detail with Tabs
 * Wraps vehicle detail content with tab navigation
 */
export function VehicleDetailWithTabs({
  vehicleId,
  overviewContent,
  historyContent,
  detailsContent,
}: VehicleDetailWithTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) || "overview";

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="sticky top-[73px] z-10 -mx-5 bg-background/95 px-5 backdrop-blur md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <VehicleTabs vehicleId={vehicleId} defaultTab="overview" />
      </div>

      {/* Tab Panels */}
      <div>
        <TabPanel tabId="overview" activeTab={activeTab}>
          {overviewContent}
        </TabPanel>

        <TabPanel tabId="history" activeTab={activeTab}>
          {historyContent}
        </TabPanel>

        <TabPanel tabId="details" activeTab={activeTab}>
          {detailsContent}
        </TabPanel>
      </div>
    </div>
  );
}
