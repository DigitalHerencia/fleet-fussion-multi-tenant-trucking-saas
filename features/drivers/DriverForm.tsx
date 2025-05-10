"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { driverCoreSchema } from "@/lib/validation/driver-schema"
import { FormError } from "@/components/ui/form-error"
import { isValid } from "zod"
import { z } from "zod"

// Use driverCoreSchema directly
type DriverFormData = z.infer<typeof driverCoreSchema>

export function DriverForm() {
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
    } = useForm<DriverFormData>({
        defaultValues: {
            status: "ACTIVE"
        }
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="firstName">First Name</label>
                <input {...register("firstName")} type="text" className="input" />
                <FormError message={errors.firstName?.message } />
            </div>
            <div>
                <label htmlFor="lastName">Last Name</label>
                <input {...register("lastName")} type="text" className="input" />
                <FormError message={errors.lastName?.message } />
            </div>
            <div>
                <label htmlFor="licenseNumber">License Number</label>
                <input {...register("licenseNumber")} type="text" className="input" />
                <FormError
                    message={errors.licenseNumber?.message }
                />
            </div>
            {/* ...other fields as needed... */}
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Add Driver"}
            </button>
        </form>
    )
}
