"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { Loader2, TrendingUp, AlertTriangle, Calendar, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { RotateCw } from "lucide-react"
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
  const [refreshing, setRefreshing] = useState(false)

  // Placeholder for refresh logic
  const handleRefresh = async () => {
    setRefreshing(true)
    // TODO: Replace with real data refetch logic
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    )
  }

  if (!company) {
    return <div className="text-[hsl(var(--muted-foreground))]">Company not found. Please create a company first.</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 mt-10 dashboard-page">
      {/* Fleet Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Fleet Overview
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border border-[hsl(var(--success))] align-middle">Live</span>
          </h1>
          <p className="page-subtitle mt-1">Real-time insights into your fleet operations and performance</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span>Last updated: 2 minutes ago</span>
            <button
              className="ml-1 p-1 rounded hover:bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] transition-colors"
              aria-label="Refresh"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RotateCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <Button className="btn btn-primary shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Add Load
        </Button>
      </div>
      {/* KPI Cards */}
      <div className="w-full">
        <DashboardCards kpis={mockKPIs} />
      </div>
      {/* Quick Actions, Recent Alerts, Today's Schedule */}
      <div className="grid gap-6 md:grid-cols-3 mt-2">
        {/* Quick Actions Card */}
        <Card className="card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[hsl(var(--success))] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--success))]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1 justify-center">
            <Button variant="outline" className="btn btn-outline w-full flex-auto justify-start h-12 min-h-[48px] font-medium text-base gap-2">
              <Plus className="h-5 w-5 text-[hsl(var(--success))]" /> Create New Load
            </Button>
            <Button variant="outline" className="btn btn-outline w-full flex-auto justify-start h-12 min-h-[48px] font-medium text-base gap-2">
              <Calendar className="h-5 w-5 text-[hsl(var(--warning))]" /> Schedule Maintenance
            </Button>
            <Button variant="outline" className="btn btn-outline w-full flex-auto justify-start h-12 min-h-[48px] font-medium text-base gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--danger))]" /> View Alerts
            </Button>
          </CardContent>
        </Card>
        {/* Recent Alerts Card */}
        <Card className="card border-[hsl(var(--danger))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[hsl(var(--danger))] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--danger))]" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-[hsl(var(--danger)/0.12)] border border-[hsl(var(--danger))] rounded px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--danger))]" /> Vehicle #1234 maintenance due <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">2h ago</span>
              </div>
              <div className="bg-[hsl(var(--danger)/0.12)] border border-[hsl(var(--danger))] rounded px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--danger))]" /> HOS violation detected <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">4h ago</span>
              </div>
              <div className="bg-[hsl(var(--danger)/0.12)] border border-[hsl(var(--danger))] rounded px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[hsl(var(--danger))]" /> Load #5678 delayed <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">6h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Today's Schedule Card */}
        <Card className="card border-[hsl(var(--info))]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[hsl(var(--info))] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[hsl(var(--info))]" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-[hsl(var(--info)/0.12)] border border-[hsl(var(--info))] rounded px-3 py-2 flex justify-between items-center"><span>5 loads departing</span><span className="text-xs">Morning</span></div>
              <div className="bg-[hsl(var(--info)/0.12)] border border-[hsl(var(--info))] rounded px-3 py-2 flex justify-between items-center"><span>3 loads arriving</span><span className="text-xs">Afternoon</span></div>
              <div className="bg-[hsl(var(--info)/0.12)] border border-[hsl(var(--info))] rounded px-3 py-2 flex justify-between items-center"><span>2 maintenance scheduled</span><span className="text-xs">Evening</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}