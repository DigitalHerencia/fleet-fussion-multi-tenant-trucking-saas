import { TrendingUp, TrendingDown, Truck, Users, Package, DollarSign, Activity, Wrench, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type DashboardKpis = {
  activeVehicles: number;
  activeVehiclesChange: string;
  activeDrivers: number;
  activeDriversChange: string;
  activeLoads: number;
  completedLoads: number;
  inTransitLoads: number;
  totalRevenue: number;
  revenueChange: string;
  revenuePerMile: number;
  totalMiles: number;
  milesChange: string;
  milesPerVehicleAvg: number;
  recentInspections: number;
  failedInspections: number;
  inspectionSuccessRate: number;
  upcomingMaintenance: number;
  maintenanceOverdue: number;
  maintenanceThisWeek: number;
  pendingLoads: number;
  pendingLoadsUrgent: number;
  pendingLoadsAwaitingPickup: number;
  pendingLoadsAwaitingAssignment: number;
};

export interface DashboardCardsProps {
  kpis: DashboardKpis;
}

export function DashboardCards({ kpis }: DashboardCardsProps) {
  // Logical order: assets, people, work, outcomes, maintenance
  const cards = [
    {
      title: "Active Vehicles",
      value: kpis.activeVehicles,
      change: kpis.activeVehiclesChange,
      icon: Truck,
      iconBg: "bg-blue-500",
      description: "Fleet vehicles in service",
    },
    {
      title: "Active Drivers",
      value: kpis.activeDrivers,
      change: kpis.activeDriversChange,
      icon: Users,
      iconBg: "bg-purple-500",
      description: "Drivers currently employed",
    },
    {
      title: "Active Loads",
      value: kpis.activeLoads,
      icon: Package,
      iconBg: "bg-orange-500",
      description: "Loads assigned or in transit",
      progress: kpis.activeLoads + kpis.completedLoads > 0 ? Math.round((kpis.activeLoads / (kpis.activeLoads + kpis.completedLoads)) * 100) : 0,
    },
    {
      title: "Completed Loads",
      value: kpis.completedLoads,
      icon: TrendingUp,
      iconBg: "bg-green-500",
      description: "Loads delivered in last 30 days",
    },
    {
      title: "Total Revenue",
      value: `$${kpis.totalRevenue.toLocaleString()}`,
      change: kpis.revenueChange,
      icon: DollarSign,
      iconBg: "bg-green-500",
      description: "Revenue (last 30 days)",
    },
    {
      title: "Revenue per Mile",
      value: `$${kpis.revenuePerMile}`,
      icon: Activity,
      iconBg: "bg-blue-500",
      description: "Revenue per mile (efficiency)",
    },
    {
      title: "Total Miles",
      value: kpis.totalMiles.toLocaleString(),
      change: kpis.milesChange,
      icon: Activity,
      iconBg: "bg-indigo-500",
      description: "Miles driven (last 30 days)",
    },
    {
      title: "Maintenance Due",
      value: kpis.upcomingMaintenance,
      icon: Wrench,
      iconBg: "bg-yellow-500",
      description: "Vehicles maintenance (30 days)",
      progress: kpis.upcomingMaintenance + kpis.maintenanceOverdue + 20 > 0 ? Math.round((kpis.upcomingMaintenance / (kpis.upcomingMaintenance + kpis.maintenanceOverdue + 20)) * 100) : 0,
    },
  ];

  const formatTrendChange = (change: string) => {
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    return (
      <span className={`ml-2 text-xs font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>{change}</span>
    );
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="bg-black border-gray-200 text-lg py-2 h-44 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-2">
              <div className="flex flex-col gap-1 flex-1">
                <CardTitle className="text-sm font-semibold text-zinc-200">{card.title}</CardTitle>
              </div>
              <div className={`${card.iconBg} p-1.5 rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="flex flex-col flex-1 justify-end">
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-4xl font-extrabold text-white leading-tight">{card.value}</span>
                  {card.change && formatTrendChange(card.change)}
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-auto pb-2">
                <div className="text-xs text-zinc-200">{card.description}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
