import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { LoadCard } from "@/components/dispatch/load-card";
import { listLoadsByOrg, getAvailableDriversForLoad, getAvailableVehiclesForLoad } from "@/lib/fetchers/dispatchFetchers"

export default async function DispatchPage({ params }: { params: { orgId: string; userId: string } }) {
  const { orgId } = params
  if (!orgId) {
    return <div className="text-red-400 p-8">Organization not found.</div>
  }

  // Fetch all required data in parallel
  const [loads, driversResult, vehicles] = await Promise.all([
    listLoadsByOrg(orgId),
    getAvailableDriversForLoad(orgId),
    getAvailableVehiclesForLoad(orgId, {}),
  ])
  const drivers = (driversResult?.data || []).map((d: any) => ({ ...d, email: d.email ?? undefined }))
  const loadList = loads?.data?.loads || []
  const vehicleList = vehicles?.data || []

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dispatch Board</h1>
          <p className="text-sm text-gray-400">Manage, assign, and track loads in real time</p>
        </div>
        {/* Add quick actions or filters here if needed */}
      </div>
      <div className="w-full">
        <DispatchBoard loads={[]} drivers={drivers} vehicles={[]} />
      </div>
    </div>
  )
}


