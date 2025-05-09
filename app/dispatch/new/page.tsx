import { getDriversForCompany } from "@/lib/fetchers/drivers"
import { getVehiclesForCompany } from "@/lib/fetchers/vehicles"
import LoadForm from "@/features/dispatch/LoadForm"

export default async function NewLoadPage() {
    const companyId = Number(process.env.TEST_COMPANY_ID)
    const driversRaw = await getDriversForCompany(companyId)
    const vehicles = await getVehiclesForCompany(companyId)

    // Map drivers to expected shape: { id: number; name: string }
    const drivers = driversRaw.map((driver: any) => ({
        id: Number(driver.id),
        name: `${driver.firstName} ${driver.lastName}`.trim()
    }))

    // Map vehicles to expected shape: { id: number; licensePlate: string }
    const vehiclesMapped = (vehicles ?? []).map((vehicle: any) => ({
        id: Number(vehicle.id),
        licensePlate: vehicle.licensePlate
    }))

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Create New Load</h1>
            <LoadForm drivers={drivers} vehicles={vehiclesMapped} />
        </div>
    )
}
