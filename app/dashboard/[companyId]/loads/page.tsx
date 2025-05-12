import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getCompanyById } from "@/lib/actions/companies"
import { getLoadsByCompanyId } from "@/lib/actions/loads"
import Loading from "./loading"

export default async function CompanyLoadsPage({
  params
}: {
  params: { companyId: string }
}) {
  const companyId = params.companyId
  const [company, loads] = await Promise.all([
    getCompanyById(companyId),
    getLoadsByCompanyId(companyId)
  ])

  if (!company) {
    return <div>Company not found. Please check the URL or select a different company.</div>
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardShell>
        <DashboardHeader
          heading={`${company.name} Loads`}
          text="Manage and track all your shipments"
        />
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Ref #</th>
                <th className="p-2 text-left font-medium">Customer</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Origin</th>
                <th className="p-2 text-left font-medium">Destination</th>
                <th className="p-2 text-left font-medium">Pickup</th>
                <th className="p-2 text-left font-medium">Delivery</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load: any) => (
                <tr key={load.id} className="border-b">
                  <td className="p-2">{load.referenceNumber}</td>
                  <td className="p-2">{load.customerName}</td>
                  <td className="p-2 capitalize">{load.status}</td>
                  <td className="p-2">{`${load.originCity}, ${load.originState}`}</td>
                  <td className="p-2">{`${load.destinationCity}, ${load.destinationState}`}</td>
                  <td className="p-2">{load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : "-"}</td>
                  <td className="p-2">{load.deliveryDate ? new Date(load.deliveryDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {loads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-muted-foreground">
                    No loads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashboardShell>
    </Suspense>
  )
}
