"use server"

import { db } from "@/lib/db"
import { companies, companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { type SettingsFormData } from "@/lib/validation/settings-schema"

export async function getCompanyDetails(companyId: string) {
    try {
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, companyId)
        })

        if (!company) throw new Error("Company not found")
        return company
    } catch (error) {
        console.error("getCompanyDetails error:", error)
        throw new Error("Unable to load company details")
    }
}

export async function getCompanyUsers(companyId: string) {
    try {
        return await db.query.companyUsers.findMany({
            where: eq(companyUsers.companyId, companyId),
            orderBy: (user, { desc }) => [desc(user.createdAt)]
        })
    } catch (error) {
        console.error("getCompanyUsers error:", error)
        throw new Error("Unable to load company users")
    }
}

export async function getCompanyPreferences(companyId: string) {
    try {
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, companyId)
        })

        if (!company) throw new Error("Company not found")
        return company
    } catch (error) {
        console.error("getCompanyPreferences error:", error)
        throw new Error("Unable to load company preferences")
    }
}

export async function getUserSettings(userId: string, companyId: string) {
    try {
        const user = await db.query.companyUsers.findFirst({
            where: and(eq(companyUsers.userId, userId), eq(companyUsers.companyId, companyId))
        })

        if (!user) throw new Error("User not found")
        return user
    } catch (error) {
        console.error("getUserSettings error:", error)
        throw new Error("Unable to load user settings")
    }
}

export async function getCompanySettings(companyId: number): Promise<SettingsFormData> {
    try {
        const company = await db.query.companies.findFirst({
            where: eq(companies.id, String(companyId))
        })

        if (!company) {
            throw new Error("Company not found")
        }

        return {
            companyName: company.name || "",
            dotNumber: company.dotNumber || "",
            address: company.address || ""
        }
    } catch (error) {
        console.error("Error fetching company settings:", error)
        return {
            companyName: "",
            dotNumber: "",
            address: ""
        }
    }
}
