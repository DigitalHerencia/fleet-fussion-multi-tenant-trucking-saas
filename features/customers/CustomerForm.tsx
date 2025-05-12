"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { customerCoreSchema } from "@/lib/validation/customer-schema";
import { createCustomer } from "@/lib/actions/customer-actions";
import { FormError } from "@/components/ui/form-error";
import { z } from "zod";

// Infer the form values type from the schema
type CustomerFormValues = z.infer<typeof customerCoreSchema>;

export function CustomerForm() {
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await createCustomer(formData);
    },
    { success: false, error: "", errors: {} },
  );

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerCoreSchema),
  });

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label>Name</label>
        <input {...register("name")} className="input" />
        <FormError
          message={
            errors.name?.message 
          }
        />
      </div>
      <div>
        <label>Contact Person</label>
        <input {...register("contactPerson")} className="input" />
      </div>
      <div>
        <label>Contact Email</label>
        <input {...register("email")} className="input" />
        <FormError
          message={
            errors.email?.message
          }
        />
      </div>
      <div>
        <label>Contact Phone</label>
        <input {...register("phone")} className="input" />
      </div>
      <div>
        <label>Address</label>
        <input {...register("address")} className="input" />
      </div>
      <div>
        <label>City</label>
        <input {...register("city")} className="input" />
      </div>
      <div>
        <label>State</label>
        <input {...register("state")} className="input" />
      </div>
      <div>
        <label>Zip</label>
        <input {...register("zip")} className="input" />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Add Customer"}
      </button>
      <FormError message={!state.success ? state.error : undefined} />
    </form>
  );
}
