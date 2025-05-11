import { db } from "@/db"
import { complianceDocuments } from "@/db/schema"
import { eq, and, ilike, sql } from "drizzle-orm"
import type { ComplianceDocument } from "@/types/types"

/**
 * Fetch compliance documents for a company, with optional search/filter.
 * Flags documents expiring within 30 days or expired.
 * @param {Object} params
 * @param {string} params.companyId - The company ID to fetch documents for.
 * @param {string} [params.search] - Optional search string.
 * @param {string} [params.type] - Optional document type filter.
 * @returns {Promise<ComplianceDocument[]>}
 */
export async function getComplianceDocuments({
    companyId,
    search = "",
    type = ""
}: {
    companyId: string
    search?: string
    type?: string
}): Promise<ComplianceDocument[]> {
    const where = [eq(complianceDocuments.companyId, companyId)]
    if (type) where.push(eq(complianceDocuments.type, type))
    if (search) where.push(ilike(complianceDocuments.name, `%${search}%`))
    const docs = await db
        .select()
        .from(complianceDocuments)
        .where(and(...where))
        .orderBy(sql`${complianceDocuments.updatedAt} DESC`)
    return docs.map(doc => {
        let status = doc.status
        const expirationDate = doc.expirationDate ? doc.expirationDate.toISOString() : undefined
        let expiring = false
        let expired = false
        if (expirationDate) {
            const exp = new Date(expirationDate)
            const now = new Date()
            expired = exp < now
            expiring = !expired && (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 30
            if (expired) status = "Expired"
            else if (expiring) status = "Expiring Soon"
        }
        return {
            id: doc.id,
            name: doc.name,
            type: doc.type,
            lastUpdated: doc.updatedAt?.toISOString() ?? "",
            status,
            assignedTo: doc.driverId ? "Driver" : doc.vehicleId ? "Vehicle" : "Company",
            expirationDate,
            fileUrl: doc.fileUrl || undefined
        }
    })
}
