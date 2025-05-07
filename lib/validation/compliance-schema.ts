import { z } from "zod"

export const complianceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    dueDate: z.string().min(1, "Due date is required")
})

export type ComplianceFormData = z.infer<typeof complianceSchema>
