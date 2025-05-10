import { db } from "@/db"
import { customers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cache } from "react"

export const getCustomers = cache(async function getCustomers(companyId: string) {
  return db.query.customers.findMany({ where: (c, { eq }) => eq(c.companyId, companyId) })
})
