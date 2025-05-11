import { db } from "@/db"
import { cache } from "react"

export const getCustomers = cache(async function getCustomers(companyId: string) {
    return db.query.customers.findMany({ where: (c, { eq }) => eq(c.companyId, companyId) })
})
