import { z } from "zod"

export const vehicleSchema = z.object({
    licensePlate: z.string().min(1, "License plate is required"),
    make: z.string().optional(),
    model: z.string().optional()
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
