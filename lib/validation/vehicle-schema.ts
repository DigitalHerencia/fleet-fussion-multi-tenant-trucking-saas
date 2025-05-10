import { z } from "zod"

export const vehicleSchema = z.object({
    unitNumber: z.string().min(1, "Unit number is required"),
    type: z.enum(["tractor", "trailer"], { message: "Type must be tractor or trailer" }),
    status: z.enum(["active", "inactive", "maintenance"], { message: "Status is required" }),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    vin: z.string().optional(),
    licensePlate: z.string().min(1, "License plate is required"),
    state: z.string().length(2, "State must be 2 characters").optional()
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
