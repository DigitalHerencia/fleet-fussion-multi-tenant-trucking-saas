import { auth } from "@clerk/nextjs/server"

import prisma from "@/lib/database/db"
import type { 
  Driver, 
  DriverListResponse, 
  DriverStatsResponse,
  DriverFilters} from "@/types/drivers"

// ================== Utility Functions ==================

// Utility to map raw Prisma driver result to Driver type
function parseDriverData(raw: any): Driver {
  // Map all required fields from raw to Driver type
  return {
    id: raw.id,
    tenantId: raw.tenantId,
    homeTerminal: raw.homeTerminal,
    cdlNumber: raw.cdlNumber,
    cdlState: raw.cdlState,
    cdlClass: raw.cdlClass,
    cdlExpiration: raw.licenseExpiration,
    medicalCardExpiration: raw.medicalCardExpiration,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone,
    status: raw.status,
    availabilityStatus: raw.availabilityStatus,
    hireDate: raw.hireDate,
    safetyScore: raw.safetyScore,
    violationCount: raw.violationCount,
    accidentCount: raw.accidentCount,
    isActive: raw.isActive,
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    // ...add any other required fields from Driver type...
  }
}

// ================== Core Fetchers ==================

/**
 * Get driver by ID with permission check
 */
export const getDriverById = async (driverId: string): Promise<Driver | null> => {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        status: "active"
      },
      include: {
        organization: true,
        user: true,
        complianceDocuments: true,
      },
    })

    if (!driver) return null

    return parseDriverData(driver)
  } catch (error) {
    console.error("Error fetching driver:", error)
    return null
  }
}

/**
 * List drivers by organization with filtering and pagination
 */
export const listDriversByOrg = async (
  orgId: string, 
  filters: DriverFilters = {}
): Promise<DriverListResponse> => {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { drivers: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    }

    // Build Prisma where filter
    const where: any = {
      organizationId: orgId,
      // Only show active drivers by default
      status: { not: "terminated" }
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { licenseNumber: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } }
      ]
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status }
    }

    if (filters.availabilityStatus && filters.availabilityStatus.length > 0) {
      where.availabilityStatus = { in: filters.availabilityStatus }
    }

    if (filters.homeTerminal && filters.homeTerminal.length > 0) {
      where.homeTerminal = { in: filters.homeTerminal }
    }

    if (filters.cdlClass && filters.cdlClass.length > 0) {
      where.licenseClass = { in: filters.cdlClass }
    }

    // Expiration filters
    if (filters.cdlExpiringInDays !== undefined) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + filters.cdlExpiringInDays)
      where.licenseExpiration = { lte: expirationDate }
    }

    if (filters.medicalExpiringInDays !== undefined) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + filters.medicalExpiringInDays)
      where.medicalCardExpiration = { lte: expirationDate }
    }

    // Performance filters
    if (filters.minSafetyScore !== undefined) {
      where.safetyScore = { gte: filters.minSafetyScore }
    }

    if (filters.maxViolations !== undefined) {
      where.violationCount = { lte: filters.maxViolations }
    }

    // Date filters
    if (filters.hiredAfter) {
      where.hireDate = { ...(where.hireDate || {}), gte: new Date(filters.hiredAfter) }
    }
    if (filters.hiredBefore) {
      where.hireDate = { ...(where.hireDate || {}), lte: new Date(filters.hiredBefore) }
    }

    // Pagination
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)
    const skip = (page - 1) * limit

    // Sorting
    const sortBy = filters.sortBy || "firstName"
    const sortOrder = filters.sortOrder || "asc"
    const orderBy: any = {}
    switch (sortBy) {
      case "firstName":
        orderBy.firstName = sortOrder
        break
      case "lastName":
        orderBy.lastName = sortOrder
        break
      case "status":
        orderBy.status = sortOrder
        break
      case "hireDate":
        orderBy.hireDate = sortOrder
        break
      case "cdlExpiration":
        orderBy.licenseExpiration = sortOrder
        break
      case "safetyScore":
        orderBy.safetyScore = sortOrder
        break
      default:
        orderBy.firstName = "asc"
    }

    // Get total count
    const total = await prisma.driver.count({ where })

    // Fetch drivers
    const driverResults = await prisma.driver.findMany({
      where,
      orderBy,
      skip,
      take: limit
    })

    const parsedDriversData = driverResults.map(parseDriverData) as Driver[]

    return {
      drivers: parsedDriversData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

  } catch (error) {
    console.error("Error listing drivers:", error)
    return { drivers: [], total: 0, page: 1, limit: 20, totalPages: 0 }
  }
}

/**
 * Get available drivers for assignment
 */



/**
 * Get driver statistics for dashboard
 */
export const getDriverStats = async (orgId: string): Promise<DriverStatsResponse> => {
  try {
    // Example stats: total, active, inactive, expiring licenses, etc.
    const total = await prisma.driver.count({
      where: { organizationId: orgId }
    });
    const active = await prisma.driver.count({
      where: { organizationId: orgId, status: "active" }
    });
    
    const expiringLicenses = await prisma.driver.count({
      where: {
        organizationId: orgId,
        licenseExpiration: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // next 30 days
      }
    });

    const expiringMedicalCards = await prisma.driver.count({
      where: {
        organizationId: orgId,
        medicalCardExpiration: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }
    });

    // Return the stats object (fill in other fields as needed)
    return {
      totalDrivers: total,
      activeDrivers: active,
      availableDrivers: 0,
      drivingDrivers: 0,
      expiringCDLs: expiringLicenses,
      expiringMedicals: expiringMedicalCards,
      averageSafetyScore: 0,
      totalViolations: 0,
      utilizationRate: 0
      // ...default or calculated values for other stats...
    };
  } catch (error) {
    console.error("Error fetching driver stats:", error);
    return {
      totalDrivers: 0,
      activeDrivers: 0,
      availableDrivers: 0,
      drivingDrivers: 0,
      expiringCDLs: 0,
      expiringMedicals: 0,
      averageSafetyScore: 0,
      totalViolations: 0,
      utilizationRate: 0
      // ...default values for other stats...
    };
  }
}

// ================== HOS Fetchers ==================



// ================== Performance Fetchers ==================


