import { db } from "@/lib/db"
import { complianceDocuments, hosLogs } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getComplianceDocumentsForCompany(companyId: number) {
    try {
        return await db.query.complianceDocuments.findMany({
            where: eq(complianceDocuments.companyId, String(companyId)),
        })
    } catch (error) {
        console.error("getComplianceDocumentsForCompany error:", error)
        throw new Error("Unable to load compliance documents")
    }
}

export async function getHosLogsForCompany(companyId: number) {
    try {
        return await db.query.hosLogs.findMany({
            where: eq(hosLogs.companyId, String(companyId)),
        })
    } catch (error) {
        console.error("getHosLogsForCompany error:", error)
        throw new Error("Unable to load HOS logs")
    }
}

export async function getHosLogById(id: number, companyId: number) {
    try {
        const log = await db.query.hosLogs.findFirst({
            where: eq
        })
        if (!log) throw new Error("HOS log not found")
        return log
    } catch (error) {
        console.error("getHosLogById error:", error)
        throw new Error("Unable to load that HOS log")
    }
}
