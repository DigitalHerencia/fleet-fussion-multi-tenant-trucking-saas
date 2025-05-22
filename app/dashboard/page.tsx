"use client"

import { useAuth } from "@/lib/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { Loader2 } from "lucide-react"

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
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!company) {
    return <div>Company not found. Please create a company first.</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your fleet operations" />
      <DashboardCards kpis={mockKPIs} />
    </DashboardShell>
  )
}
