"use server"

import { db } from "@/lib/db"
import { drivers } from "@/db/schema"
import { driverSchema } from "@/lib/validation/driver-schema"
import { eq } from "drizzle-orm"
import { getCurrentCompanyId } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createDriverAction(_: any, formData: FormData) {
    try {
        const result = driverSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: result.error.flatten().fieldErrors
            }
        }
        const data = result.data
        // Get current company ID from auth context
        const companyId = await getCurrentCompanyId()
        // Split name into firstName and lastName (basic split, adjust as needed)
        const [firstName, ...lastNameParts] = data.name.trim().split(" ")
        const lastName = lastNameParts.join(" ")
        // Ensure firstName and lastName are not empty or undefined
        if (!firstName || !lastName) {
            return {
                success: false,
                error: "Please provide both first and last name.",
                errors: { name: ["Please provide both first and last name."] }
            }
        }
        // Insert the new driver into the database
        const newDriver = await db
            .insert(drivers)
            .values({
                firstName,
                lastName,
                licenseNumber: data.licenseNumber,
                companyId: String(companyId),
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
                ...(data.notes && { notes: data.notes })
            })
            .returning()
        revalidatePath("/drivers")
        return {
            success: true,
            data: newDriver[0]
        }
    } catch (error) {
        console.error("[DriverActions] Error creating driver:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create driver",
            errors: undefined
        }
    }
}
