import { db } from "@/lib/database"
import { authCache } from "@/lib/cache/auth-cache"

// Cache for data fetchers with TTL-based expiration
const dataCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

const DATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for data queries
const KPI_CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache for KPIs (more frequent updates)

// Helper function to get cached data
function getCachedData<T>(key: string): T | null {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    dataCache.delete(key);
  }
  return null;
}

// Helper function to set cached data
function setCachedData<T>(key: string, data: T, ttl: number = DATA_CACHE_TTL): void {
  dataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

// Optimized batch query for KPIs with caching and minimal database hits
export async function getKPIs(organizationId: string) {
  const cacheKey = `kpis:${organizationId}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  try {
    // Batch all queries with Promise.all for better performance
    const [activeVehicles, activeDrivers, recentLoads] = await Promise.all([
      // Optimized count query - only count, don't fetch full records
      db.vehicle.count({
        where: {
          organizationId,
          status: "active",
        },
      }),
      
      // Optimized count query - only count, don't fetch full records  
      db.driver.count({
        where: {
          organizationId,
          status: "active",
        },
      }),
      
      // Only fetch necessary fields for calculations
      db.load.findMany({
        where: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          status: true,
          rate: true,
        },
      })
    ]);

    // Calculate load statistics efficiently
    const totalLoads = recentLoads.length
    const completedLoads = recentLoads.filter(load => load.status === "delivered").length
    const pendingLoads = recentLoads.filter(load => load.status === "pending").length
    const inTransitLoads = recentLoads.filter(load => load.status === "in_transit").length

    // Calculate revenue efficiently with reduce
    const totalRevenue = recentLoads.reduce((sum, load) => sum + (Number(load.rate) || 0), 0)

    // Placeholder for upcoming maintenance and inspections
    const upcomingMaintenance: any[] = []
    const recentInspections: any[] = []
    const failedInspections = 0

    const result = {
      activeVehicles,
      activeDrivers,
      totalLoads,
      completedLoads,
      pendingLoads,
      inTransitLoads,
      totalRevenue,
      upcomingMaintenance: upcomingMaintenance.length,
      recentInspections: recentInspections.length,
      failedInspections,
      utilizationRate: activeVehicles > 0 ? (completedLoads / activeVehicles).toFixed(2) : "0",
    };

    // Cache the result with shorter TTL for KPIs
    setCachedData(cacheKey, result, KPI_CACHE_TTL);
    
    return result;
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    // Return cached data if available, even if expired, as fallback
    const fallback = dataCache.get(cacheKey);
    if (fallback) {
      return fallback.data;
    }
    throw error;
  }
}

// Optimized loads fetcher with caching and efficient querying
export async function getLoads(organizationId: string, status?: string, driverId?: string) {
  const cacheKey = `loads:${organizationId}:${status || 'all'}:${driverId || 'all'}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const where: any = { organizationId }
  if (status) {
    where.status = status as "pending" | "assigned" | "in_transit" | "delivered" | "cancelled"
  }
  if (driverId) {
    where.driverId = driverId
  }

  try {
    const results = await db.load.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            unitNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      // Limit results to prevent memory issues with large datasets
      take: 1000,
    });

    // Efficiently map database fields to interface fields
    const mappedResults = results.map(load => ({
      ...load,
      pickupDate: load.scheduledPickupDate || load.createdAt,
      deliveryDate: load.scheduledDeliveryDate || load.createdAt,
      referenceNumber: load.referenceNumber || load.loadNumber,
      customerName: load.customerName || 'Unknown Customer',
      commodity: load.commodity || undefined,
      weight: load.weight || undefined,
      rate: load.rate ? Number(load.rate) : undefined,
    }));

    // Cache the result
    setCachedData(cacheKey, mappedResults);
    
    return mappedResults;
  } catch (error) {
    console.error('Error fetching loads:', error);
    // Return cached data if available as fallback
    const fallback = dataCache.get(cacheKey);
    if (fallback) {
      return fallback.data;
    }
    throw error;
  }
}

// Optimized vehicles fetcher with caching
export async function getVehicles(organizationId: string, status?: string) {
  const cacheKey = `vehicles:${organizationId}:${status || 'all'}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const where: any = { organizationId }
  if (status) {
    where.status = status as "active" | "inactive" | "maintenance" | "decommissioned"
  }

  try {
    const results = await db.vehicle.findMany({
      where,
      orderBy: { unitNumber: "asc" },
      // Add reasonable limit to prevent memory issues
      take: 500,
    });

    // Efficiently map null to undefined
    const mappedResults = results.map(vehicle => ({
      ...vehicle,
      make: vehicle.make ?? undefined,
      model: vehicle.model ?? undefined,
    }));

    // Cache the result
    setCachedData(cacheKey, mappedResults);
    
    return mappedResults;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    // Return cached data if available as fallback
    const fallback = dataCache.get(cacheKey);
    if (fallback) {
      return fallback.data;
    }
    throw error;
  }
}

// Optimized drivers fetcher with caching
export async function getDrivers(organizationId: string, status?: string) {
  const cacheKey = `drivers:${organizationId}:${status || 'all'}`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  const where: any = { organizationId }
  if (status) {
    where.status = status as "active" | "inactive" | "suspended" | "terminated"
  }

  try {
    const results = await db.driver.findMany({
      where,
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
      // Add reasonable limit to prevent memory issues
      take: 200,
    });

    // Efficiently map null to undefined
    const mappedResults = results.map(driver => ({
      ...driver,
      email: driver.email ?? undefined,
      phone: driver.phone ?? undefined,
    }));

    // Cache the result
    setCachedData(cacheKey, mappedResults);
    
    return mappedResults;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    // Return cached data if available as fallback
    const fallback = dataCache.get(cacheKey);
    if (fallback) {
      return fallback.data;
    }
    throw error;
  }
}

// Batch fetcher for multiple data types - reduces database round trips
export async function getBatchData(organizationId: string, options: {
  includeKpis?: boolean;
  includeLoads?: boolean;
  includeVehicles?: boolean;
  includeDrivers?: boolean;
  loadStatus?: string;
  vehicleStatus?: string;
  driverStatus?: string;
} = {}) {
  const {
    includeKpis = false,
    includeLoads = false,
    includeVehicles = false,
    includeDrivers = false,
    loadStatus,
    vehicleStatus,
    driverStatus,
  } = options;

  const batchCacheKey = `batch:${organizationId}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = getCachedData(batchCacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Execute all requested fetches in parallel
    const promises: Promise<any>[] = [];
    const resultKeys: string[] = [];

    if (includeKpis) {
      promises.push(getKPIs(organizationId));
      resultKeys.push('kpis');
    }

    if (includeLoads) {
      promises.push(getLoads(organizationId, loadStatus));
      resultKeys.push('loads');
    }

    if (includeVehicles) {
      promises.push(getVehicles(organizationId, vehicleStatus));
      resultKeys.push('vehicles');
    }

    if (includeDrivers) {
      promises.push(getDrivers(organizationId, driverStatus));
      resultKeys.push('drivers');
    }

    const results = await Promise.all(promises);
    
    // Build result object
    const batchResult: any = {};
    resultKeys.forEach((key, index) => {
      batchResult[key] = results[index];
    });

    // Cache batch result with shorter TTL
    setCachedData(batchCacheKey, batchResult, Math.min(KPI_CACHE_TTL, DATA_CACHE_TTL));
    
    return batchResult;
  } catch (error) {
    console.error('Error in batch fetch:', error);
    throw error;
  }
}

// Cache invalidation functions for when data changes
export function invalidateCache(organizationId: string, type?: 'kpis' | 'loads' | 'vehicles' | 'drivers') {
  if (type) {
    // Invalidate specific cache type
    const patterns = [
      `${type}:${organizationId}:`,
      `batch:${organizationId}:`
    ];
    
    for (const [key] of dataCache) {
      if (patterns.some(pattern => key.startsWith(pattern))) {
        dataCache.delete(key);
      }
    }
  } else {
    // Invalidate all cache for the organization
    for (const [key] of dataCache) {
      if (key.includes(`${organizationId}:`)) {
        dataCache.delete(key);
      }
    }
  }
}

// Cleanup function for old cache entries
export function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, value] of dataCache) {
    if (now - value.timestamp >= value.ttl) {
      dataCache.delete(key);
    }
  }
}

// Set up periodic cache cleanup
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 60 * 1000); // Clean up every minute
}

// Graceful shutdown cleanup
if (typeof process !== 'undefined') {
  const cleanup = () => {
    dataCache.clear();
  };
  
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}
