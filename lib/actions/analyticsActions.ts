"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { hasPermission } from "@/lib/auth/permissions";

export interface AnalyticsActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Get fleet performance metrics
 */
export async function getFleetMetricsAction(orgId: string): Promise<AnalyticsActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get fleet performance data
    const [vehicleCount, activeVehicleCount, maintenanceVehicleCount, totalMiles] = await Promise.all([
      prisma.vehicle.count({ where: { organizationId: orgId } }),
      prisma.vehicle.count({ where: { organizationId: orgId, status: 'active' } }),
      prisma.vehicle.count({ where: { organizationId: orgId, status: 'maintenance' } }),
      prisma.vehicle.aggregate({
        where: { organizationId: orgId },
        _sum: { currentOdometer: true }
      })
    ]);

    const metrics = {
      vehicleCount,
      activeVehicleCount,
      maintenanceVehicleCount,
      fleetUtilization: vehicleCount > 0 ? (activeVehicleCount / vehicleCount) * 100 : 0,
      totalMiles: totalMiles._sum.currentOdometer || 0
    };

    return { success: true, data: metrics };
  } catch (error) {
    console.error("Get fleet metrics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get fleet metrics"
    };
  }
}

/**
 * Get load analytics
 */
export async function getLoadAnalyticsAction(orgId: string): Promise<AnalyticsActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get load statistics
    const [totalLoads, deliveredLoads, inTransitLoads, pendingLoads] = await Promise.all([
      prisma.load.count({ where: { organizationId: orgId } }),
      prisma.load.count({ where: { organizationId: orgId, status: 'delivered' } }),
      prisma.load.count({ where: { organizationId: orgId, status: 'in_transit' } }),
      prisma.load.count({ where: { organizationId: orgId, status: 'pending' } })
    ]);

    // Calculate completion rate
    const completionRate = totalLoads > 0 ? (deliveredLoads / totalLoads) * 100 : 0;

    const analytics = {
      totalLoads,
      deliveredLoads,
      inTransitLoads,
      pendingLoads,
      completionRate
    };

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Get load analytics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get load analytics"
    };
  }
}

/**
 * Get driver performance metrics
 */


/**
 * Get financial metrics
 */
export async function getFinancialMetricsAction(orgId: string): Promise<AnalyticsActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get revenue from completed loads
    const revenueData = await prisma.load.aggregate({
      where: { 
        organizationId: orgId,
        status: 'delivered',
        rate: { not: null }
      },
      _sum: { rate: true },
      _count: { id: true }
    });

    



    return { success: true };
  } catch (error) {
    console.error("Get financial metrics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get financial metrics"
    };
  }
}

/**
 * Get compliance analytics
 */
export async function getComplianceAnalyticsAction(orgId: string): Promise<AnalyticsActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get compliance document statistics
    const [totalDocuments, expiredDocuments, expiringDocuments] = await Promise.all([
      prisma.complianceDocument.count({ where: { organizationId: orgId } }),
      prisma.complianceDocument.count({ 

      }),
      prisma.complianceDocument.count({ 
        where: { 
          organizationId: orgId,
         
        }
      })
    ]);

    const complianceRate = totalDocuments > 0 ? 
      ((totalDocuments - expiredDocuments) / totalDocuments) * 100 : 100;

    const analytics = {
      totalDocuments,
      expiredDocuments,
      expiringDocuments,
      complianceRate
    };

    return { success: true, data: analytics };
  } catch (error) {
    console.error("Get compliance analytics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get compliance analytics"
    };
  }
}
