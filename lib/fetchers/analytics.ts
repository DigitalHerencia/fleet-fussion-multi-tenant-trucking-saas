import { db } from "@/db";
import { loads, drivers, vehicles, iftaTrips } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { cache } from "react";

export const getRevenueMetrics = cache(async function getRevenueMetrics(
  companyId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const result = await db
      .select({
        totalRevenue: sql`SUM(${loads.rate})`.as("totalRevenue"),
        avgRatePerMile: sql`AVG(${loads.rate} / NULLIF(${loads.miles}, 0))`.as(
          "avgRatePerMile",
        ),
        loadCount: sql`COUNT(${loads.id})`.as("loadCount"),
      })
      .from(loads)
      .where(
        and(
          eq(loads.companyId, companyId),
          gte(loads.pickupDate, startDate),
          lte(loads.deliveryDate, endDate),
        ),
      );

    return result[0];
  } catch (error) {
    console.error("getRevenueMetrics error:", error);
    throw new Error("Unable to load revenue metrics");
  }
});

export const getDriverPerformance = cache(async function getDriverPerformance(
  companyId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const result = await db
      .select({
        driverId: drivers.id,
        driverFirstName: drivers.firstName,
        driverLastName: drivers.lastName,
        totalLoads: sql`COUNT(${loads.id})`.as("totalLoads"),
        totalMiles: sql`SUM(${loads.miles})`.as("totalMiles"),
        totalRevenue: sql`SUM(${loads.rate})`.as("totalRevenue"),
      })
      .from(drivers)
      .leftJoin(loads, eq(drivers.id, loads.driverId))
      .where(
        and(
          eq(drivers.companyId, companyId),
          gte(loads.pickupDate, startDate),
          lte(loads.deliveryDate, endDate),
        ),
      )
      .groupBy(drivers.id, drivers.firstName, drivers.lastName);

    return result;
  } catch (error) {
    console.error("getDriverPerformance error:", error);
    throw new Error("Unable to load driver performance metrics");
  }
});

export const getVehicleUtilization = cache(async function getVehicleUtilization(
  companyId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const result = await db
      .select({
        vehicleId: vehicles.id,
        vehicleLicensePlate: vehicles.licensePlate,
        unitNumber: vehicles.unitNumber,
        totalLoads: sql`COUNT(${loads.id})`.as("totalLoads"),
        totalMiles: sql`SUM(${loads.miles})`.as("totalMiles"),
        fuelConsumption: sql`SUM(${iftaTrips.totalMiles})`.as(
          "fuelConsumption",
        ),
      })
      .from(vehicles)
      .leftJoin(loads, eq(vehicles.id, loads.vehicleId))
      .leftJoin(iftaTrips, eq(vehicles.id, iftaTrips.vehicleId))
      .where(
        and(
          eq(vehicles.companyId, companyId),
          gte(loads.pickupDate, startDate),
          lte(loads.deliveryDate, endDate),
        ),
      )
      .groupBy(vehicles.id, vehicles.licensePlate, vehicles.unitNumber);

    return result;
  } catch (error) {
    console.error("getVehicleUtilization error:", error);
    throw new Error("Unable to load vehicle utilization metrics");
  }
});

export const getDailyRevenueTimeline = cache(
  async function getDailyRevenueTimeline(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ) {
    try {
      const result = await db
        .select({
          date: loads.deliveryDate,
          revenue: sql`SUM(${loads.rate})`.as("revenue"),
        })
        .from(loads)
        .where(
          and(
            eq(loads.companyId, companyId),
            gte(loads.deliveryDate, startDate),
            lte(loads.deliveryDate, endDate),
          ),
        )
        .groupBy(loads.deliveryDate)
        .orderBy(loads.deliveryDate);

      return result;
    } catch (error) {
      console.error("getDailyRevenueTimeline error:", error);
      throw new Error("Unable to load revenue timeline data");
    }
  },
);

export const getComplianceStatusMetrics = cache(
  async function getComplianceStatusMetrics(companyId: string) {
    try {
      // Since we don't have all_documents_valid field in drivers,
      // we'll check license expiration and medical card expiration
      const driverMetrics = await db
        .select({
          status: sql`CASE 
          WHEN ${drivers.licenseExpiration} > CURRENT_DATE AND 
               ${drivers.medicalCardExpiration} > CURRENT_DATE THEN 'Compliant' 
          ELSE 'Non-Compliant' 
        END`.as("status"),
          count: sql`COUNT(${drivers.id})`.as("count"),
        })
        .from(drivers)
        .where(eq(drivers.companyId, companyId))
        .groupBy(sql`status`);

      // Since we don't have inspection_status in vehicles,
      // we'll create a mock based on status field
      const vehicleMetrics = await db
        .select({
          status: sql`CASE 
          WHEN ${vehicles.status} = 'active' THEN 'Compliant' 
          ELSE 'Non-Compliant' 
        END`.as("status"),
          count: sql`COUNT(${vehicles.id})`.as("count"),
        })
        .from(vehicles)
        .where(eq(vehicles.companyId, companyId))
        .groupBy(sql`status`);

      return {
        drivers: driverMetrics,
        vehicles: vehicleMetrics,
      };
    } catch (error) {
      console.error("getComplianceStatusMetrics error:", error);
      throw new Error("Unable to load compliance metrics");
    }
  },
);
