"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import {
  insurancePolicySchema,
  type InsurancePolicyFormValues,
} from "@/lib/validation/insurance-schema";
import { createInsurancePolicy } from "@/lib/actions/insurance-actions";
import { FormError } from "@/components/ui/form-error";

export function InsuranceForm() {
  const [state, formAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await createInsurancePolicy(formData);
    },
    { success: false, error: "", errors: {} },
  );

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<InsurancePolicyFormValues>({
    resolver: zodResolver( insurancePolicySchema ) as unknown as undefined,
  });

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label>Provider</label>
        <input {...register("provider")} className="input" />
        <FormError
          message={
            errors.provider?.message 
          }
        />
      </div>
      <div>
        <label>Policy Number</label>
        <input {...register("policyNumber")} className="input" />
        <FormError
          message={
            errors.policyNumber?.message 
          }
        />
      </div>
      <div>
        <label>Coverage Type</label>
        <input {...register("coverageType")} className="input" />
      </div>
      <div>
        <label>Status</label>
        <select {...register("status")} className="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div>
        <label>Notes</label>
        <textarea {...register("notes")} className="input" />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Add Policy"}
      </button>
      <FormError message={!state.success ? state.error : undefined} />
    </form>
  );
}
