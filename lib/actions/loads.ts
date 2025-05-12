"use server"

import { db } from "@/db"
import { loads } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function getLoadsByCompanyId(companyId: string) {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")
    if (!companyId) throw new Error("Missing company ID")
    
    const companyLoads = await db.query.loads.findMany({
        where: eq(loads.companyId, companyId),
        orderBy: (loads, { desc }) => [desc(loads.createdAt)]
    })
    
    return companyLoads
}
