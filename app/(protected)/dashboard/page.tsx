"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { Loader2, TrendingUp, AlertTriangle, Calendar, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Mock KPI data
const mockKPIs = {
  activeVehicles: 10,
  activeDrivers: 12,
  totalLoads: 45,
  completedLoads: 32,
  pendingLoads: 8,
  inTransitLoads: 5,
  totalMiles: 24680,
  totalRevenue: 58750,
  upcomingMaintenance: 3,
  recentInspections: 8,
  failedInspections: 1,
  utilizationRate: "3.2",
  revenuePerMile: "2.38",
}

export default function DashboardPage() {
  const { company, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (!company) {
    return <div className="text-zinc-400">Company not found. Please create a company first.</div>
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="p-0 md:p-2 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <Button className="bg-primary/80 hover:bg-primary text-white border border-zinc-800 shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Load
          </Button>
        </div>
        <div className="w-full">
          <DashboardCards kpis={mockKPIs} />
        </div>
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Card className="bg-white/10 dark:bg-zinc-900/60 border-none shadow-xl backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-zinc-300 border-zinc-700 bg-black/60 hover:bg-zinc-800/80">
                + Create New Load
              </Button>
              <Button variant="outline" className="w-full justify-start text-zinc-300 border-zinc-700 bg-black/60 hover:bg-zinc-800/80">
                Schedule Maintenance
              </Button>
              <Button variant="outline" className="w-full justify-start text-zinc-300 border-zinc-700 bg-black/60 hover:bg-zinc-800/80">
                View Alerts
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-white flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Vehicle #1234 maintenance due</span>
                  <span className="text-xs text-zinc-600">2h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Driver HOS violation alert</span>
                  <span className="text-xs text-zinc-600">3h ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Load #5678 delayed</span>
                  <span className="text-xs text-zinc-600">5h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Load pickup - Chicago, IL</span>
                  <span className="text-xs text-zinc-600">06:00 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Vehicle maintenance - Truck #456</span>
                  <span className="text-xs text-zinc-600">11:30 AM</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded border border-zinc-800">
                  <span className="text-sm text-zinc-400">Driver meeting</span>
                  <span className="text-xs text-zinc-600">02:00 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}