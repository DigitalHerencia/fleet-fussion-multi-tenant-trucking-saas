import { db } from "@/db"
import { auditLogs } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getAuditLogs = cache(async function getAuditLogs(companyId: string) {
  return db.query.auditLogs.findMany({ where: (l, { eq }) => eq(l.companyId, companyId) })
})
