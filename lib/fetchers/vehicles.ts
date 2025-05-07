import { db } from "@/lib/db"
import { vehicles } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Retrieves all vehicles for a specific company
 *
 * @param companyId - The ID of the company to fetch vehicles for
 * @returns Array of vehicles with their details
 */
export async function getVehiclesForCompany(companyId: number) {
    try {
        return await db.query.vehicles.findMany({
            where: eq(vehicles.companyId, String(companyId)),
            orderBy: (vehicles, { asc }) => [asc(vehicles.unitNumber)],
            with: {
                maintenanceRecords: {
                    where: (records, { eq }) => eq(records.status, "scheduled"),
                    orderBy: (records, { asc }) => [asc(records.scheduledDate)],
                    limit: 1
                }
            }
        })
    } catch (error) {
        console.error("getVehiclesForCompany error:", error)
        throw new Error("Unable to load vehicles")
    }
}

/**
 * Retrieves vehicles for a company filtered by type (e.g., "tractor" or "trailer")
 *
 * @param companyId - The ID of the company to fetch vehicles for
 * @param type - Type of vehicles to retrieve (e.g., "tractor", "trailer")
 * @returns Array of filtered vehicles
 */
export async function getVehiclesByType(companyId: number, type: string) {
    try {
        return await db.query.vehicles.findMany({
            where: (vehicles, { eq, and }) =>
                and(eq(vehicles.companyId, String(companyId)), eq(vehicles.type, type)),
            orderBy: (vehicles, { asc }) => [asc(vehicles.unitNumber)]
        })
    } catch (error) {
        console.error("getVehiclesByType error:", error)
        throw new Error(`Unable to load ${type} vehicles`)
    }
}

/**
 * Retrieves a single vehicle by ID
 *
 * @param id - The vehicle ID
 * @param companyId - The company ID (for security verification)
 * @returns The vehicle details or null if not found
 */
export async function getVehicleById(id: string, companyId: number) {
    try {
        const vehicle = await db.query.vehicles.findFirst({
            where: (vehicles, { eq, and }) =>
                and(eq(vehicles.id, id), eq(vehicles.companyId, String(companyId))),
            with: {
                maintenanceRecords: {
                    orderBy: (records, { desc }) => [desc(records.createdAt)],
                    limit: 5
                }
            }
        })

        return vehicle
    } catch (error) {
        console.error("getVehicleById error:", error)
        throw new Error("Unable to load vehicle details")
    }
}
