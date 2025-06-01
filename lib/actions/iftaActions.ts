"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import db from "@/lib/database/db";
import { z } from "zod";

const tripDataSchema = z.object({
  date: z.string(),
  distance: z.number(),
  jurisdiction: z.string(),
  fuelUsed: z.number().optional(),
  notes: z.string().optional(),
});

const fuelPurchaseSchema = z.object({
  date: z.string(),
  jurisdiction: z.string(),
  gallons: z.number(),
  amount: z.number(),
  vendor: z.string().optional(),
  receiptNumber: z.string().optional(),
});

async function checkIftaPermissions(orgId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
  });
  if (!user) throw new Error("User not found or not member of organization");
  // Robust permission check: coerce permissions to string[]
  let perms: string[] = [];
  if (Array.isArray(user.permissions)) {
    perms = user.permissions.map((p: any) => typeof p === "string" ? p : (p?.name ?? ""));
  } else if (typeof user.permissions === "string") {
    perms = [user.permissions];
  }
  if (!perms.includes("ifta:manage") && !perms.includes("*")) {
    throw new Error("Insufficient permissions for IFTA actions");
  }
  return user;
}

export async function logIftaTripDataAction(orgId: string, vehicleId: string, tripData: any) {
  try {
    await checkIftaPermissions(orgId);
    const validated = tripDataSchema.parse(tripData);
    const trip = await db.iftaTrip.create({
      data: {
        organizationId: orgId,
        vehicleId,
        date: new Date(validated.date),
        distance: validated.distance,
        jurisdiction: validated.jurisdiction,
        fuelUsed: validated.fuelUsed ?? null,
        notes: validated.notes ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath(`/dashboard/${orgId}/ifta`);
    return { success: true, data: trip };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to log IFTA trip data" };
  }
}

export async function logFuelPurchaseAction(orgId: string, vehicleId: string, purchaseData: any) {
  try {
    await checkIftaPermissions(orgId);
    const validated = fuelPurchaseSchema.parse(purchaseData);
    // Use the correct camelCase accessor for the Prisma model
    const purchase = await db.iftaFuelPurchase.create({
      data: {
        organizationId: orgId,
        vehicleId,
        date: new Date(validated.date),
        jurisdiction: validated.jurisdiction,
        gallons: validated.gallons,
        amount: validated.amount,
        vendor: validated.vendor ?? null,
        receiptNumber: validated.receiptNumber ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    revalidatePath(`/dashboard/${orgId}/ifta`);
    return { success: true, data: purchase };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to log fuel purchase" };
  }
}

export async function generateIftaReportAction(orgId: string, quarter: string, year: string) {
  try {
    await checkIftaPermissions(orgId);
    // Use IftaReport model for summary/reporting
    const q = parseInt(quarter);
    const y = parseInt(year);
    if (isNaN(q) || isNaN(y) || q < 1 || q > 4) throw new Error("Invalid quarter or year");
    const report = await db.iftaReport.findFirst({
      where: {
        organizationId: orgId,
        quarter: q,
        year: y,
      },
    });
    if (!report) {
      return { success: false, error: "No IFTA report found for this period" };
    }
    return {
      success: true,
      data: report,
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate IFTA report" };
  }
}
