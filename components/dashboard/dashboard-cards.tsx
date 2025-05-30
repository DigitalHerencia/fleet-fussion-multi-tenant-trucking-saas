import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Truck, Users, Package, DollarSign, TrendingUp, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface DashboardCardsProps {
  kpis: {
    activeVehicles: number
    activeDrivers: number
    totalLoads: number
    completedLoads: number
    pendingLoads: number
    inTransitLoads: number
    totalMiles: number
    totalRevenue: number
    upcomingMaintenance: number
    recentInspections: number
    failedInspections: number
    utilizationRate: string | number
    revenuePerMile: string | number
  }
}

export function DashboardCards({ kpis }: DashboardCardsProps) {
  const utilizationPercentage = Number.parseFloat(kpis.utilizationRate.toString()) * 10
  const completionRate = (kpis.completedLoads / kpis.totalLoads) * 100
  const inspectionSuccessRate = ((kpis.recentInspections - kpis.failedInspections) / kpis.recentInspections) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-0">
      {/* Active Vehicles */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-400" />
            Active Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.activeVehicles}</div>
          <div className="text-xs text-zinc-400 mt-1">
            Maintenance due:{" "}
            <span className="text-orange-400 font-semibold">3</span>
          </div>
        </CardContent>
      </Card>
      {/* Active Drivers */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-400" />
            Active Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.activeDrivers}</div>
          <div className="text-xs text-zinc-400 mt-1">Utilization rate</div>
          <Progress
            value={utilizationPercentage}
            className="h-2 mt-2 bg-zinc-800"
          />
          <div className="text-xs text-green-400 mt-1">
            {utilizationPercentage.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      {/* Active Loads */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            Active Loads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.totalLoads}</div>
          <div className="text-xs text-zinc-400 mt-1">
            Completed:{" "}
            <span className="text-emerald-400 font-semibold">
              {kpis.completedLoads}
            </span>{" "}
            | In Transit:{" "}
            <span className="text-blue-400 font-semibold">
              {kpis.inTransitLoads}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">Completion rate</div>
          <Progress
            value={completionRate}
            className="h-2 mt-2 bg-zinc-800"
          />
          <div className="text-xs text-emerald-400 mt-1">
            {completionRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      {/* Revenue */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-300" />
            Revenue (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            ${(kpis.totalRevenue / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Per mile avg:{" "}
            <span className="text-green-400 font-semibold">
              ${kpis.revenuePerMile}
            </span>
          </div>
        </CardContent>
      </Card>
      {/* Total Miles */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            Total Miles (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {(kpis.totalMiles / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Per vehicle avg:{" "}
            <span className="text-blue-400 font-semibold">2,468</span>
          </div>
        </CardContent>
      </Card>
      {/* Inspections */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-cyan-400" />
            Inspections (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.recentInspections}</div>
          <div className="text-xs text-zinc-400 mt-1">
            Failed:{" "}
            <span className="text-red-400 font-semibold">
              {kpis.failedInspections}
            </span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">Success rate</div>
          <Progress
            value={inspectionSuccessRate}
            className="h-2 mt-2 bg-zinc-800"
          />
          <div className="text-xs text-cyan-400 mt-1">
            {inspectionSuccessRate.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
      {/* Upcoming Maintenance */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-400" />
            Upcoming Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.upcomingMaintenance}</div>
          <div className="text-xs text-zinc-400 mt-1">Next 7 days</div>
        </CardContent>
      </Card>
      {/* Pending Loads */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-400" />
            Pending Loads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">{kpis.pendingLoads}</div>
          <div className="text-xs text-zinc-400 mt-1">
            Awaiting pickup:{" "}
            <span className="text-orange-400 font-semibold">4</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Awaiting assignment:{" "}
            <span className="text-yellow-400 font-semibold">4</span>
          </div>
        </CardContent>
      </Card>
      {/* Alerts/Warnings */}
      <Card className="bg-black border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">1</div>
          <div className="text-xs text-zinc-400 mt-1">See recent alerts above</div>
        </CardContent>
      </Card>
    </div>
  )
}
