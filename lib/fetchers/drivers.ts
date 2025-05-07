import { db } from "@/lib/db"
import { drivers } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Retrieves all drivers for a specific company
 *
 * @param companyId - The ID of the company to fetch drivers for
 * @returns Array of drivers with their details
 */
export async function getDriversForCompany(companyId: number) {
    try {
        return await db.query.drivers.findMany({
            where: eq(drivers.companyId, String(companyId)),
            orderBy: (drivers, { asc }) => [asc(drivers.lastName), asc(drivers.firstName)]
        })
    } catch (error) {
        console.error("getDriversForCompany error:", error)
        throw new Error("Unable to load drivers")
    }
}

/**
 * Retrieves active drivers for a specific company
 *
 * @param companyId - The ID of the company to fetch drivers for
 * @returns Array of active drivers
 */
export async function getActiveDriversForCompany(companyId: number) {
    try {
        return await db.query.drivers.findMany({
            where: (drivers, { eq, and }) =>
                and(eq(drivers.companyId, String(companyId)), eq(drivers.status, "active")),
            orderBy: (drivers, { asc }) => [asc(drivers.lastName), asc(drivers.firstName)]
        })
    } catch (error) {
        console.error("getActiveDriversForCompany error:", error)
        throw new Error("Unable to load active drivers")
    }
}

/**
 * Retrieves a single driver by ID
 *
 * @param id - The driver ID
 * @param companyId - The company ID (for security verification)
 * @returns The driver details or null if not found
 */
export async function getDriverById(id: string, companyId: number) {
    try {
        const driver = await db.query.drivers.findFirst({
            where: (drivers, { eq, and }) =>
                and(eq(drivers.id, id), eq(drivers.companyId, String(companyId)))
        })

        return driver
    } catch (error) {
        console.error("getDriverById error:", error)
        throw new Error("Unable to load driver details")
    }
}
