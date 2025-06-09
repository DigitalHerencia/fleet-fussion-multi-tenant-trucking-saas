'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import db from '@/lib/database/db';
import { getIftaDataForPeriod, getIftaTripData } from '@/lib/fetchers/iftaFetchers';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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
  if (!userId) throw new Error('Unauthorized');
  const user = await db.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
  });
  if (!user) throw new Error('User not found or not member of organization');
  // Robust permission check: coerce permissions to string[]
  let perms: string[] = [];
  if (Array.isArray(user.permissions)) {
    perms = user.permissions.map((p: any) =>
      typeof p === 'string' ? p : (p?.name ?? '')
    );
  } else if (typeof user.permissions === 'string') {
    perms = [user.permissions];
  }
  if (!perms.includes('ifta:manage') && !perms.includes('*')) {
    throw new Error('Insufficient permissions for IFTA actions');
  }
  return user;
}

export async function logIftaTripDataAction(
  orgId: string,
  vehicleId: string,
  tripData: any
) {
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
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to log IFTA trip data',
    };
  }
}

export async function logFuelPurchaseAction(
  orgId: string,
  vehicleId: string,
  purchaseData: any
) {
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
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to log fuel purchase',
    };
  }
}

export async function generateIftaReportAction(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkIftaPermissions(orgId);
    // Use IftaReport model for summary/reporting
    const q = parseInt(quarter);
    const y = parseInt(year);
    if (isNaN(q) || isNaN(y) || q < 1 || q > 4)
      throw new Error('Invalid quarter or year');
    const report = await db.iftaReport.findFirst({
      where: {
        organizationId: orgId,
        quarter: q,
        year: y,
      },
    });
    if (!report) {
      return { success: false, error: 'No IFTA report found for this period' };
    }
    return {
      success: true,
      data: report,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate IFTA report',
    };
  }
}

// -------------------- PDF Generation Actions --------------------

async function createBasicPdf(title: string, content: Record<string, any>) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(title, { x: 50, y: height - 50, size: 18, font });

  let yPos = height - 80;
  Object.entries(content).forEach(([key, value]) => {
    page.drawText(`${key}: ${String(value)}`, { x: 50, y: yPos, size: 12, font });
    yPos -= 16;
  });

  // simple watermark
  page.drawText('FleetFusion', {
    x: width / 2 - 40,
    y: 20,
    size: 12,
    font,
    color: rgb(0.75, 0.75, 0.75),
    opacity: 0.3,
  });

  return pdfDoc.save();
}

export async function generateIFTAReportPDF(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkIftaPermissions(orgId);
    const data = await getIftaDataForPeriod(orgId, `Q${quarter}`, year);
    const pdf = await createBasicPdf('IFTA Quarterly Report', {
      quarter: `Q${quarter}`,
      year,
      totalMiles: data.summary?.totalMiles ?? 0,
      totalGallons: data.summary?.totalGallons ?? 0,
      averageMpg: data.summary?.averageMpg ?? 0,
    });
    return { success: true, data: Buffer.from(pdf) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    };
  }
}

export async function generateTripLogPDF(
  orgId: string,
  tripId: string
) {
  try {
    await checkIftaPermissions(orgId);
    const result = await getIftaTripData(orgId, { vehicleId: undefined });
    const trip = Array.isArray(result.data)
      ? result.data.find(t => t.id === tripId)
      : null;
    if (!trip) throw new Error('Trip not found');
    const pdf = await createBasicPdf('IFTA Trip Log', {
      date: trip.date.toISOString().split('T')[0],
      vehicle: trip.vehicle?.unitNumber ?? trip.vehicleId,
      jurisdiction: trip.jurisdiction,
      distance: trip.distance,
      fuelUsed: trip.fuelUsed ?? 'N/A',
    });
    return { success: true, data: Buffer.from(pdf) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to generate Trip PDF',
    };
  }
}

export async function generateFuelSummaryPDF(
  orgId: string,
  quarter: string,
  year: string
) {
  try {
    await checkIftaPermissions(orgId);
    const data = await getIftaDataForPeriod(orgId, `Q${quarter}`, year);
    const pdf = await createBasicPdf('Fuel Purchase Summary', {
      quarter: `Q${quarter}`,
      year,
      purchases: Array.isArray(data.fuelPurchases)
        ? data.fuelPurchases.length
        : 0,
      totalGallons: data.summary?.totalGallons ?? 0,
      totalFuelCost: data.summary?.totalFuelCost ?? 0,
    });
    return { success: true, data: Buffer.from(pdf) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate fuel PDF',
    };
  }
}

export async function generateCustomIFTAReport(
  orgId: string,
  startDate: string,
  endDate: string
) {
  try {
    await checkIftaPermissions(orgId);
    const result = await getIftaTripData(orgId, {
      startDate,
      endDate,
    });
    const trips = Array.isArray(result.data) ? result.data.length : 0;
    const pdf = await createBasicPdf('Custom IFTA Report', {
      startDate,
      endDate,
      trips,
    });
    return { success: true, data: Buffer.from(pdf) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate custom PDF',
    };
  }
}

export async function fetchIftaDataAction(orgId: string, quarter: string, year: string) {
  try {
    await checkIftaPermissions(orgId);
    return await getIftaDataForPeriod(orgId, quarter, year);
  } catch (error) {
    console.error('Error fetching IFTA data:', error);
    throw new Error('Failed to fetch IFTA data');
  }
}
