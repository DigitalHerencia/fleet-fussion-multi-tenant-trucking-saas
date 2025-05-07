import { z } from "zod"

export const iftaSchema = z.object({
    quarter: z.string().min(1, "Quarter is required"),
    year: z.coerce.number().min(2000, "Year is required"),
    totalMiles: z.coerce.number().nonnegative("Miles must be 0 or more"),
    totalGallons: z.coerce.number().nonnegative("Gallons must be 0 or more")
})

export type IFTAFormData = z.infer<typeof iftaSchema>
