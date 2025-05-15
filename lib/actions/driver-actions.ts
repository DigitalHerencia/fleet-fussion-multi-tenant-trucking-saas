"use server";

import { db } from "@/db/db";
import { drivers } from "@/db/schema";
import { driverCoreSchema, type CreateDriverInput } from "@/lib/validation/driver-schema";
import { getCurrentCompanyId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ApiResult } from "@/types/api";

export async function createDriverAction(
  formData: FormData,
): Promise<ApiResult<unknown>> {
  try {
    const result = driverCoreSchema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      };
    }
    // Get current company ID from auth context
    const companyId = await getCurrentCompanyId();
    
    // Insert the new driver into the database
    const [newDriver] = await db
      .insert(drivers)
      .values({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        companyId: String(companyId),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        email: formData.get("email"),
        phone: formData.get("phone"),
        licenseNumber: formData.get("licenseNumber"),
        licenseState: formData.get("licenseState"),
        licenseExpiration: formData.get("licenseExpiration"),
        medicalCardExpiration: formData.get("medicalCardExpiration"),
        hireDate: formData.get("hireDate"),
        terminationDate: formData.get("terminationDate"),
        notes: formData.get("notes"),
        clerkUserId: formData.get("clerkUserId"),
      } as any)
      .returning();
    revalidatePath("/drivers");
    return {
      success: true,
      data: newDriver,
    };
  } catch (error) {
    console.error("[DriverActions] Error creating driver:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create driver",
      errors: undefined,
    };
  }
}
