"use server"

import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { vehicleSchema, type VehicleFormData } from "@/lib/validation/vehicle-schema"
import { getAuthCompanyId } from "@/lib/auth"
import { z } from "zod"

export async function addVehicle(formData: FormData) {
    try {
        // Parse and validate form data
        const raw = Object.fromEntries(formData.entries())
        const parsed = vehicleSchema.safeParse(raw)
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            }
        }
        const data = parsed.data as VehicleFormData

        // Get company context
        const companyId = await getAuthCompanyId()
        if (!companyId) {
            return {
                success: false,
                error: "Not authenticated or no company selected.",
                errors: { company: ["Not authenticated or no company selected."] }
            }
        }

        // Insert vehicle
        await db.insert(vehicles).values({
            companyId,
            unitNumber: data.unitNumber,
            type: data.type,
            status: data.status,
            make: data.make,
            model: data.model,
            year: data.year,
            vin: data.vin,
            licensePlate: data.licensePlate,
            state: data.state
        })

        return { success: true }
    } catch (err) {
        console.error("[VehicleActions] Error adding vehicle:", err)
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred. Please try again.",
            errors: { _form: ["An unexpected error occurred. Please try again."] }
        }
    }
}
