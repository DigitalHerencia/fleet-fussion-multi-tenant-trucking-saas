"use server"

import { db } from "@/lib/db"
import { complianceDocuments, hosLogs, complianceRecords } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { complianceSchema } from "@/lib/validation/compliance-schema"

// Zod schema for server-side validation
const hosLogSchema = z.object({
    driverId: z.string().uuid(),
    date: z.string().min(1),
    status: z.string().min(1),
    hoursLogged: z.coerce.number().min(0).max(24),
    notes: z.string().optional()
})

type HosLogForm = z.infer<typeof hosLogSchema>

const complianceDocSchema = z.object({
    documentType: z.string().min(1),
    expiryDate: z.string().optional(),
    status: z.string().min(1),
    documentUrl: z.string().optional()
})

type ComplianceDocForm = z.infer<typeof complianceDocSchema>

// Replace with your session-based lookup
async function getCompanyId(): Promise<string> {
    return process.env.TEST_COMPANY_ID || ""
}

export async function createHosLog(formData: FormData) {
    const result = hosLogSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors }
    }
    const data = result.data as HosLogForm
    const companyId = await getCompanyId()
    try {
        const [inserted] = await db
            .insert(hosLogs)
            .values({
                ...data,
                companyId,
                date: new Date(data.date),
                logType: data.status, // Map status to logType
                startTime: new Date() // Required field, set default
            })
            .returning()
        return { success: true, log: inserted }
    } catch (error) {
        console.error("createHosLog error:", error)
        return { success: false, errors: { form: ["Failed to create HOS log"] } }
    }
}

export async function updateHosLog(id: string, formData: FormData) {
    const result = hosLogSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors }
    }
    const data = result.data as HosLogForm
    const companyId = await getCompanyId()
    try {
        await db
            .update(hosLogs)
            .set({
                date: new Date(data.date),
                logType: data.status,
                notes: data.notes,
                driverId: data.driverId
            })
            .where(and(eq(hosLogs.id, id), eq(hosLogs.companyId, companyId)))
        return { success: true }
    } catch (error) {
        console.error("updateHosLog error:", error)
        return { success: false, errors: { form: ["Failed to update HOS log"] } }
    }
}

export async function deleteHosLog(id: string) {
    const companyId = await getCompanyId()
    try {
        const result = await db
            .delete(hosLogs)
            .where(and(eq(hosLogs.id, id), eq(hosLogs.companyId, companyId)))
        if (!result) throw new Error()
        return { success: true }
    } catch (error) {
        console.error("deleteHosLog error:", error)
        return { success: false, errors: { form: ["Failed to delete HOS log"] } }
    }
}

export async function createComplianceDocument(formData: FormData) {
    const result = complianceDocSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors }
    }
    const data = result.data as ComplianceDocForm
    const companyId = await getCompanyId()
    try {
        const [inserted] = await db
            .insert(complianceDocuments)
            .values({
                type: data.documentType,
                expirationDate: data.expiryDate ? new Date(data.expiryDate) : null,
                status: data.status,
                fileUrl: data.documentUrl || "",
                name: data.documentType, // Required field
                companyId
            })
            .returning()
        return { success: true, document: inserted }
    } catch (error) {
        console.error("createComplianceDocument error:", error)
        return { success: false, errors: { form: ["Failed to create compliance document"] } }
    }
}

export async function updateComplianceDocument(id: string, formData: FormData) {
    const result = complianceDocSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors }
    }
    const data = result.data as ComplianceDocForm
    const companyId = await getCompanyId()
    try {
        await db
            .update(complianceDocuments)
            .set({
                type: data.documentType,
                expirationDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                status: data.status,
                fileUrl: data.documentUrl || undefined
            })
            .where(
                and(eq(complianceDocuments.id, id), eq(complianceDocuments.companyId, companyId))
            )
        return { success: true }
    } catch (error) {
        console.error("updateComplianceDocument error:", error)
        return { success: false, errors: { form: ["Failed to update compliance document"] } }
    }
}

export async function deleteComplianceDocument(id: string) {
    const companyId = await getCompanyId()
    try {
        const result = await db
            .delete(complianceDocuments)
            .where(
                and(eq(complianceDocuments.id, id), eq(complianceDocuments.companyId, companyId))
            )
        if (!result) throw new Error()
        return { success: true }
    } catch (error) {
        console.error("deleteComplianceDocument error:", error)
        return { success: false, errors: { form: ["Failed to delete compliance document"] } }
    }
}

export async function createComplianceAction(_: any, formData: FormData) {
    const result = complianceSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors
        }
    }

    const data = result.data
    const companyId = await getCompanyId()

    try {
        await db.insert(complianceRecords).values({
            title: data.title,
            description: data.description,
            dueDate: new Date(data.dueDate),
            companyId
        })
        return { success: true }
    } catch (error) {
        console.error("createComplianceAction error:", error)
        return {
            success: false,
            errors: { form: ["Failed to create compliance record"] }
        }
    }
}
