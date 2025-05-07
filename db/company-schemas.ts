import { z } from "zod"

// Company creation schema
export const createCompanySchema = z.object({
    name: z.string().min(1, "Company name is required"),
    dotNumber: z.string().optional(),
    mcNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    logoUrl: z.string().optional().nullable(),
    primaryColor: z.string().default("#0f766e")
})

export type CreateCompanyFormValues = z.infer<typeof createCompanySchema>
