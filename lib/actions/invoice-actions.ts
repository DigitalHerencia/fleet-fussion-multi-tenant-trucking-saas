"use server"

import { db } from "@/db"
import { invoices } from "@/db/schema"
import { invoiceSchema } from "@/lib/validation/invoice-schema"
import { getCurrentCompanyId } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function createInvoice(formData: FormData) {
    const companyId = await getCurrentCompanyId()
    const parsed = invoiceSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    // Convert amount to string and ensure date fields are Date objects
    const invoiceToInsert = {
        ...parsed.data,
        amount: parsed.data.amount.toString(),
        issuedDate: parsed.data.issuedDate ? new Date(parsed.data.issuedDate) : undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : undefined,
        companyId
    }
    const [invoice] = await db.insert(invoices).values(invoiceToInsert).returning()
    return { success: true, invoice }
}

export async function updateInvoice(id: string, formData: FormData) {
    const parsed = invoiceSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) {
        return {
            success: false,
            error: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        }
    }
    // Convert amount to string and ensure date fields are Date objects
    const invoiceToUpdate = {
        ...parsed.data,
        amount: parsed.data.amount.toString(),
        issuedDate: parsed.data.issuedDate ? new Date(parsed.data.issuedDate) : undefined,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
        paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : undefined
    }
    const [invoice] = await db
        .update(invoices)
        .set(invoiceToUpdate)
        .where(eq(invoices.id, id))
        .returning()
    return { success: true, invoice }
}

export async function deleteInvoice(id: string) {
    await db.delete(invoices).where(eq(invoices.id, id))
    return { success: true }
}

export async function getInvoices() {
    const companyId = await getCurrentCompanyId()
    return db.query.invoices.findMany({ where: (i, { eq }) => eq(i.companyId, companyId) })
}
