"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useActionState } from "react"
import { vehicleSchema, type VehicleFormData } from "@/lib/validation/vehicle-schema"
import { createVehicleAction } from "@/lib/actions/vehicle-actions"
import { FormError } from "@/components/ui/form-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function VehicleForm() {
    const [state, formAction] = useActionState(
        async (_prevState: any, _formData: any) => {
            return { success: false, error: 'Validation failed', errors };
        },
        { success: false, error: '', errors: {} }
    )

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
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input {...register("licensePlate")} type="text" id="licensePlate" />
                <FormError message={errors.licensePlate?.message} />
            </div>

            <div>
                <Label htmlFor="make">Make</Label>
                <Input {...register("make")} type="text" id="make" />
            </div>

            <div>
                <Label htmlFor="model">Model</Label>
                <Input {...register("model")} type="text" id="model" />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Add Vehicle"}
            </Button>
        </form>
    )
}
