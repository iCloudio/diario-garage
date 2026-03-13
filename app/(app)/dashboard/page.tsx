import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import {
  getDashboardVehicles,
  calculateDashboardStats,
  getUpcomingDeadlines,
  getRecentActivity,
} from "@/lib/services/dashboard-service";
import { QuickStatsWidget } from "@/components/dashboard/quick-stats-widget";
import { UpcomingDeadlinesWidget } from "@/components/dashboard/upcoming-deadlines-widget";
import { RecentActivityWidget } from "@/components/dashboard/recent-activity-widget";
import { EmptyVehicles } from "@/components/empty-states";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();

  // Get user profile for currency
  const profile = await db.user.findUnique({
    where: { id: user.id },
    select: { currency: true },
  });

  const currency = profile?.currency ?? "EUR";

  // Fetch all dashboard data in optimized single query per vehicle
  const vehicles = await getDashboardVehicles(user.id);

  // If no vehicles, show empty state
  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Panoramica di tutti i tuoi veicoli in un unico posto
          </p>
        </div>
        <EmptyVehicles />
      </div>
    );
  }

  // Calculate all dashboard metrics
  const stats = calculateDashboardStats(vehicles);
  const upcomingDeadlines = getUpcomingDeadlines(vehicles, now, 10);
  const recentActivity = getRecentActivity(vehicles, 15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Panoramica di tutti i tuoi veicoli in un unico posto
          </p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new">
            <Car className="mr-2 h-4 w-4" />
            Nuovo veicolo
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStatsWidget stats={stats} currency={currency} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <UpcomingDeadlinesWidget deadlines={upcomingDeadlines} />

        {/* Recent Activity */}
        <RecentActivityWidget activities={recentActivity} currency={currency} />
      </div>

      {/* Quick Link to Vehicles */}
      <div className="flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/vehicles">
            Vedi tutti i veicoli ({vehicles.length})
          </Link>
        </Button>
      </div>
    </div>
  );
}
