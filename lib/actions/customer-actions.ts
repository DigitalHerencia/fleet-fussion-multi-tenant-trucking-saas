"use server";

import { db } from "@/db/db";
import { customers } from "@/db/schema";
import { customerCoreSchema } from "@/lib/validation/customer-schema";
import { getCurrentCompanyId } from "@/lib/auth";
import { eq } from "drizzle-orm";
import type { ApiResult } from "@/types/api";

export async function createCustomer(
  formData: FormData,
): Promise<ApiResult<unknown>> {
  try {
    const companyId = await getCurrentCompanyId();
    const parsed = customerCoreSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    const [customer] = await db
      .insert(customers)
      .values({ ...parsed.data, companyId })
      .returning();
    return { success: true, data: customer };
  } catch (error) {
    console.error("[CustomerActions] createCustomer error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create customer",
      errors: undefined,
    };
  }
}

export async function updateCustomer(
  id: string,
  formData: FormData,
): Promise<ApiResult<unknown>> {
  try {
    const parsed = customerCoreSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    const [customer] = await db
      .update(customers)
      .set(parsed.data)
      .where(eq(customers.id, id))
      .returning();
    return { success: true, data: customer };
  } catch (error) {
    console.error("[CustomerActions] updateCustomer error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update customer",
      errors: undefined,
    };
  }
}

export async function deleteCustomer(id: string) {
  await db.delete(customers).where(eq(customers.id, id));
  return { success: true };
}

export async function getCustomers() {
  const companyId = await getCurrentCompanyId();
  return db.query.customers.findMany({
    where: (c, { eq }) => eq(c.companyId, companyId),
  });
}
