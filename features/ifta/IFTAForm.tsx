"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { iftaSchema, type IFTAFormData } from "@/lib/validation/ifta-schema"
import { createIFTAAction } from "@/lib/actions/ifta-actions"
import { FormError } from "@/components/ui/form-error"

export function IFTAForm() {
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
    } = useForm<IFTAFormData>({ resolver: zodResolver(iftaSchema) })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label>Quarter</label>
                <select {...register("quarter")} className="input">
                    <option value="">Select Quarter</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                </select>
                <FormError message={errors.quarter?.message} />
            </div>

            <div>
                <label>Year</label>
                <input type="number" {...register("year")} className="input" />
                <FormError message={errors.year?.message} />
            </div>

            <div>
                <label>Total Miles</label>
                <input type="number" {...register("totalMiles")} className="input" />
                <FormError message={errors.totalMiles?.message} />
            </div>

            <div>
                <label>Total Gallons</label>
                <input type="number" {...register("totalGallons")} className="input" />
                <FormError message={errors.totalGallons?.message} />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit IFTA"}
            </button>
        </form>
    )
}
