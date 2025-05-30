"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/database";
import { loadFilterSchema, type LoadFilterInput } from "@/validations/dispatch";
import type { Load, LoadStatus, LoadStatusEvent, TrackingUpdate, LoadAlert } from "@/types/dispatch";

// Helper function to check user permissions
async function checkUserAccess(orgId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findFirst({
    where: {
      clerkUserId: userId,
      tenantId: orgId,
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found or not member of organization");
  }

  return user;
}

// Get load by ID
export async function getLoadById(loadId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const load = await prisma.load.findUnique({
      where: { id: loadId },
      include: {
        statusHistory: {
          orderBy: { timestamp: "desc" },
          include: {
            createdByUser: {
              select: { name: true, email: true },
            },
          },
        },
        trackingUpdates: {
          orderBy: { timestamp: "desc" },
          take: 50, // Limit to latest 50 tracking updates
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
          include: {
            uploadedByUser: {
              select: { name: true, email: true },
            },
          },
        },
        alerts: {
          where: { resolvedAt: null },
          orderBy: { createdAt: "desc" },
        },
        createdByUser: {
          select: { name: true, email: true },
        },
        lastModifiedByUser: {
          select: { name: true, email: true },
        },
      },
    });

    if (!load) {
      return null;
    }

    // Verify user has access to this load's tenant
    await checkUserAccess(load.tenantId);

    return load;
  } catch (error) {
    console.error("Error fetching load:", error);
    throw new Error("Failed to fetch load");
  }
}

// List loads by organization with filtering and pagination
export async function listLoadsByOrg(orgId: string, filters: LoadFilterInput = {}) {
  try {
    await checkUserAccess(orgId);

    const validatedFilters = loadFilterSchema.parse(filters);

    // Build where clause
    const where: any = {
      tenantId: orgId,
    };

    // Status filter
    if (validatedFilters.status && validatedFilters.status.length > 0 && !validatedFilters.status.includes("all")) {
      where.status = { in: validatedFilters.status };
    }

    // Priority filter
    if (validatedFilters.priority && validatedFilters.priority.length > 0) {
      where.priority = { in: validatedFilters.priority };
    }

    // Driver filter
    if (validatedFilters.driverId) {
      where.driverId = validatedFilters.driverId;
    }

    // Vehicle filter
    if (validatedFilters.vehicleId) {
      where.vehicleId = validatedFilters.vehicleId;
    }

    // Customer filter
    if (validatedFilters.customerId) {
      where.customer = {
        path: ["id"],
        equals: validatedFilters.customerId,
      };
    }

    // Date range filters
    if (validatedFilters.startDate || validatedFilters.endDate) {
      where.createdAt = {};
      if (validatedFilters.startDate) {
        where.createdAt.gte = new Date(validatedFilters.startDate);
      }
      if (validatedFilters.endDate) {
        where.createdAt.lte = new Date(validatedFilters.endDate);
      }
    }

    // Pickup date range
    if (validatedFilters.pickupDateFrom || validatedFilters.pickupDateTo) {
      where.pickupDate = {};
      if (validatedFilters.pickupDateFrom) {
        where.pickupDate.gte = new Date(validatedFilters.pickupDateFrom);
      }
      if (validatedFilters.pickupDateTo) {
        where.pickupDate.lte = new Date(validatedFilters.pickupDateTo);
      }
    }

    // Delivery date range
    if (validatedFilters.deliveryDateFrom || validatedFilters.deliveryDateTo) {
      where.deliveryDate = {};
      if (validatedFilters.deliveryDateFrom) {
        where.deliveryDate.gte = new Date(validatedFilters.deliveryDateFrom);
      }
      if (validatedFilters.deliveryDateTo) {
        where.deliveryDate.lte = new Date(validatedFilters.deliveryDateTo);
      }
    }

    // Origin state filter
    if (validatedFilters.originState) {
      where.origin = {
        path: ["state"],
        equals: validatedFilters.originState,
      };
    }

    // Destination state filter
    if (validatedFilters.destinationState) {
      where.destination = {
        path: ["state"],
        equals: validatedFilters.destinationState,
      };
    }

    // Equipment type filter
    if (validatedFilters.equipmentType && validatedFilters.equipmentType.length > 0) {
      where.equipment = {
        path: ["type"],
        in: validatedFilters.equipmentType,
      };
    }

    // Rate range filters
    if (validatedFilters.minRate || validatedFilters.maxRate) {
      where.rate = {
        path: ["total"],
      };
      if (validatedFilters.minRate) {
        where.rate.gte = validatedFilters.minRate;
      }
      if (validatedFilters.maxRate) {
        where.rate.lte = validatedFilters.maxRate;
      }
    }

    // Miles range filters
    if (validatedFilters.minMiles || validatedFilters.maxMiles) {
      where.OR = [
        {
          miles: {
            ...(validatedFilters.minMiles && { gte: validatedFilters.minMiles }),
            ...(validatedFilters.maxMiles && { lte: validatedFilters.maxMiles }),
          },
        },
        {
          estimatedMiles: {
            ...(validatedFilters.minMiles && { gte: validatedFilters.minMiles }),
            ...(validatedFilters.maxMiles && { lte: validatedFilters.maxMiles }),
          },
        },
      ];
    }

    // Tags filter
    if (validatedFilters.tags && validatedFilters.tags.length > 0) {
      where.tags = {
        hasSome: validatedFilters.tags,
      };
    }

    // Search filter
    if (validatedFilters.search) {
      const searchTerm = validatedFilters.search;
      where.OR = [
        { referenceNumber: { contains: searchTerm, mode: "insensitive" } },
        { customer: { path: ["name"], string_contains: searchTerm } },
        { origin: { path: ["name"], string_contains: searchTerm } },
        { origin: { path: ["city"], string_contains: searchTerm } },
        { origin: { path: ["state"], string_contains: searchTerm } },
        { destination: { path: ["name"], string_contains: searchTerm } },
        { destination: { path: ["city"], string_contains: searchTerm } },
        { destination: { path: ["state"], string_contains: searchTerm } },
        { cargo: { path: ["description"], string_contains: searchTerm } },
        { notes: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    const orderBy: any = {};
    const sortBy = validatedFilters.sortBy || "pickupDate";
    const sortOrder = validatedFilters.sortOrder || "asc";

    if (sortBy === "customer") {
      orderBy.customer = { path: ["name"], sort: sortOrder };
    } else if (sortBy === "rate") {
      orderBy.rate = { path: ["total"], sort: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Pagination
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 50;
    const skip = (page - 1) * limit;

    // Execute queries
    const [loads, totalCount] = await Promise.all([
      prisma.load.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          statusHistory: {
            orderBy: { timestamp: "desc" },
            take: 1, // Only latest status for list view
          },
          alerts: {
            where: { resolvedAt: null },
            select: { severity: true, type: true },
          },
          assignedDriver: {
            select: { name: true, phone: true },
          },
          assignedVehicle: {
            select: { unit: true, make: true, model: true },
          },
        },
      }),
      prisma.load.count({ where }),
    ]);

    return {
      loads,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching loads:", error);
    throw new Error("Failed to fetch loads");
  }
}

// Get active loads for dispatch board
export async function getActiveLoadsForDispatchBoard(orgId: string) {
  try {
    await checkUserAccess(orgId);

    const loads = await prisma.load.findMany({
      where: {
        tenantId: orgId,
        status: {
          in: ["pending", "booked", "confirmed", "assigned", "dispatched", "in_transit", "at_pickup", "picked_up", "en_route", "at_delivery"],
        },
      },
      orderBy: [
        { priority: "desc" },
        { pickupDate: "asc" },
      ],
      include: {
        statusHistory: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        trackingUpdates: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
        alerts: {
          where: { resolvedAt: null },
        },
        assignedDriver: {
          select: { id: true, name: true, phone: true, status: true },
        },
        assignedVehicle: {
          select: { id: true, unit: true, make: true, model: true, status: true },
        },
        assignedTrailer: {
          select: { id: true, unit: true, type: true, status: true },
        },
      },
    });

    return loads;
  } catch (error) {
    console.error("Error fetching dispatch board loads:", error);
    throw new Error("Failed to fetch dispatch board loads");
  }
}

// Get available drivers for load assignment
export async function getAvailableDriversForLoad(orgId: string, loadRequirements: any = {}) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      tenantId: orgId,
      status: "available",
      isActive: true,
    };

    // Add CDL requirements if specified
    if (loadRequirements.cdlClass) {
      where.cdlClass = { in: loadRequirements.cdlClass };
    }

    // Add endorsement requirements if specified
    if (loadRequirements.endorsements && loadRequirements.endorsements.length > 0) {
      where.endorsements = {
        hasSome: loadRequirements.endorsements,
      };
    }

    // Add experience requirements if specified
    if (loadRequirements.minimumExperience) {
      where.experienceYears = {
        gte: loadRequirements.minimumExperience,
      };
    }

    const drivers = await prisma.driver.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        licenseNumber: true,
        cdlClass: true,
        endorsements: true,
        experienceYears: true,
        currentLocation: true,
        lastLocationUpdate: true,
        status: true,
        availability: true,
      },
    });

    return drivers;
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    throw new Error("Failed to fetch available drivers");
  }
}

// Get available vehicles for load assignment
export async function getAvailableVehiclesForLoad(orgId: string, loadRequirements: any = {}) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      tenantId: orgId,
      status: "available",
      isActive: true,
    };

    // Add equipment type requirements if specified
    if (loadRequirements.vehicleType) {
      where.type = loadRequirements.vehicleType;
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: [
        { unit: "asc" },
      ],
      select: {
        id: true,
        unit: true,
        make: true,
        model: true,
        year: true,
        type: true,
        fuelType: true,
        currentOdometer: true,
        status: true,
        currentLocation: true,
        licensePlate: true,
      },
    });

    return vehicles;
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    throw new Error("Failed to fetch available vehicles");
  }
}

// Get available trailers for load assignment
export async function getAvailableTrailersForLoad(orgId: string, loadRequirements: any = {}) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      tenantId: orgId,
      status: "available",
      isActive: true,
    };

    // Add trailer type requirements if specified
    if (loadRequirements.trailerType) {
      where.type = loadRequirements.trailerType;
    }

    // Add length requirements if specified
    if (loadRequirements.minimumLength) {
      where.length = {
        gte: loadRequirements.minimumLength,
      };
    }

    const trailers = await prisma.trailer.findMany({
      where,
      orderBy: [
        { unit: "asc" },
      ],
      select: {
        id: true,
        unit: true,
        type: true,
        make: true,
        model: true,
        year: true,
        length: true,
        status: true,
        licensePlate: true,
      },
    });

    return trailers;
  } catch (error) {
    console.error("Error fetching available trailers:", error);
    throw new Error("Failed to fetch available trailers");
  }
}

// Get load statistics for dashboard
export async function getLoadStatistics(orgId: string, dateRange: { from: Date; to: Date } = {
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  to: new Date(),
}) {
  try {
    await checkUserAccess(orgId);

    const where = {
      tenantId: orgId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    };

    const [
      totalLoads,
      completedLoads,
      activeLoads,
      cancelledLoads,
      statusBreakdown,
      priorityBreakdown,
      revenueStats,
      milesStats,
    ] = await Promise.all([
      prisma.load.count({ where }),
      prisma.load.count({ 
        where: { ...where, status: { in: ["completed", "delivered", "invoiced", "paid"] } }
      }),
      prisma.load.count({ 
        where: { ...where, status: { in: ["assigned", "dispatched", "in_transit", "at_pickup", "picked_up", "en_route", "at_delivery"] } }
      }),
      prisma.load.count({ 
        where: { ...where, status: "cancelled" }
      }),
      prisma.load.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),
      prisma.load.groupBy({
        by: ["priority"],
        where,
        _count: true,
      }),
      prisma.load.aggregate({
        where,
        _sum: {
          rate: { path: ["total"] },
        },
        _avg: {
          rate: { path: ["total"] },
        },
      }),
      prisma.load.aggregate({
        where,
        _sum: {
          miles: true,
          estimatedMiles: true,
        },
        _avg: {
          miles: true,
          estimatedMiles: true,
        },
      }),
    ]);

    return {
      totalLoads,
      completedLoads,
      activeLoads,
      cancelledLoads,
      completionRate: totalLoads > 0 ? (completedLoads / totalLoads) * 100 : 0,
      cancellationRate: totalLoads > 0 ? (cancelledLoads / totalLoads) * 100 : 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      priorityBreakdown: priorityBreakdown.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      revenue: {
        total: revenueStats._sum.rate || 0,
        average: revenueStats._avg.rate || 0,
      },
      miles: {
        totalActual: milesStats._sum.miles || 0,
        totalEstimated: milesStats._sum.estimatedMiles || 0,
        averageActual: milesStats._avg.miles || 0,
        averageEstimated: milesStats._avg.estimatedMiles || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching load statistics:", error);
    throw new Error("Failed to fetch load statistics");
  }
}

// Get customer statistics
export async function getCustomerStatistics(orgId: string) {
  try {
    await checkUserAccess(orgId);

    const loads = await prisma.load.findMany({
      where: { tenantId: orgId },
      select: {
        customer: true,
        rate: true,
        status: true,
        createdAt: true,
      },
    });

    const customerStats = loads.reduce((acc, load) => {
      const customerId = (load.customer as any)?.id || "unknown";
      const customerName = (load.customer as any)?.name || "Unknown";
      
      if (!acc[customerId]) {
        acc[customerId] = {
          id: customerId,
          name: customerName,
          loadCount: 0,
          totalRevenue: 0,
          completedLoads: 0,
          lastLoadDate: null,
        };
      }

      acc[customerId].loadCount++;
      acc[customerId].totalRevenue += (load.rate as any)?.total || 0;
      
      if (["completed", "delivered", "invoiced", "paid"].includes(load.status)) {
        acc[customerId].completedLoads++;
      }

      if (!acc[customerId].lastLoadDate || load.createdAt > acc[customerId].lastLoadDate) {
        acc[customerId].lastLoadDate = load.createdAt;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(customerStats).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  } catch (error) {
    console.error("Error fetching customer statistics:", error);
    throw new Error("Failed to fetch customer statistics");
  }
}

// Get load alerts
export async function getLoadAlerts(orgId: string, severity?: string[]) {
  try {
    await checkUserAccess(orgId);

    const where: any = {
      load: {
        tenantId: orgId,
      },
      resolvedAt: null,
    };

    if (severity && severity.length > 0) {
      where.severity = { in: severity };
    }

    const alerts = await prisma.loadAlert.findMany({
      where,
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        load: {
          select: {
            id: true,
            referenceNumber: true,
            status: true,
            customer: true,
          },
        },
      },
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching load alerts:", error);
    throw new Error("Failed to fetch load alerts");
  }
}
