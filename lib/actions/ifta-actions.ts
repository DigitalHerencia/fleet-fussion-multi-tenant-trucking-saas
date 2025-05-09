"use server"

import { db } from "@/lib/db"
import { iftaTrips, iftaReports, fuelPurchases } from "@/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { z } from "zod"
import { iftaSchema } from "@/lib/validation/ifta-schema"
import { fuelPurchaseSchema } from "@/lib/validation/fuel-schema"

// Zod schema for server-side validation
const iftaTripSchema = z.object({
    vehicleId: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    startOdometer: z.coerce.number().min(0),
    endOdometer: z.coerce.number().min(0),
    state: z.string().min(1),
    totalMiles: z.coerce.number().min(0),
    jurisdictionData: z.record(z.any()).optional(),
    fuelPurchases: z.record(z.any()).optional()
})

type IftaTripForm = z.infer<typeof iftaTripSchema>

async function getCompanyId(): Promise<string> {
    return process.env.TEST_COMPANY_ID || ""
}

export async function updateIftaTrip(id: string, formData: FormData) {
    try {
        const result = iftaTripSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return { success: false, error: "Validation failed", errors: result.error.flatten().fieldErrors }
        }
        const data = result.data as IftaTripForm
        const companyId = await getCompanyId()
        await db
            .update(iftaTrips)
            .set({
                vehicleId: data.vehicleId,
                startDate: data.startDate,
                endDate: data.endDate,
                startOdometer: data.startOdometer,
                endOdometer: data.endOdometer,
                totalMiles: String(data.totalMiles),
                jurisdictionData: data.jurisdictionData
                    ? JSON.stringify(data.jurisdictionData)
                    : null,
                fuelPurchases: data.fuelPurchases ? JSON.stringify(data.fuelPurchases) : null
            })
            .where(and(eq(iftaTrips.id, id), eq(iftaTrips.companyId, companyId)))
            .returning()
        return { success: true }
    } catch (error) {
        console.error("[IFTA-Actions] updateIftaTrip error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to update IFTA trip", errors: { form: ["Failed to update IFTA trip"] } }
    }
}

export async function deleteIftaTrip(id: string) {
    try {
        const companyId = await getCompanyId()
        await db
            .delete(iftaTrips)
            .where(and(eq(iftaTrips.id, id), eq(iftaTrips.companyId, companyId)))
        return { success: true }
    } catch (error) {
        console.error("[IFTA-Actions] deleteIftaTrip error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete IFTA trip", errors: { form: ["Failed to delete IFTA trip"] } }
    }
}

export async function generateIftaReport(formData: FormData) {
    try {
        const { quarter, year } = Object.fromEntries(formData)
        const companyId = await getCompanyId()
        // Calculate summary data by aggregating trips for the quarter
        const tripData = await db
            .select({
                totalMiles: sql`SUM(${iftaTrips.totalMiles})`.as("totalMiles")
            })
            .from(iftaTrips)
            .where(eq(iftaTrips.companyId, companyId))
        const totalMiles =
            tripData.length > 0 && tripData[0] && tripData[0].totalMiles !== undefined
                ? Number(tripData[0].totalMiles) || 0
                : 0
        return {
            success: true,
            report: {
                companyId,
                quarter: quarter as string,
                year: Number(year),
                status: "DRAFT",
                totalMiles,
                createdAt: new Date()
            }
        }
    } catch (error) {
        console.error("[IFTA-Actions] generateIftaReport error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate IFTA report", errors: { form: ["Failed to generate IFTA report"] } }
    }
}

export async function createIFTAAction(_: any, formData: FormData) {
    try {
        const result = iftaSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return { success: false, error: "Validation failed", errors: result.error.flatten().fieldErrors }
        }
        const companyId = await getCompanyId()
        await db.insert(iftaReports).values({
            ...result.data,
            quarter: Number(result.data.quarter),
            companyId,
            totalMiles: String(result.data.totalMiles),
            totalGallons: String(result.data.totalGallons)
        })
        return { success: true }
    } catch (err) {
        console.error("[IFTA-Actions] createIFTAAction error:", err)
        return { success: false, error: err instanceof Error ? err.message : "Failed to create IFTA record", errors: { form: ["Failed to create IFTA record"] } }
    }
}

export async function createFuelPurchaseAction(_: any, formData: FormData) {
    try {
        const result = fuelPurchaseSchema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return { success: false, error: "Validation failed", errors: result.error.flatten().fieldErrors }
        }
        const companyId = await getCompanyId()
        await db.insert(fuelPurchases).values({
            ...result.data,
            companyId,
            date: result.data.date,
            gallons: String(result.data.gallons),
            pricePerGallon: String(result.data.pricePerGallon),
            totalAmount: String(result.data.totalAmount)
        })
        return { success: true }
    } catch (err) {
        console.error("[IFTA-Actions] createFuelPurchaseAction error:", err)
        return { success: false, error: err instanceof Error ? err.message : "Failed to create fuel purchase", errors: { form: ["Failed to create fuel purchase"] } }
    }
}
