import { db } from "@/db";
import { iftaTrips, iftaReports, vehicles, drivers } from "@/db/schema";
import { eq, and, between, desc, sql, gte, lte } from "drizzle-orm";
import { endOfQuarter, startOfQuarter, format } from "date-fns";
import { getCurrentCompanyId } from "@/lib/auth";
import { cache } from "react";
import { calculateJurisdictionTax } from "@/lib/utils";

// Helper function to get current company ID
async function getCompanyId(): Promise<string> {
  return getCurrentCompanyId();
}

/**
 * Get all IFTA trips for a company with optional filters
 */
export const getIftaTrips = cache(async function getIftaTrips({
  companyId,
  startDate,
  endDate,
  vehicleId,
  driverId,
  limit = 50,
  offset = 0,
}: {
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  driverId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let cId = companyId;
    if (!cId) {
      cId = await getCompanyId();
    }

    const conditions = [eq(iftaTrips.companyId, cId)];

    if (startDate && endDate) {
      conditions.push(
        gte(iftaTrips.startDate, startDate),
        lte(iftaTrips.startDate, endDate),
      );
    }

    if (vehicleId) {
      conditions.push(eq(iftaTrips.vehicleId, vehicleId));
    }

    if (driverId) {
      conditions.push(eq(iftaTrips.driverId, driverId));
    }

    const query = db
      .select({
        id: iftaTrips.id,
        startDate: iftaTrips.startDate,
        endDate: iftaTrips.endDate,
        vehicleId: iftaTrips.vehicleId,
        vehicleUnitNumber: vehicles.unitNumber,
        driverId: iftaTrips.driverId,
        driverFirstName: drivers.firstName,
        driverLastName: drivers.lastName,
        startOdometer: iftaTrips.startOdometer,
        endOdometer: iftaTrips.endOdometer,
        totalMiles: iftaTrips.totalMiles,
        state: iftaTrips.state,
        jurisdictionData: iftaTrips.jurisdictionData,
        fuelPurchases: iftaTrips.fuelPurchases,
      })
      .from(iftaTrips)
      .leftJoin(vehicles, eq(iftaTrips.vehicleId, vehicles.id))
      .leftJoin(drivers, eq(iftaTrips.driverId, drivers.id))
      .where(and(...conditions))
      .orderBy(desc(iftaTrips.startDate))
      .limit(limit)
      .offset(offset);

    const trips = await query;

    // Format the data for the UI
    return trips.map((trip) => ({
      ...trip,
      driver:
        trip.driverFirstName && trip.driverLastName
          ? `${trip.driverFirstName} ${trip.driverLastName}`
          : "Unassigned",
      vehicle: trip.vehicleUnitNumber || "Unknown",
      jurisdictionData: trip.jurisdictionData
        ? JSON.parse(trip.jurisdictionData as string)
        : null,
      fuelPurchases: trip.fuelPurchases
        ? JSON.parse(trip.fuelPurchases as string)
        : null,
    }));
  } catch (error) {
    console.error("getIftaTrips error:", error);
    throw new Error("Failed to fetch IFTA trips");
  }
});

/**
 * Get all IFTA reports for a company
 */
export const getIftaReports = cache(async function getIftaReports({
  companyId,
  year,
  quarter,
  limit = 20,
  offset = 0,
}: {
  companyId?: string;
  year?: number;
  quarter?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    let cId = companyId;
    if (!cId) {
      cId = await getCompanyId();
    }

    const conditions = [eq(iftaReports.companyId, cId)];

    if (year) {
      conditions.push(eq(iftaReports.year, year));
    }

    if (quarter) {
      conditions.push(eq(iftaReports.quarter, quarter));
    }

    const query = db
      .select()
      .from(iftaReports)
      .where(and(...conditions))
      .orderBy(desc(iftaReports.year), desc(iftaReports.quarter))
      .limit(limit)
      .offset(offset);

    const reports = await query;

    return reports.map((report) => ({
      ...report,
      totalMiles: report.totalMiles ? Number(report.totalMiles) : 0,
      totalGallons: report.totalGallons ? Number(report.totalGallons) : 0,
      avgMpg:
        report.totalMiles &&
        report.totalGallons &&
        Number(report.totalGallons) > 0
          ? (Number(report.totalMiles) / Number(report.totalGallons)).toFixed(1)
          : "0.0",
      reportData: report.reportData
        ? JSON.parse(report.reportData as string)
        : null,
      dueDate: getDueDateForQuarter(report.quarter, report.year),
    }));
  } catch (error) {
    console.error("getIftaReports error:", error);
    throw new Error("Failed to fetch IFTA reports");
  }
});

/**
 * Get aggregated IFTA summary metrics for the dashboard
 */
export async function getIftaSummaryMetrics(
  companyId?: string,
  year?: number,
  quarter?: number,
) {
  try {
    let cId = companyId;
    if (!cId) {
      cId = await getCompanyId();
    }

    const currentDate = new Date();
    const currentYear = year || currentDate.getFullYear();
    const currentQuarter =
      quarter || Math.floor(currentDate.getMonth() / 3 + 1);

    // Calculate start and end dates for the current quarter
    const startDate = startOfQuarter(
      new Date(currentYear, (currentQuarter - 1) * 3, 1),
    );
    const endDate = endOfQuarter(startDate);

    // Calculate start and end dates for the previous quarter
    const previousQuarterDate = new Date(startDate);
    previousQuarterDate.setMonth(previousQuarterDate.getMonth() - 3);
    const previousStartDate = startOfQuarter(previousQuarterDate);
    const previousEndDate = endOfQuarter(previousStartDate);

    // Get current quarter totals
    const currentTotals = await db
      .select({
        totalMiles: sql<string>`COALESCE(SUM(${iftaTrips.totalMiles}), 0)`.as(
          "totalMiles",
        ),
        totalGallons: sql<string>`COALESCE(SUM(${iftaTrips.gallons}), 0)`.as(
          "totalGallons",
        ),
        uniqueJurisdictions: sql<number>`COUNT(DISTINCT ${iftaTrips.state})`.as(
          "uniqueJurisdictions",
        ),
      })
      .from(iftaTrips)
      .where(
        and(
          eq(iftaTrips.companyId, cId),
          between(iftaTrips.startDate, startDate, endDate),
        ),
      );

    // Get previous quarter totals
    const previousTotals = await db
      .select({
        totalMiles: sql<string>`COALESCE(SUM(${iftaTrips.totalMiles}), 0)`.as(
          "totalMiles",
        ),
        totalGallons: sql<string>`COALESCE(SUM(${iftaTrips.gallons}), 0)`.as(
          "totalGallons",
        ),
      })
      .from(iftaTrips)
      .where(
        and(
          eq(iftaTrips.companyId, cId),
          between(iftaTrips.startDate, previousStartDate, previousEndDate),
        ),
      );

    // Calculate metrics
    const current = {
      totalMiles: parseFloat(currentTotals[0]?.totalMiles || "0"),
      totalGallons: parseFloat(currentTotals[0]?.totalGallons || "0"),
      uniqueJurisdictions: currentTotals[0]?.uniqueJurisdictions || 0,
    };

    const previous = {
      totalMiles: parseFloat(previousTotals[0]?.totalMiles || "0"),
      totalGallons: parseFloat(previousTotals[0]?.totalGallons || "0"),
    };

    // Calculate percentage changes
    const milesChange =
      previous.totalMiles > 0
        ? (
            ((current.totalMiles - previous.totalMiles) / previous.totalMiles) *
            100
          ).toFixed(1)
        : "0.0";

    const gallonsChange =
      previous.totalGallons > 0
        ? (
            ((current.totalGallons - previous.totalGallons) /
              previous.totalGallons) *
            100
          ).toFixed(1)
        : "0.0";

    // Calculate average MPG
    const currentMpg =
      current.totalGallons > 0
        ? (current.totalMiles / current.totalGallons).toFixed(1)
        : "0.0";
    const previousMpg =
      previous.totalGallons > 0
        ? (previous.totalMiles / previous.totalGallons).toFixed(1)
        : "0.0";
    const mpgChange =
      parseFloat(previousMpg) > 0
        ? (parseFloat(currentMpg) - parseFloat(previousMpg)).toFixed(1)
        : "0.0";

    // Get jurisdiction breakdown
    const jurisdictions = await db
      .select({
        state: iftaTrips.state,
        miles: sql<string>`SUM(${iftaTrips.totalMiles})`.as("miles"),
        gallons: sql<string>`SUM(${iftaTrips.gallons})`.as("gallons"),
      })
      .from(iftaTrips)
      .where(
        and(
          eq(iftaTrips.companyId, cId),
          between(iftaTrips.startDate, startDate, endDate),
          sql`${iftaTrips.state} IS NOT NULL`,
        ),
      )
      .groupBy(iftaTrips.state)
      .orderBy(desc(sql<string>`SUM(${iftaTrips.totalMiles})`));

    // NOTE: County-level tax calculation requires schema changes to store county info per trip.
    return {
      metrics: {
        totalMiles: current.totalMiles,
        totalGallons: current.totalGallons,
        avgMpg: currentMpg,
        uniqueJurisdictions: current.uniqueJurisdictions,
        milesChange,
        gallonsChange,
        mpgChange,
      },
      period: {
        year: currentYear,
        quarter: currentQuarter,
        label: `${currentYear} - Q${currentQuarter}`,
      },
      jurisdictions: jurisdictions.map((j) => ({
        ...calculateJurisdictionTax({
          miles: parseFloat(j.miles || "0"),
          gallons: parseFloat(j.gallons || "0"),
          state: j.state || "Unknown",
        }),
      })),
    };
  } catch (error) {
    console.error("getIftaSummaryMetrics error:", error);
    throw new Error("Failed to fetch IFTA summary metrics");
  }
}

/**
 * Helper function to get due date for a quarter
 */
function getDueDateForQuarter(quarter: number, year: number): string {
  // IFTA due dates: Jan 31, Apr 30, Jul 31, Oct 31
  const dueDates = [
    { quarter: 4, month: 0, day: 31 }, // Q4 of previous year is due Jan 31
    { quarter: 1, month: 3, day: 30 }, // Q1 is due Apr 30
    { quarter: 2, month: 6, day: 31 }, // Q2 is due Jul 31
    { quarter: 3, month: 9, day: 31 }, // Q3 is due Oct 31
  ];

  const dueDate = dueDates.find((d) => d.quarter === quarter);
  if (!dueDate) return "";

  // For Q4, the due date is in the next year
  const dueYear = quarter === 4 ? year + 1 : year;
  return format(new Date(dueYear, dueDate.month, dueDate.day), "yyyy-MM-dd");
}
