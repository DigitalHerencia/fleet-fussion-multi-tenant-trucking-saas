"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import {
  fuelPurchaseSchema,
  type FuelPurchaseFormData,
} from "@/lib/validation/fuel-schema";
import { createFuelPurchaseAction } from "@/lib/actions/ifta-actions";
import { FormError } from "@/components/ui/form-error";

type FuelPurchaseFormState = {
  success: boolean;
  error: string;
  errors: {
    vehicleId?: string[];
    driverId?: string[];
    date?: string[];
    location?: string[];
    jurisdiction?: string[];
    gallons?: string[];
    pricePerGallon?: string[];
    totalAmount?: string[];
    notes?: string[];
    form?: string[];
  };
};

export function FuelPurchaseForm({
  vehicles,
  drivers,
}: {
  vehicles: { id: string; unitNumber: string }[];
  drivers: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(
    async (
      prevState: FuelPurchaseFormState,
      formData: FormData,
    ): Promise<FuelPurchaseFormState> => {
      // Only pass formData to the action (do not pass undefined)
      const result = await createFuelPurchaseAction(undefined, formData);
      // Ensure all fields are present for type safety
      return {
        success: result.success ?? false,
        error: result.error ?? "",
        errors: result.errors ?? {},
      };
    },
    { success: false, error: "", errors: {} },
  );

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<FuelPurchaseFormData>({
    resolver: zodResolver(fuelPurchaseSchema),
  });

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state.error || state.errors.form?.[0]} />
      <div>
        <label>Vehicle</label>
        <select {...register("vehicleId")} className="input">
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.unitNumber}
            </option>
          ))}
        </select>
        <FormError
          message={errors.vehicleId?.message || state.errors.vehicleId?.[0]}
        />
      </div>
      <div>
        <label>Driver</label>
        <select {...register("driverId")} className="input">
          <option value="">Select Driver</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <FormError
          message={errors.driverId?.message || state.errors.driverId?.[0]}
        />
      </div>
      <div>
        <label>Date</label>
        <input type="date" {...register("date")} className="input" />
        <FormError message={errors.date?.message || state.errors.date?.[0]} />
      </div>
      <div>
        <label>Location</label>
        <input type="text" {...register("location")} className="input" />
        <FormError
          message={errors.location?.message || state.errors.location?.[0]}
        />
      </div>
      <div>
        <label>Jurisdiction</label>
        <input type="text" {...register("jurisdiction")} className="input" />
        <FormError
          message={
            errors.jurisdiction?.message || state.errors.jurisdiction?.[0]
          }
        />
      </div>
      <div>
        <label>Gallons</label>
        <input
          type="number"
          step="0.001"
          {...register("gallons")}
          className="input"
        />
        <FormError
          message={errors.gallons?.message || state.errors.gallons?.[0]}
        />
      </div>
      <div>
        <label>Price Per Gallon</label>
        <input
          type="number"
          step="0.001"
          {...register("pricePerGallon")}
          className="input"
        />
        <FormError
          message={
            errors.pricePerGallon?.message || state.errors.pricePerGallon?.[0]
          }
        />
      </div>
      <div>
        <label>Total Amount</label>
        <input
          type="number"
          step="0.01"
          {...register("totalAmount")}
          className="input"
        />
        <FormError
          message={errors.totalAmount?.message || state.errors.totalAmount?.[0]}
        />
      </div>
      <div>
        <label>Notes</label>
        <textarea {...register("notes")} className="input" />
        <FormError message={errors.notes?.message || state.errors.notes?.[0]} />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Add Fuel Purchase"}
      </button>
    </form>
  );
}
