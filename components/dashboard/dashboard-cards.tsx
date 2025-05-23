import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Truck,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
      {/* Active Vehicles Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Vehicles</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.activeVehicles}</div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.1%
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Truck className="h-6 w-6 text-blue-700 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Maintenance due</span>
            <span className="font-medium text-amber-600">{kpis.upcomingMaintenance}</span>
          </div>
          <Progress value={75} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Active Drivers Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Drivers</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.activeDrivers}</div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.2%
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Users className="h-6 w-6 text-green-700 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Utilization rate</span>
            <span className="font-medium text-green-600">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={utilizationPercentage} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Active Loads Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Loads</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.totalLoads}</div>
              <Badge variant="secondary" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Package className="h-6 w-6 text-purple-700 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-medium text-green-600">{kpis.completedLoads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">In Transit</span>
              <span className="font-medium text-blue-600">{kpis.inTransitLoads}</span>
            </div>
          </div>
          <Progress value={completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Revenue Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (30d)</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">${(kpis.totalRevenue / 1000).toFixed(0)}k</div>
              <Badge
                variant="default"
                className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <DollarSign className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Per mile avg</span>
            <span className="font-medium text-emerald-600">${kpis.revenuePerMile}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Target: $2.50/mile</div>
        </CardContent>
      </Card>

      {/* Total Miles Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Miles (30d)</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{(kpis.totalMiles / 1000).toFixed(1)}k</div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.3%
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Per vehicle avg</span>
            <span className="font-medium">
              {Math.round(kpis.totalMiles / (kpis.activeVehicles || 1)).toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Monthly target: 25k miles</div>
        </CardContent>
      </Card>

      {/* Inspections Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inspections (30d)</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.recentInspections}</div>
              <Badge
                variant={kpis.failedInspections > 0 ? "destructive" : "default"}
                className={cn(
                  "text-xs",
                  kpis.failedInspections === 0 &&
                    "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                )}
              >
                {kpis.failedInspections === 0 ? "Perfect" : `${kpis.failedInspections} Failed`}
              </Badge>
            </div>
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
              kpis.failedInspections > 0 ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20",
            )}
          >
            <AlertTriangle
              className={cn(
                "h-6 w-6",
                kpis.failedInspections > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400",
              )}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Success rate</span>
            <span className={cn("font-medium", inspectionSuccessRate === 100 ? "text-green-600" : "text-amber-600")}>
              {inspectionSuccessRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={inspectionSuccessRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Upcoming Maintenance Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Maintenance</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.upcomingMaintenance}</div>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />7 days
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-medium text-red-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This week</span>
              <span className="font-medium text-amber-600">{kpis.upcomingMaintenance}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Loads Card */}
      <Card className="group transition-all duration-200 bg-white/50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-lg hover:bg-white dark:hover:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Loads</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold tracking-tight">{kpis.pendingLoads}</div>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Awaiting pickup</span>
              <span className="font-medium">{Math.floor(kpis.pendingLoads * 0.6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Awaiting assignment</span>
              <span className="font-medium">{Math.ceil(kpis.pendingLoads * 0.4)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
