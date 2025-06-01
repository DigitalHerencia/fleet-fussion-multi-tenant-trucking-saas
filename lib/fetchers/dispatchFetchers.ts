"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/database/db";
import { loadFilterSchema, type LoadFilterInput } from "@/schemas/dispatch";
import type { Load, LoadStatus, LoadStatusEvent, TrackingUpdate, LoadAlert } from "@/types/dispatch";

// Helper function to check user permissions
async function checkUserAccess(orgId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  

  if (!userId) {
    throw new Error("User not found or not member of organization");
  }

  return userId;
}

// Get load by ID



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
    
    return {
    
      page,
      limit,
      
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

    
  } catch (error) {
    console.error("Error fetching load statistics:", error);
    throw new Error("Failed to fetch load statistics");
  }
}

// Get customer statistics
export async function getCustomerStatistics(orgId: string) {
  try {
    await checkUserAccess(orgId);

    
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

  } catch (error) {
    console.error("Error fetching load alerts:", error);
    throw new Error("Failed to fetch load alerts");
  }
}
