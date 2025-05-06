"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { Loader2 } from "lucide-react"

// Mock KPI data - in a real app, you'd fetch this based on the company ID
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

export default function CompanyDashboardPage() {
  const { companyId } = useParams() as { companyId: string }
  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCompanyData() {
      try {
        const res = await fetch(`/api/companies/${companyId}`)
        if (!res.ok) throw new Error("Failed to fetch company")
        const data = await res.json()
        setCompany(data)
      } catch (error) {
        console.error("Error fetching company:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!company) {
    return <div>Company not found. Please check the URL or select a different company.</div>
  }

  return (
    <DashboardShell>
      <DashboardHeader 
        heading={`${company.name} Dashboard`} 
        text="Overview of your fleet operations" 
      />
      <DashboardCards kpis={mockKPIs} />
    </DashboardShell>
  )
}