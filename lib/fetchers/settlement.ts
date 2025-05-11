import { db } from "@/db"
import { cache } from "react"

export const getSettlements = cache(async function getSettlements(companyId: string) {
    return db.query.settlements.findMany({ where: (s, { eq }) => eq(s.companyId, companyId) })
})
