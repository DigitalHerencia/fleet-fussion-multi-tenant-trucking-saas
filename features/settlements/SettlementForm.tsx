"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { settlementSchema, type SettlementFormValues } from "../../lib/validation/settlement-schema"
import { createSettlement } from "../../lib/actions/settlement-actions"
import { FormError } from "../../components/ui/form-error"
import { Button } from "../../components/ui/button"

export function SettlementForm() {
    const [state, formAction] = useActionState(
        async (_prev: any, formData: FormData) => {
            return await createSettlement(formData)
        },
        { success: false, error: "", errors: {} }
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<SettlementFormValues>({
        resolver: zodResolver(settlementSchema) as any
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label>Amount</label>
                <input type="number" step="0.01" {...register("amount")} className="input" />
                <FormError message={errors.amount?.message || (!state.success ? state.errors?.amount?.[0] : undefined)} />
            </div>
            <div>
                <label>Status</label>
                <select {...register("status")} className="input">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                </select>
            </div>
            <div>
                <label>Notes</label>
                <textarea {...register("notes")} className="input" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Add Settlement"}
            </Button>
            <FormError message={!state.success ? state.error : undefined} />
        </form>
    )
}
