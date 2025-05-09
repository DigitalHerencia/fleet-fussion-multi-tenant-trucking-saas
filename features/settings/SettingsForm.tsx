"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { settingsSchema, type SettingsFormData } from "@/lib/validation/settings-schema"
import { updateSettingsAction } from "@/lib/actions/settings-actions"
import { FormError } from "@/components/ui/form-error"
import { isValid } from "zod"

export function SettingsForm({ defaultValues }: { defaultValues: SettingsFormData }) {
    const [state, formAction] = useActionState(
        async (_prevState: any, _formData: any) => {
            // ...existing code...
            if (!isValid) {
                return { success: false, error: 'Validation failed', errors };
            }
            // ...existing code...
        },
        { success: false, error: '', errors: {} }
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label>Company Name</label>
                <input {...register("companyName")} className="input" />
                <FormError message={errors.companyName?.message} />
            </div>

            <div>
                <label>DOT Number</label>
                <input {...register("dotNumber")} className="input" />
            </div>

            <div>
                <label>Address</label>
                <input {...register("address")} className="input" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Saving..." : "Save Settings"}
            </button>
        </form>
    )
}
