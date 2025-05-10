"use server"

import { db } from "@/db"
import { customers } from "@/db/schema"
import { customerCoreSchema } from "@/lib/validation/customer-schema"
import { getCurrentCompanyId } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function createCustomer(formData: FormData) {
    const companyId = await getCurrentCompanyId()
    const parsed = customerCoreSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    const [customer] = await db
        .insert(customers)
        .values({ ...parsed.data, companyId })
        .returning()
    return { success: true, customer }
}

export async function updateCustomer(id: string, formData: FormData) {
    const companyId = await getCurrentCompanyId()
    const parsed = customerCoreSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    const [customer] = await db
        .update(customers)
        .set(parsed.data)
        .where(eq(customers.id, id))
        .returning()
    return { success: true, customer }
}

export async function deleteCustomer(id: string) {
    const companyId = await getCurrentCompanyId()
    await db.delete(customers).where(eq(customers.id, id))
    return { success: true }
}

export async function getCustomers() {
    const companyId = await getCurrentCompanyId()
    return db.query.customers.findMany({ where: (c, { eq }) => eq(c.companyId, companyId) })
}
