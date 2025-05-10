"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validation/invoice-schema"
import { createInvoice } from "@/lib/actions/invoice-actions"
import { FormError } from "@/components/ui/form-error"

export function InvoiceForm() {
    const [state, formAction] = useActionState(
        async (_prev: any, formData: FormData) => {
            return await createInvoice(formData)
        },
        { success: false, error: "", errors: {} }
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label>Amount</label>
                <input type="number" step="0.01" {...register("amount")} className="input" />
                <FormError message={errors.amount?.message || state.errors?.amount?.[0]} />
            </div>
            <div>
                <label>Status</label>
                <select {...register("status")} className="input">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>
            <div>
                <label>Notes</label>
                <textarea {...register("notes")} className="input" />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Add Invoice"}
            </button>
            <FormError message={state.error} />
        </form>
    )
}
