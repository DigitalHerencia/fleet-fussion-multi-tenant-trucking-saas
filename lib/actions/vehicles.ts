"use server";

import { db } from "@/db/db";
import { vehicles } from "@/db/schema";
import { createVehicleSchema, updateVehicleSchema } from "@/lib/validation/vehicle-schema";
import { getCurrentCompanyId } from "@/lib/auth";
import type { ApiResult } from "@/types/api";
import type { CreateVehicleInput, UpdateVehicleInput } from "@/lib/validation/vehicle-schema";
import { eq, and } from "drizzle-orm";

export async function addVehicle(formData: FormData) {
  try {
    const parsed = createVehicleSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    const data = parsed.data;
    const companyId = await getCurrentCompanyId();

    // Parse lastOdometerUpdate to Date object if it exists
    const lastOdometerUpdate = data.lastOdometerUpdate ? new Date(data.lastOdometerUpdate) : null;

    // Insert the vehicle into the database
    const result = await db
      .insert(vehicles)
      .values({ ...data, companyId, lastOdometerUpdate })
      .returning();
    const vehicle = Array.isArray(result) ? result[0] : result;
  } catch (err) {
    console.error("[VehicleActions] Error adding vehicle:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      errors: { _form: ["An unexpected error occurred. Please try again."] },
    };
  }
}

export async function updateVehicle(formData: FormData) {
  try {
    const parsed = updateVehicleSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    
    const data = parsed.data;
    const { id, ...updateData } = data;
    const companyId = await getCurrentCompanyId();

    // Parse lastOdometerUpdate to Date object if it exists
    const lastOdometerUpdate = updateData.lastOdometerUpdate ? new Date(updateData.lastOdometerUpdate) : null;
    
    const result = await db
      .update(vehicles)
      .set({ ...updateData, lastOdometerUpdate })
      .where(
        and(
          eq(vehicles.id, id),
          eq(vehicles.companyId, companyId)
        )
      )
      .returning();
      
    const vehicle = Array.isArray(result) ? result[0] : result;
  } catch (err) {
    console.error("[VehicleActions] Error updating vehicle:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.",
      errors: { _form: ["An unexpected error occurred. Please try again."] },
    };
  }
}
