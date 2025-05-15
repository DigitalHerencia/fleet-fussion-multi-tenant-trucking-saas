"use client";

import { useForm } from "react-hook-form";
import type { VehicleFilterData } from "@/lib/validation/vehicle-schema";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function VehicleFormClient() {
  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFilterData>({
  });


  return (
    <form className="space-y-6">
      <div>
        <Label htmlFor="unitNumber">Unit Number</Label>
        <Input {...register("unitNumber")} type="text" id="unitNumber" />
        <FormError message={errors.unitNumber?.message} />
      </div>

      <div>
        <Label htmlFor="make">Make</Label>
        <Input {...register("make")} type="text" id="make" />
        <FormError message={errors.make?.message} />
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Input {...register("model")} type="text" id="model" />
        <FormError message={errors.model?.message} />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Input {...register("type")} type="text" id="type" />
        <FormError message={errors.type?.message} />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Input {...register("status")} type="text" id="status" />
        <FormError message={errors.status?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Add Vehicle"}
      </Button>
    </form>
  );
}
