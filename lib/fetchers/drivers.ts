import { db } from "@/db"
import { drivers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

/**
 * Retrieves all drivers for a specific company with pagination, filtering, and sorting
 */
export const getDriversForCompany = cache(async function getDriversForCompany(
    companyId: number,
    options?: {
        limit?: number
        offset?: number
        status?: string
        sortBy?: keyof typeof drivers
        sortOrder?: "asc" | "desc"
    }
) {
    try {
        const whereConds = [eq(drivers.companyId, String(companyId))]
        if (options?.status) whereConds.push(eq(drivers.status, options.status))
        interface GetDriversForCompanyOptions {
            limit?: number
            offset?: number
            status?: string
            sortBy?: keyof typeof drivers
            sortOrder?: "asc" | "desc"
        }

        return await db.query.drivers.findMany({
            where: (drivers, { and }) => and(...whereConds)
        })
    } catch (error) {
        console.error("getDriversForCompany error:", error)
        throw new Error("Unable to load drivers")
    }
})
