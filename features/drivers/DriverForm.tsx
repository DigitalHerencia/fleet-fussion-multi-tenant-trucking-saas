"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { driverSchema, type DriverFormData } from "@/lib/validation/driver-schema"
import { createDriverAction } from "@/lib/actions/driver-actions"
import { FormError } from "@/components/ui/form-error"

export function DriverForm() {
    const [state, formAction] = useActionState(createDriverAction, {
        success: false,
        errors: {}
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<DriverFormData>({
        resolver: zodResolver(driverSchema)
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="name">Driver Name</label>
                <input {...register("name")} type="text" className="input" />
                <FormError message={errors.name?.message || state.errors?.name?.[0]} />
            </div>

            <div>
                <label htmlFor="licenseNumber">License Number</label>
                <input {...register("licenseNumber")} type="text" className="input" />
                <FormError
                    message={errors.licenseNumber?.message || state.errors?.licenseNumber?.[0]}
                />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Add Driver"}
            </button>
        </form>
    )
}
