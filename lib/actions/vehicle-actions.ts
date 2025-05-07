"use server"

import { db } from "@/lib/db"
import { vehicles } from "@/db/schema"
import { vehicleSchema } from "@/lib/validation/vehicle-schema"

export async function createVehicleAction(_: any, formData: FormData) {
    const result = vehicleSchema.safeParse(Object.fromEntries(formData))
    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors
        }
    }

    // Use the correct type for insert values, e.g. typeof vehicles.$inferInsert
    const data = result.data as typeof vehicles.$inferInsert
    // Ensure required fields are present
    if (!data.type || !data.companyId || !data.unitNumber) {
        return {
            success: false,
            errors: {
                ...(!data.type ? { type: ["Type is required."] } : {}),
                ...(!data.companyId ? { companyId: ["Company is required."] } : {}),
                ...(!data.unitNumber ? { unitNumber: ["Unit number is required."] } : {})
            }
        }
    }

    try {
        await db.insert(vehicles).values({ ...data, companyId: data.companyId })
        return { success: true }
    } catch (error) {
        console.error("createVehicleAction error:", error)
        return {
            success: false,
            errors: { form: ["Failed to create vehicle"] }
        }
    }
}
