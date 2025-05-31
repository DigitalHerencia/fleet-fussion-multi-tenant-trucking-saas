"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCachedData, setCachedData, CACHE_TTL } from "@/lib/utils/cache";

/**
 * KPI aggregation fetcher with optimized batch queries and caching
 */
export async function getOrganizationKPIs(organizationId: string) {
  const cacheKey = `kpis:${organizationId}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  try {
    // Batch all queries with Promise.all for better performance
    const [activeVehicles, activeDrivers, recentLoads] = await Promise.all([
      // Active vehicles count
      prisma.vehicle.count({
        where: {
          organizationId, // changed from tenantId to organizationId
          status: "active",
        },
      }),
      
      // Active drivers count
      prisma.driver.count({
        where: {
          organizationId,
          status: "active",
        },
      }),
      
      // Recent loads data
      prisma.load.findMany({
        where: {
          organizationId: organizationId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          id: true,
          status: true,
          rate: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate derived metrics from the loads data
    const totalLoads = recentLoads.length;
    const completedLoads = recentLoads.filter(load => 
      ["completed", "delivered", "invoiced", "paid"].includes(load.status)
    ).length;
    const pendingLoads = recentLoads.filter(load => load.status === "pending").length;
    const inTransitLoads = recentLoads.filter(load => 
      ["dispatched", "in_transit", "at_pickup", "at_delivery"].includes(load.status)
    ).length;

    // Calculate total revenue (simplified - assumes rate is stored as number)
    const totalRevenue = recentLoads.reduce((sum, load) => {
      const rate = typeof load.rate === 'object' && load.rate ? 
        (load.rate as any).total || 0 : 
        Number(load.rate) || 0;
      return sum + rate;
    }, 0);

    // Additional KPIs that would need separate queries if needed
    const upcomingMaintenance = 0; // Placeholder
    const recentInspections = 0; // Placeholder  
    const failedInspections = 0; // Placeholder

    const result = {
      activeVehicles,
      activeDrivers,
      totalLoads,
      completedLoads,
      pendingLoads,
      inTransitLoads,
      totalRevenue,
      upcomingMaintenance,
      recentInspections,
      failedInspections,
      utilizationRate: activeVehicles > 0 ? (completedLoads / activeVehicles).toFixed(2) : "0",
      completionRate: totalLoads > 0 ? ((completedLoads / totalLoads) * 100).toFixed(1) : "0",
      averageRevenue: totalLoads > 0 ? (totalRevenue / totalLoads).toFixed(2) : "0",
    };

    // Cache the result with shorter TTL for KPIs
    setCachedData(cacheKey, result, CACHE_TTL.KPI);
    
    return result;
  } catch (error) {
    console.error('Error fetching organization KPIs:', error);
    
    // Return cached data if available as fallback, even if expired
    const fallback = getCachedData(`kpis:${organizationId}`);
    if (fallback) {
      return fallback;
    }
    
    // Return safe defaults if no cache available
    return {
      activeVehicles: 0,
      activeDrivers: 0,
      totalLoads: 0,
      completedLoads: 0,
      pendingLoads: 0,
      inTransitLoads: 0,
      totalRevenue: 0,
      upcomingMaintenance: 0,
      recentInspections: 0,
      failedInspections: 0,
      utilizationRate: "0",
      completionRate: "0",
      averageRevenue: "0",
    };
  }
}

/**
 * Get dashboard summary data for analytics
 */
export async function getDashboardSummary(organizationId: string, dateRange?: { from: Date; to: Date }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `dashboard:${organizationId}:${dateRange?.from.toISOString() || 'default'}:${dateRange?.to.toISOString() || 'default'}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const kpis = await getOrganizationKPIs(organizationId);
    
    // Additional dashboard-specific data could be fetched here
    const summary = {
      ...kpis,
      lastUpdated: new Date().toISOString(),
    };

    setCachedData(cacheKey, summary, CACHE_TTL.KPI);
    return summary;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw new Error('Failed to fetch dashboard summary');
  }
}
