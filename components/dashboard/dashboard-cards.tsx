import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Truck,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";

interface DashboardCardsProps {
  kpis: {
    activeVehicles: number;
    activeDrivers: number;
    totalLoads: number;
    completedLoads: number;
    pendingLoads: number;
    inTransitLoads: number;
    totalMiles: number;
    totalRevenue: number;
    upcomingMaintenance: number;
    recentInspections: number;
    failedInspections: number;
    utilizationRate: string | number;
    revenuePerMile: string | number;
  };
}

export function DashboardCards({ kpis }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeVehicles}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.upcomingMaintenance} scheduled maintenance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.activeDrivers}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.utilizationRate} utilization rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.totalLoads}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.completedLoads} completed, {kpis.inTransitLoads} in transit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            ${kpis.revenuePerMile}/mile average
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Miles (30d)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis.totalMiles.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(kpis.totalMiles / (kpis.activeVehicles || 1))} miles per
            vehicle avg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inspections (30d)
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.recentInspections}</div>
          <p className="text-xs text-muted-foreground">
            {kpis.failedInspections} failed inspections
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Upcoming Maintenance
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.upcomingMaintenance}</div>
          <p className="text-xs text-muted-foreground">
            Scheduled in the next 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Loads</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.pendingLoads}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting assignment or pickup
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
