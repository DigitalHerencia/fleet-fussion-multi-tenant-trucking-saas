import { notFound } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { LoadForm } from "@/components/dispatch/load-form"
import { getLoadById, getDriversForCompany, getVehiclesForCompany } from "@/lib/actions/load-actions"
import { getCurrentCompanyFromAuth } from "@/lib/auth"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface EditLoadPageProps {
  params: { id: string }
}

export default async function EditLoadPage({ params }: EditLoadPageProps) {
  const company = await getCurrentCompanyFromAuth()
  if (!company) {
    return <div>Company not found. Please create a company first.</div>
  }

  const [loadRes, driversRes, vehiclesRes] = await Promise.all([
    getLoadById(params.id, company.id),
    getDriversForCompany(company.id),
    getVehiclesForCompany(company.id)
  ])

  if (!loadRes.success) {
    return notFound()
  }

  const load = loadRes.data
  const drivers = driversRes.success ? driversRes.data : []
  const vehicles = vehiclesRes.success ? vehiclesRes.data : []

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Edit Load ${load.referenceNumber || ""}`}
        text="Update the load details"
      />
      <Suspense fallback={<EditLoadSkeleton />}> 
        <div className="mt-6">
          <LoadForm drivers={ [] } vehicles={ [] }  />
        </div>
      </Suspense>
    </DashboardShell>
  )
}

function EditLoadSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
