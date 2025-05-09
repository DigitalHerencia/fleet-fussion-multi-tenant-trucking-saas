import { z } from "zod"

export const fuelPurchaseSchema = z.object({
    vehicleId: z.string().min(1, "Vehicle is required"),
    driverId: z.string().optional(),
    date: z.coerce.date({ required_error: "Date is required" }),
    location: z.string().min(1, "Location is required"),
    jurisdiction: z.string().min(1, "Jurisdiction is required"),
    gallons: z.coerce.number().positive("Gallons must be greater than 0"),
    pricePerGallon: z.coerce.number().positive("Price per gallon must be greater than 0"),
    totalAmount: z.coerce.number().positive("Total amount must be greater than 0"),
    notes: z.string().optional()
})

export type FuelPurchaseFormData = z.infer<typeof fuelPurchaseSchema>
