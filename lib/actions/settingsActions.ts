"use server";
import { z } from "zod";
import { CompanyProfileSchema } from "@/validations/settings";

export async function updateCompanyProfileAction(orgId: string, data: unknown) {
  const parsed = CompanyProfileSchema.safeParse(data);
  if (!parsed.success) throw new Error("Invalid data");
  // ...update company profile in DB...
  return { success: true };
}
