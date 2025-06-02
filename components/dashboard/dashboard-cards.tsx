import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, Truck, Package, Route, ClipboardCheck, Wrench, Clock } from "lucide-react";

interface DashboardCardsProps {
  kpis: {
    activeVehicles: number;
    activeVehiclesChange?: string;
    activeDrivers: number;
    activeDriversChange?: string;
    activeLoads: number;
    activeLoadsLive?: number;
    completedLoads: number;
    inTransitLoads: number;
    totalRevenue: number;
    revenueChange?: string;
    revenuePerMile: string | number;
    revenueTarget?: string | number;
    totalMiles: number;
    milesChange?: string;
    milesPerVehicleAvg?: number;
    milesTarget?: number;
    recentInspections: number;
    failedInspections?: number; // Made optional as it might be 0
    inspectionSuccessRate?: string | number;
    upcomingMaintenance: number;
    maintenanceOverdue?: number;
    maintenanceThisWeek?: number;
    pendingLoads: number;
    pendingLoadsUrgent?: number;
    pendingLoadsAwaitingPickup?: number;
    pendingLoadsAwaitingAssignment?: number;
  };
}

const iconMap: { [key: string]: React.ElementType } = {
  Truck,
  Users,
  Package,
  DollarSign,
  Route,
  ClipboardCheck,
  Wrench,
  Clock,
};

export function DashboardCards({ kpis }: DashboardCardsProps) {
  const cardData = [
    { title: "Active Vehicles", value: kpis.activeVehicles, change: kpis.activeVehiclesChange, icon: "Truck" },
    { title: "Active Drivers", value: kpis.activeDrivers, change: kpis.activeDriversChange, icon: "Users" },
    { title: "Active Loads", value: kpis.activeLoads, live: kpis.activeLoadsLive, completed: kpis.completedLoads, inTransit: kpis.inTransitLoads, icon: "Package" },
    { title: "Revenue (30d)", value: kpis.totalRevenue, change: kpis.revenueChange, unit: "$", perMileAvg: kpis.revenuePerMile, target: kpis.revenueTarget, icon: "DollarSign" },
    { title: "Total Miles (30d)", value: kpis.totalMiles, change: kpis.milesChange, unit: "k", perVehicleAvg: kpis.milesPerVehicleAvg, target: kpis.milesTarget, icon: "Route" },
    { title: "Inspections (30d)", value: kpis.recentInspections, failed: kpis.failedInspections, successRate: kpis.inspectionSuccessRate, icon: "ClipboardCheck" },
    { title: "Upcoming Maintenance", value: kpis.upcomingMaintenance, overdue: kpis.maintenanceOverdue, thisWeek: kpis.maintenanceThisWeek, icon: "Wrench" },
    { title: "Pending Loads", value: kpis.pendingLoads, urgent: kpis.pendingLoadsUrgent, awaitingPickup: kpis.pendingLoadsAwaitingPickup, awaitingAssignment: kpis.pendingLoadsAwaitingAssignment, icon: "Clock" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
      {cardData.map((item, i) => {
        const IconComponent = iconMap[item.icon];
        return (
          <Card key={i} className="bg-background-soft shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">
                {item.title}
              </CardTitle>
              {IconComponent && <IconComponent className="h-4 w-4 text-foreground-muted" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {item.unit === "$" && item.unit}
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                {item.unit === "k" && item.unit}
              </div>
              {item.change && (
                <p className={`text-xs ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {item.change}
                </p>
              )}
              {item.title === "Active Loads" && (
                <div className="text-xs text-foreground-muted mt-1">
                  {item.live && <span className="text-green-400 mr-2">{item.live} Live</span>}
                  <span>{item.completed} Completed</span>, <span>{item.inTransit} In Transit</span>
                </div>
              )}
              {item.title === "Revenue (30d)" && item.perMileAvg && item.target && (
                <div className="text-xs text-foreground-muted mt-1 space-y-1">
                  <div>Per mile avg: ${item.perMileAvg}</div>
                  <div className="flex items-center gap-2">
                    <span>Target: ${item.target}/mile</span>
                    <Progress 
                      value={Math.min((Number(item.perMileAvg) / Number(item.target)) * 100, 100)} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs">
                      {Math.round((Number(item.perMileAvg) / Number(item.target)) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              {item.title === "Total Miles (30d)" && item.perVehicleAvg && item.target && (
                <div className="text-xs text-foreground-muted mt-1 space-y-1">
                  <div>Per vehicle avg: {item.perVehicleAvg?.toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <span>Monthly target: {item.target?.toLocaleString()} miles</span>
                    <Progress 
                      value={Math.min((Number(item.value) / Number(item.target)) * 100, 100)} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs">
                      {Math.round((Number(item.value) / Number(item.target)) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              {item.title === "Inspections (30d)" && item.successRate !== undefined && (
                <div className="text-xs text-foreground-muted mt-1 space-y-1">
                  {item.failed !== undefined && item.failed > 0 && (
                    <div className="text-red-500">{item.failed} Failed</div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>Success rate: {item.successRate}%</span>
                    <Progress 
                      value={Number(item.successRate)} 
                      className="h-2 flex-1"
                    />
                  </div>
                </div>
              )}
              {item.title === "Upcoming Maintenance" && item.overdue !== undefined && item.thisWeek !== undefined && (
                <div className="text-xs text-foreground-muted mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>{item.overdue} Overdue</span>
                    <span>{item.thisWeek} This week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Maintenance status</span>
                    <Progress 
                      value={item.value > 0 ? ((item.value - item.overdue) / item.value) * 100 : 100} 
                      className="h-2 flex-1"
                    />
                  </div>
                </div>
              )}
              {item.title === "Pending Loads" && item.awaitingPickup !== undefined && item.awaitingAssignment !== undefined && (
                <div className="text-xs text-foreground-muted mt-1">
                  {item.urgent !== undefined && item.urgent > 0 && <span className="text-orange-500 mr-2">{item.urgent} Urgent</span>}
                  <span>{item.awaitingPickup} Awaiting pickup</span>, <span>{item.awaitingAssignment} Awaiting assignment</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
