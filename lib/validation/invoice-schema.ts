import { z } from "zod"

export const invoiceSchema = z.object({
    customerId: z.string().uuid().optional(),
    loadId: z.string().uuid().optional(),
    amount: z.coerce.number().positive("Amount must be positive"),
    status: z.enum(["pending", "paid", "overdue"]).default("pending"),
    issuedDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    paidDate: z.coerce.date().optional(),
    notes: z.string().optional()
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
