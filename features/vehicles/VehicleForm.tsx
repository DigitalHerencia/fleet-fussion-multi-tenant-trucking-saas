"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { vehicleSchema, type VehicleFormData } from "@/lib/validation/vehicle-schema"
import { createVehicleAction } from "@/lib/actions/vehicle-actions"
import { FormError } from "@/components/ui/form-error"

export function VehicleForm() {
    const [state, formAction] = useActionState(createVehicleAction, {
        success: false,
        errors: {}
    })

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema)
    })

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="licensePlate">License Plate</label>
                <input {...register("licensePlate")} type="text" className="input" />
                <FormError message={errors.licensePlate?.message} />
            </div>

            <div>
                <label htmlFor="make">Make</label>
                <input {...register("make")} type="text" className="input" />
            </div>

            <div>
                <label htmlFor="model">Model</label>
                <input {...register("model")} type="text" className="input" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Add Vehicle"}
            </button>
        </form>
    )
}
