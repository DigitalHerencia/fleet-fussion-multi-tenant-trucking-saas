"use client"

import { useActionState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createLoad } from "@/lib/actions/load-actions"
import { loadSchema, type LoadFormData } from "@/lib/validation/load-schema"
import { FormError } from "@/components/ui/form-error"

export default function LoadForm({
    drivers,
    vehicles
}: {
    drivers: { id: number; name: string }[]
    vehicles: { id: number; licensePlate: string }[]
}) {
    const {
        register,
        formState: { errors, isSubmitting }
    } = useForm<LoadFormData>({
        resolver: zodResolver(loadSchema)
    })

    return (
        <>
            <div>
                <label htmlFor="origin">Origin</label>
                <input {...register("origin")} type="text" className="input" />
                <FormError message={errors.origin?.message} />
            </div>

            <div>
                <label htmlFor="destination">Destination</label>
                <input {...register("destination")} type="text" className="input" />
                <FormError message={errors.destination?.message} />
            </div>

            <div>
                <label htmlFor="driverId">Driver</label>
                <select {...register("driverId")} className="input">
                    <option value="">Select driver</option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                            {d.name}
                        </option>
                    ))}
                </select>
                <FormError message={errors.driverId?.message} />
            </div>

            <div>
                <label htmlFor="vehicleId">Vehicle</label>
                <select {...register("vehicleId")} className="input">
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                            {v.licensePlate}
                        </option>
                    ))}
                </select>
                <FormError message={errors.vehicleId?.message} />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                {isSubmitting ? "Submitting..." : "Create Load"}
            </button>
        </>
    )
}
