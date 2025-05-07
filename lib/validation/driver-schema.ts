import { z } from "zod"

export const driverSchema = z.object({
    name: z.string().min(1, "Name is required"),
    licenseNumber: z.string().min(3, "License number is required"),
    notes: z.string().optional()
})

export type DriverFormData = z.infer<typeof driverSchema>
