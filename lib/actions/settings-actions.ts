"use server"

import { db } from "@/db"
import { companies, companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { settingsSchema } from "@/lib/validation/settings-schema"

// Zod schema for server-side validation
const companySchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    dotNumber: z.string().optional(),
    mcNumber: z.string().optional()
})

type CompanyForm = z.infer<typeof companySchema>

const userSchema = z.object({
    userId: z.string().min(1),
    role: z.string().min(1)
})

type UserForm = z.infer<typeof userSchema>

const preferencesSchema = z.object({
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    distanceUnit: z.string().optional(),
    currency: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional()
})

type PreferencesForm = z.infer<typeof preferencesSchema>

async function getCompanyId(): Promise<string> {
    return process.env.TEST_COMPANY_ID || ""
}

export async function updateCompanyDetails(formData: FormData) {
    try {
        const result = companySchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const data = result.data as CompanyForm
        const companyId = await getCompanyId()
        await db.update(companies).set(data).where(eq(companies.id, companyId))
        return { success: true }
    } catch (error) {
        console.error("[SettingsActions] updateCompanyDetails error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update company details",
            errors: { form: ["Failed to update company details"] }
        }
    }
}

export async function updateCompanyPreferences(formData: FormData) {
    try {
        const result = preferencesSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const data = result.data as PreferencesForm
        const companyId = await getCompanyId()
        await db
            .update(companies)
            .set({
                primaryColor: data.currency || "#0f766e"
            })
            .where(eq(companies.id, companyId))
        return { success: true }
    } catch (error) {
        console.error("[SettingsActions] updateCompanyPreferences error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update company preferences",
            errors: { form: ["Failed to update company preferences"] }
        }
    }
}

export async function createUser(formData: FormData) {
    try {
        const result = userSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const data = result.data as UserForm
        const companyId = await getCompanyId()
        const [inserted] = await db
            .insert(companyUsers)
            .values({
                userId: data.userId,
                companyId,
                role: data.role
            })
            .returning()
        return { success: true, user: inserted }
    } catch (error) {
        console.error("[SettingsActions] createUser error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create user",
            errors: { form: ["Failed to create user"] }
        }
    }
}

export async function updateUser(id: string, formData: FormData) {
    try {
        const result = userSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const data = result.data as UserForm
        const companyId = await getCompanyId()
        await db
            .update(companyUsers)
            .set({ role: data.role })
            .where(and(eq(companyUsers.id, id), eq(companyUsers.companyId, companyId)))
        return { success: true }
    } catch (error) {
        console.error("[SettingsActions] updateUser error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update user",
            errors: { form: ["Failed to update user"] }
        }
    }
}

export async function deleteUser(id: string) {
    try {
        const companyId = await getCompanyId()
        await db
            .delete(companyUsers)
            .where(and(eq(companyUsers.id, id), eq(companyUsers.companyId, companyId)))
        return { success: true }
    } catch (error) {
        console.error("[SettingsActions] deleteUser error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete user",
            errors: { form: ["Failed to delete user"] }
        }
    }
}

// Since we don't have user preferences in our schema, this would need a separate table or field
// For now, we'll implement a placeholder that returns success
export async function updateUserPreferences(userId: string, formData: FormData) {
    try {
        const result = preferencesSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        // In a real implementation, we would store these preferences in a proper field or table
        return { success: true }
    } catch (error) {
        console.error("[SettingsActions] updateUserPreferences error:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update user preferences",
            errors: { form: ["Failed to update user preferences"] }
        }
    }
}

export async function updateSettingsAction(_: any, formData: FormData) {
    try {
        const result = settingsSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const companyId = process.env.TEST_COMPANY_ID ?? "" // Replace with session
        await db.update(companies).set(result.data).where(eq(companies.id, companyId))
        return { success: true }
    } catch (err) {
        console.error("[SettingsActions] updateSettingsAction error:", err)
        return {
            success: false,
            error: err instanceof Error ? err.message : "Failed to update settings",
            errors: { form: ["Failed to update settings"] }
        }
    }
}
