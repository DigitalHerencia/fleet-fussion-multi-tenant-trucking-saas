import { Suspense } from "react"
import { DispatchBoard } from "@/components/dispatch/dispatch-board"
import { DispatchSkeleton } from "@/components/dispatch/dispatch-skeleton"
import { getLoads, getDrivers, getVehicles } from "@/lib/fetchers/fetchers"
import { auth } from "@clerk/nextjs/server"
import { DatabaseQueries } from "@/lib/database"


async function DispatchData() {
	const { userId, orgId } = await auth()
	
	if (!userId || !orgId) {
		return <div className="p-4 text-gray-600">Please sign in to access dispatch.</div>
	}

	// Get user to verify organization access
	const user = await DatabaseQueries.getUserByClerkId(userId)
	if (!user) {
		return <div className="p-4 text-gray-600">User not found. Please complete setup.</div>
	}

	// Fetch all required data in parallel
	const [loadsRaw, driversRaw, vehiclesRaw] = await Promise.all([
		getLoads(user.organizationId),
		getDrivers(user.organizationId),
		getVehicles(user.organizationId)
	])

	// Ensure all required Load properties are present
	const loads = loadsRaw.map((load: any) => ({
		id: load.id ?? "",
		status: load.status ?? "pending",
		originCity: load.originCity ?? "",
		originState: load.originState ?? "",
		destinationCity: load.destinationCity ?? "",
		destinationState: load.destinationState ?? "",
		...load,
	}))

	// Ensure all required Driver properties are present
	const drivers = driversRaw.map((driver: any) => ({
		id: driver.id ?? "",
		firstName: driver.firstName ?? "",
		lastName: driver.lastName ?? "",
		status: driver.status ?? "inactive",
		email: driver.email ?? "",
		phone: driver.phone ?? "",
		...driver,
	}))

	// Ensure all required Vehicle properties are present
	const vehicles = vehiclesRaw.map((vehicle: any) => ({
		id: vehicle.id ?? "",
		unitNumber: vehicle.unitNumber ?? "",
		status: vehicle.status ?? "inactive",
		type: vehicle.type ?? "",
		make: vehicle.make ?? "",
		model: vehicle.model ?? "",
		...vehicle,
	}))

	return <DispatchBoard loads={loads} drivers={drivers} vehicles={vehicles} />
}

export default function DispatchPage() {
	return (
		<div className="w-full max-w-7xl mx-auto flex flex-col gap-8 mt-10 dispatch-page">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
				<div>
					<h1 className="page-title">Dispatch Board</h1>
					<p className="page-subtitle">Manage and track your loads</p>
				</div>
			</div>
			<Suspense fallback={<DispatchSkeleton />}>
				<DispatchData />
			</Suspense>
		</div>
	)
}


