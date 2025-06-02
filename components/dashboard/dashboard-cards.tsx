import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Truck, Users, Package, DollarSign, Activity, Wrench, AlertTriangle } from "lucide-react";

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
  const cards = [
    {
      title: "Active Vehicles",
      value: kpis.activeVehicles,
      change: kpis.activeVehiclesChange,
      icon: Truck,
      iconBg: "bg-blue-500",
      description: "Fleet vehicles in service",
      status: "Live",
      statusColor: "bg-green-500",
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
      progress: Math.round((kpis.activeLoads / (kpis.activeLoads + kpis.completedLoads)) * 100),
    },
    {
      title: "Completed Loads",
      value: kpis.completedLoads,
      icon: TrendingUp,
      iconBg: "bg-green-500",
      description: "Loads delivered in last 30 days",
      status: `${kpis.failedInspections} Failed`,
      statusColor: "bg-red-500",
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
      description: "Efficiency metric",
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
      description: "Vehicles due in 30 days",
      progress: Math.round((kpis.upcomingMaintenance / (kpis.upcomingMaintenance + kpis.maintenanceOverdue + 20)) * 100),
      status: kpis.maintenanceOverdue > 0 ? "Urgent" : undefined,
      statusColor: kpis.maintenanceOverdue > 0 ? "bg-red-500" : undefined,
    },
  ];

  const formatTrendChange = (change: string) => {
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    
    return (
      <div className={`flex items-center gap-1 text-xs ${
        isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
      }`}>
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        <span>{change}</span>
      </div>
    );
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="bg-black border-gray-700 hover:bg-gray-750 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium text-gray-300 mb-2">{card.title}</CardTitle>
                {card.status && (
                  <Badge className={`${card.statusColor} text-white text-xs px-2 py-1`}>
                    {card.status}
                  </Badge>
                )}
              </div>
              <div className={`${card.iconBg} p-2 rounded-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-white">{card.value}</div>
                {card.change && formatTrendChange(card.change)}
              </div>
              
              {card.progress !== undefined && (
                <div className="space-y-1">
                  <Progress 
                    value={card.progress} 
                    className="h-2 bg-gray-700"
                  />
                  <div className="text-xs text-gray-400">{card.progress}% complete</div>
                </div>
              )}
              
              <div className="text-xs text-gray-400">{card.description}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
