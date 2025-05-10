"use server"

import { db } from "@/db"
import { insurancePolicies } from "@/db/schema"
import {
    insurancePolicySchema,
    type InsurancePolicyFormValues
} from "@/lib/validation/insurance-schema"
import { getCurrentCompanyId } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function createInsurancePolicy(formData: FormData) {
    const companyId = await getCurrentCompanyId()
    const parsed = insurancePolicySchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    // Convert Date objects to ISO strings if present
    const data = {
        ...parsed.data,
        companyId,
        startDate: parsed.data.startDate ? parsed.data.startDate.toISOString() : undefined,
        endDate: parsed.data.endDate ? parsed.data.endDate.toISOString() : undefined,
        premium:
            parsed.data.premium !== undefined && parsed.data.premium !== null
                ? String(parsed.data.premium)
                : undefined
    }
    const [policy] = await db.insert(insurancePolicies).values(data).returning()
    return { success: true, policy }
}

export async function updateInsurancePolicy(id: string, formData: FormData) {
    const companyId = await getCurrentCompanyId()
    const parsed = insurancePolicySchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    // Convert premium to string and date fields to ISO strings if present
    const insuranceToUpdate = {
        ...parsed.data,
        premium: parsed.data.premium !== undefined ? parsed.data.premium.toString() : undefined,
        startDate: parsed.data.startDate
            ? new Date(parsed.data.startDate).toISOString()
            : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate).toISOString() : undefined
    }
    const [policy] = await db
        .update(insurancePolicies)
        .set(insuranceToUpdate)
        .where(eq(insurancePolicies.id, id))
        .returning()
    return { success: true, policy }
}

export async function deleteInsurancePolicy(id: string) {
    const companyId = await getCurrentCompanyId()
    await db.delete(insurancePolicies).where(eq(insurancePolicies.id, id))
    return { success: true }
}

export async function getInsurancePolicies() {
    const companyId = await getCurrentCompanyId()
    return db.query.insurancePolicies.findMany({ where: (p, { eq }) => eq(p.companyId, companyId) })
}
