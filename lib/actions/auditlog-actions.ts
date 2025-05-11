"use server"

import { db } from "@/db"
import { auditLogs } from "@/db/schema"
import { auditLogSchema, type AuditLogFormValues } from "@/lib/validation/auditlog-schema"
import { getCurrentCompanyId } from "@/lib/auth"

export async function createAuditLog(data: AuditLogFormValues) {
    const companyId = await getCurrentCompanyId()
    const parsed = auditLogSchema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    const [log] = await db
        .insert(auditLogs)
        .values({ ...parsed.data, companyId })
        .returning()
    return { success: true, log }
}

export async function getAuditLogs() {
    const companyId = await getCurrentCompanyId()
    return db.query.auditLogs.findMany({ where: (l, { eq }) => eq(l.companyId, companyId) })
}
