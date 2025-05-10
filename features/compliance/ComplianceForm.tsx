"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { complianceSchema } from "@/lib/validation/compliance-schema"
import type { ComplianceFormData } from "@/lib/validation/compliance-schema"
import { createComplianceAction } from "@/lib/actions/compliance-actions"
import { FormError } from "@/components/ui/form-error"

type FormErrors = {
    title?: string[]
    description?: string[]
    dueDate?: string[]
    form?: string[]
}

export function ComplianceForm() {
    const [state, formAction] = useActionState(
        async (_prevState: any, _formData: any) => {
            return { success: false, error: "Validation failed", errors }
        },
        { success: false, error: "", errors: {} }
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ComplianceFormData>({
        resolver: zodResolver(complianceSchema)
    })

    const formErrors = (errors as FormErrors) || {}

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="title">Title</label>
                <input {...register("title")} type="text" className="input" />
                <FormError message={errors.title?.message || formErrors.title?.[0]} />
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea {...register("description")} className="input" />
                <FormError message={errors.description?.message || formErrors.description?.[0]} />
            </div>

            <div>
                <label htmlFor="dueDate">Due Date</label>
                <input {...register("dueDate")} type="date" className="input" />
                <FormError message={errors.dueDate?.message || formErrors.dueDate?.[0]} />
            </div>

            {formErrors.form && <FormError message={formErrors.form[0]} />}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Add Record"}
            </button>
        </form>
    )
}
