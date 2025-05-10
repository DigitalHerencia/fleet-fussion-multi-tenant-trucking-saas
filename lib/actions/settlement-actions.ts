"use server"

import { db } from "@/db"
import { settlements } from "@/db/schema"
import { settlementSchema, type SettlementFormValues } from "@/lib/validation/settlement-schema"
import { getCurrentCompanyId } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function createSettlement(formData: FormData) {
  const companyId = await getCurrentCompanyId()
  const parsed = settlementSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: "Validation failed", errors: parsed.error.flatten().fieldErrors }
  }
  // Convert amount to string and ensure date fields are Date objects
  const settlementToInsert = {
    ...parsed.data,
    amount: parsed.data.amount.toString(),
    issuedDate: parsed.data.issuedDate ? new Date(parsed.data.issuedDate) : undefined,
    paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : undefined,
    companyId,
  };
  const [settlement] = await db.insert(settlements).values(settlementToInsert).returning()
  return { success: true, settlement }
}

export async function updateSettlement(id: string, formData: FormData) {
  const companyId = await getCurrentCompanyId()
  const parsed = settlementSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { success: false, error: "Validation failed", errors: parsed.error.flatten().fieldErrors }
  }
  // Convert amount to string and ensure date fields are Date objects
  const settlementToUpdate = {
    ...parsed.data,
    amount: parsed.data.amount.toString(),
    issuedDate: parsed.data.issuedDate ? new Date(parsed.data.issuedDate) : undefined,
    paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : undefined,
  };
  const [settlement] = await db.update(settlements).set(settlementToUpdate).where(eq(settlements.id, id)).returning()
  return { success: true, settlement }
}

export async function deleteSettlement(id: string) {
  const companyId = await getCurrentCompanyId()
  await db.delete(settlements).where(eq(settlements.id, id))
  return { success: true }
}

export async function getSettlements() {
  const companyId = await getCurrentCompanyId()
  return db.query.settlements.findMany({ where: (s, { eq }) => eq(s.companyId, companyId) })
}
