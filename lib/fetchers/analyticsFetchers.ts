"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/database/db";
import { getCachedData, setCachedData, CACHE_TTL } from "@/lib/cache/auth-cache";

/**
 * Get analytics data for performance metrics
 */
export async function getPerformanceAnalytics(
  organizationId: string, 
  timeRange: string = "30d"
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `analytics:performance:${organizationId}:${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get loads delivered over time
    const loadsData = await prisma.load.findMany({
      where: {
        organizationId,
        status: 'delivered',
        actualDeliveryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        actualDeliveryDate: true,
        actualMiles: true,
        rate: true,
      },
      orderBy: {
        actualDeliveryDate: 'asc',
      },
    });

    // Group data by date
    const performanceMetrics = groupDataByDate(loadsData, timeRange);
    
    setCachedData(cacheKey, performanceMetrics, CACHE_TTL.DATA);
    return performanceMetrics;
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    throw new Error('Failed to fetch performance analytics');
  }
}

/**
 * Get financial analytics data
 */
export async function getFinancialAnalytics(
  organizationId: string, 
  timeRange: string = "30d"
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `analytics:financial:${organizationId}:${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get revenue data
    const revenueData = await prisma.load.findMany({
      where: {
        organizationId,
        status: 'delivered',
        actualDeliveryDate: {
          gte: startDate,
          lte: endDate,
        },
        rate: {
          not: null,
        },
      },
      select: {
        actualDeliveryDate: true,
        rate: true,
        actualMiles: true,
      },
      orderBy: {
        actualDeliveryDate: 'asc',
      },
    });

    // Get expense data (using fuel purchases as proxy for expenses)
    const expenseData = await prisma.iftaFuelPurchase.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        amount: true,
        gallons: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const financialMetrics = {
      revenue: groupRevenueByDate(revenueData, timeRange),
      expenses: groupExpensesByDate(expenseData, timeRange),
      profitMargin: calculateProfitMargin(revenueData, expenseData, timeRange),
    };
    
    setCachedData(cacheKey, financialMetrics, CACHE_TTL.DATA);
    return financialMetrics;
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    throw new Error('Failed to fetch financial analytics');
  }
}

/**
 * Get driver performance analytics
 */
export async function getDriverAnalytics(
  organizationId: string, 
  timeRange: string = "30d"
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `analytics:drivers:${organizationId}:${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get driver performance data
    const driverData = await prisma.driver.findMany({
      where: {
        organizationId,
        status: 'active',
      },
      include: {
        loads: {
          where: {
            actualDeliveryDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
            rate: true,
            actualMiles: true,
            actualDeliveryDate: true,
            scheduledDeliveryDate: true,
          },
        },
      },
    });

    const driverPerformance = driverData.map(driver => {
      const loads = driver.loads;
      const completedLoads = loads.filter(load => load.status === 'delivered');
      const totalRevenue = completedLoads.reduce((sum, load) => sum + Number(load.rate || 0), 0);
      const totalMiles = completedLoads.reduce((sum, load) => sum + Number(load.actualMiles || 0), 0);
      
      // Calculate on-time delivery rate
      const onTimeDeliveries = completedLoads.filter(load => {
        if (!load.actualDeliveryDate || !load.scheduledDeliveryDate) return false;
        return new Date(load.actualDeliveryDate) <= new Date(load.scheduledDeliveryDate);
      });
      
      const onTimeRate = completedLoads.length > 0 
        ? (onTimeDeliveries.length / completedLoads.length) * 100 
        : 0;

      return {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        loadsCompleted: completedLoads.length,
        totalRevenue,
        totalMiles,
        averageRevenuePerMile: totalMiles > 0 ? totalRevenue / totalMiles : 0,
        onTimeDeliveryRate: onTimeRate,
      };
    });

    setCachedData(cacheKey, driverPerformance, CACHE_TTL.DATA);
    return driverPerformance;
  } catch (error) {
    console.error('Error fetching driver analytics:', error);
    throw new Error('Failed to fetch driver analytics');
  }
}

/**
 * Get vehicle utilization analytics
 */
export async function getVehicleAnalytics(
  organizationId: string, 
  timeRange: string = "30d"
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `analytics:vehicles:${organizationId}:${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get vehicle utilization data
    const vehicleData = await prisma.vehicle.findMany({
      where: {
        organizationId,
        status: 'active',
      },
      include: {
        loads: {
          where: {
            actualDeliveryDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
            actualMiles: true,
            actualDeliveryDate: true,
            actualPickupDate: true,
          },
        },
      },
    });

    const vehicleUtilization = vehicleData.map(vehicle => {
      const loads = vehicle.loads;
      const completedLoads = loads.filter(load => load.status === 'delivered');
      const totalMiles = completedLoads.reduce((sum, load) => sum + Number(load.actualMiles || 0), 0);
      
      // Calculate days in service (days with completed loads)
      const activeDays = new Set(
        completedLoads
          .map(load => load.actualDeliveryDate?.toDateString())
          .filter(Boolean)
      ).size;
      
      const totalDaysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const utilizationRate = totalDaysInPeriod > 0 ? (activeDays / totalDaysInPeriod) * 100 : 0;

      return {
        id: vehicle.id,
        unitNumber: vehicle.unitNumber,
        make: vehicle.make,
        model: vehicle.model,
        loadsCompleted: completedLoads.length,
        totalMiles,
        utilizationRate,
        activeDays,
      };
    });

    setCachedData(cacheKey, vehicleUtilization, CACHE_TTL.DATA);
    return vehicleUtilization;
  } catch (error) {
    console.error('Error fetching vehicle analytics:', error);
    throw new Error('Failed to fetch vehicle analytics');
  }
}

/**
 * Get dashboard summary for analytics overview
 */
export async function getDashboardSummary(organizationId: string, timeRange: string = "30d") {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cacheKey = `analytics:summary:${organizationId}:${timeRange}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { startDate, endDate } = getDateRange(timeRange);
    
    // Get summary metrics
    const [revenueData, loadsData, driversData, vehiclesData] = await Promise.all([
      prisma.load.aggregate({
        where: {
          organizationId,
          status: 'delivered',
          actualDeliveryDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          rate: true,
          actualMiles: true,
        },
        _count: {
          id: true,
        },
      }),
      
      prisma.load.count({
        where: {
          organizationId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      prisma.driver.count({
        where: {
          organizationId,
          status: 'active',
        },
      }),
      
      prisma.vehicle.count({
        where: {
          organizationId,
          status: 'active',
        },
      }),
    ]);

    const summary = {
      totalRevenue: Number(revenueData._sum.rate || 0),
      totalMiles: Number(revenueData._sum.actualMiles || 0),
      totalLoads: revenueData._count.id,
      activeDrivers: driversData,
      activeVehicles: vehiclesData,
      averageRevenuePerMile: revenueData._sum.actualMiles 
        ? Number(revenueData._sum.rate || 0) / Number(revenueData._sum.actualMiles) 
        : 0,
    };
    
    setCachedData(cacheKey, summary, CACHE_TTL.DATA);
    return summary;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw new Error('Failed to fetch dashboard summary');
  }
}

/**
 * Helper function to get date range based on time range string
 */
function getDateRange(timeRange: string) {
  const endDate = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'ytd':
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}

/**
 * Group load data by date for performance metrics
 */
function groupDataByDate(loads: any[], timeRange: string) {
  const grouped = new Map();
  
  loads.forEach(load => {
    if (!load.actualDeliveryDate) return;
    
    const date = new Date(load.actualDeliveryDate);
    const dateKey = getDateKey(date, timeRange);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: dateKey,
        loads: 0,
        miles: 0,
        revenue: 0,
      });
    }
    
    const entry = grouped.get(dateKey);
    entry.loads += 1;
    entry.miles += Number(load.actualMiles || 0);
    entry.revenue += Number(load.rate || 0);
  });
  
  return Array.from(grouped.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Group revenue data by date
 */
function groupRevenueByDate(loads: any[], timeRange: string) {
  const grouped = new Map();
  
  loads.forEach(load => {
    if (!load.actualDeliveryDate) return;
    
    const date = new Date(load.actualDeliveryDate);
    const dateKey = getDateKey(date, timeRange);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: dateKey,
        revenue: 0,
        loads: 0,
      });
    }
    
    const entry = grouped.get(dateKey);
    entry.revenue += Number(load.rate || 0);
    entry.loads += 1;
  });
  
  return Array.from(grouped.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Group expense data by date
 */
function groupExpensesByDate(expenses: any[], timeRange: string) {
  const grouped = new Map();
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const dateKey = getDateKey(date, timeRange);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date: dateKey,
        amount: 0,
        gallons: 0,
      });
    }
    
    const entry = grouped.get(dateKey);
    entry.amount += Number(expense.amount || 0);
    entry.gallons += Number(expense.gallons || 0);
  });
  
  return Array.from(grouped.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Calculate profit margin over time
 */
function calculateProfitMargin(revenueData: any[], expenseData: any[], timeRange: string) {
  const revenueByDate = groupRevenueByDate(revenueData, timeRange);
  const expenseByDate = groupExpensesByDate(expenseData, timeRange);
  
  const profitData = revenueByDate.map(revenueEntry => {
    const expenseEntry = expenseByDate.find(e => e.date === revenueEntry.date);
    const expenses = expenseEntry ? expenseEntry.amount : 0;
    const profit = revenueEntry.revenue - expenses;
    const margin = revenueEntry.revenue > 0 ? (profit / revenueEntry.revenue) * 100 : 0;
    
    return {
      date: revenueEntry.date,
      revenue: revenueEntry.revenue,
      expenses,
      profit,
      margin,
    };
  });
  
  return profitData;
}

/**
 * Get date key based on time range grouping
 */
function getDateKey(date: Date, timeRange: string): string {
  switch (timeRange) {
    case '7d':
    case '30d':
      return date.toISOString().split('T')[0]; // Daily grouping
    case '90d':
    case 'ytd':
      // Weekly grouping
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().split('T')[0];
    default:
      return date.toISOString().split('T')[0];
  }
}
