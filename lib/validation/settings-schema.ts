import { z } from "zod"

export const settingsSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    dotNumber: z.string().optional(),
    address: z.string().optional()
})

export type SettingsFormData = z.infer<typeof settingsSchema>
