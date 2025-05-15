"use client";

import type { z } from "zod";
import { useForm } from "react-hook-form";
import { FormError } from "@/components/ui/form-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLoadSchema } from "@/lib/validation/load-schema";

export default function LoadForm({
  drivers,
  vehicles,
}: {
  drivers: { id: number; name: string }[];
  vehicles: { id: number; licensePlate: string }[];
}) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(createLoadSchema) as any,
  });

  return (
    <>
      <div>
        <label htmlFor="originAddress">Origin Address</label>
        <input {...register("originAddress")} type="text" className="input" />
        <FormError
          message={
            typeof errors.originAddress?.message === "string"
              ? errors.originAddress?.message
              : undefined
          }
        />
      </div>

      <div>
        <label htmlFor="originCity">Origin City</label>
        <input {...register("originCity")} type="text" className="input" />
        <FormError
          message={
            typeof errors.originCity?.message === "string"
              ? errors.originCity?.message
              : undefined
          }
        />
      </div>

      <div>
        <label htmlFor="destinationAddress">Destination Address</label>
        <input
          {...register("destinationAddress")}
          type="text"
          className="input"
        />
        <FormError
          message={
            typeof errors.destinationAddress?.message === "string"
              ? errors.destinationAddress?.message
              : undefined
          }
        />
      </div>

      <div>
        <label htmlFor="destinationCity">Destination City</label>
        <input
          {...register("destinationCity")}
          type="text"
          className="input"
        />
        <FormError
          message={
            typeof errors.destinationCity?.message === "string"
              ? errors.destinationCity?.message
              : undefined
          }
        />
      </div>

      <div>
        <label htmlFor="driverId">Driver</label>
        <select {...register("driverId")} className="input">
          <option value="">Select driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <FormError
          message={
            typeof errors.driverId?.message === "string"
              ? errors.driverId?.message
              : undefined
          }
        />
      </div>

      <div>
        <label htmlFor="vehicleId">Vehicle</label>
        <select {...register("vehicleId")} className="input">
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.licensePlate}
            </option>
          ))}
        </select>
        <FormError
          message={
            typeof errors.vehicleId?.message === "string"
              ? errors.vehicleId?.message
              : undefined
          }
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? "Submitting..." : "Create Load"}
      </button>
    </>
  );
}
