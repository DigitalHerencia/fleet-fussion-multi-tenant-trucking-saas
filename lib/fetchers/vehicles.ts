import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

/**
 * Retrieves all vehicles for a specific company with pagination, filtering, and sorting
 */
export const getVehiclesForCompany = cache(async function getVehiclesForCompany(
  companyId: number,
  options?: {
    limit?: number;
    offset?: number;
    status?: string;
    type?: string;
    sortBy?: keyof typeof vehicles;
    sortOrder?: "asc" | "desc";
  }
) {
  try {
    const whereConds = [eq(vehicles.companyId, String(companyId))];
    if (options?.status) whereConds.push(eq(vehicles.status, options.status));
    // Return the result of the query
    return await db.query.vehicles.findMany({
      where: (vehicles, { and }) => and(...whereConds),
    });
  } catch (error) {
    console.error("getVehiclesForCompany error:", error);
    throw new Error("Unable to load vehicles");
  }
});

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
