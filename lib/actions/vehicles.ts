"use server"

import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { z } from "zod"
import { getCurrentCompanyId } from "@/lib/auth"
import type { ApiResult } from "@/types/api"

const vehicleSchema = z.object({
    type: z.string().min(1, "Type is required"),
    unitNumber: z.string().min(1, "Unit number is required"),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
    vin: z.string().min(1, "VIN is required"),
    licensePlate: z.string().min(1, "License plate is required"),
    color: z.string().optional(),
    notes: z.string().optional(),
    fuelType: z.string().optional()
})

type VehicleForm = z.infer<typeof vehicleSchema>

export async function addVehicle(formData: FormData): Promise<ApiResult<any>> {
    try {
        const parsed = vehicleSchema.safeParse(Object.fromEntries(formData))
        if (!parsed.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: parsed.error.flatten().fieldErrors
            }
        }
        const data = parsed.data as VehicleForm
        const companyId = await getCurrentCompanyId()
        const result = await db
            .insert(vehicles)
            .values({ ...data, companyId })
            .returning()
        const vehicle = Array.isArray(result) ? result[0] : result
        return { success: true, data: vehicle }
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
