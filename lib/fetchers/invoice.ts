import { db } from "@/db"
import { invoices } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getInvoices = cache(async function getInvoices(companyId: string) {
    return db.query.invoices.findMany({ where: (i, { eq }) => eq(i.companyId, companyId) })
})
