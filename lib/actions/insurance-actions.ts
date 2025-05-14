"use server";

import { db } from "@/db/db";
import { insurancePolicies } from "@/db/schema";
import { insurancePolicySchema } from "@/lib/validation/insurance-schema";
import { getCurrentCompanyId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import type { ApiResult } from "@/types/api";

export async function createInsurancePolicy(
  formData: FormData,
): Promise<ApiResult<unknown>> {
  try {
    const companyId = await getCurrentCompanyId();
    const parsed = insurancePolicySchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    // Convert premium to string and date fields to ISO strings if present
    const insuranceToInsert = {
      ...parsed.data,
      companyId,
      premium:
        parsed.data.premium !== undefined
          ? parsed.data.premium.toString()
          : undefined,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate).toISOString()
        : undefined,
      endDate: parsed.data.endDate
        ? new Date(parsed.data.endDate).toISOString()
        : undefined,
    };
    const [policy] = await db
      .insert(insurancePolicies)
      .values(insuranceToInsert)
      .returning();
    return { success: true, data: policy };
  } catch (error) {
    console.error("[InsuranceActions] createInsurancePolicy error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create insurance policy",
      errors: undefined,
    };
  }
}

export async function updateInsurancePolicy(
  id: string,
  formData: FormData,
): Promise<ApiResult<unknown>> {
  try {
    const parsed = insurancePolicySchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    // Convert premium to string and date fields to ISO strings if present
    const insuranceToUpdate = {
      ...parsed.data,
      premium:
        parsed.data.premium !== undefined
          ? parsed.data.premium.toString()
          : undefined,
      startDate: parsed.data.startDate
        ? new Date(parsed.data.startDate).toISOString()
        : undefined,
      endDate: parsed.data.endDate
        ? new Date(parsed.data.endDate).toISOString()
        : undefined,
    };
    const [policy] = await db
      .update(insurancePolicies)
      .set(insuranceToUpdate)
      .where(eq(insurancePolicies.id, id))
      .returning();
    return { success: true, data: policy };
  } catch (error) {
    console.error("[InsuranceActions] updateInsurancePolicy error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update insurance policy",
      errors: undefined,
    };
  }
}

export async function deleteInsurancePolicy(id: string) {
  await db.delete(insurancePolicies).where(eq(insurancePolicies.id, id));
  return { success: true };
}

export async function getInsurancePolicies() {
  const companyId = await getCurrentCompanyId();
  return db.query.insurancePolicies.findMany({
    where: (p, { eq }) => eq(p.companyId, companyId),
  });
}
