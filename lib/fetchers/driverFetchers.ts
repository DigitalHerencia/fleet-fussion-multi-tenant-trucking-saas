import { auth } from "@clerk/nextjs/server"
import { cache } from "react"
import { eq, and, like, or, inArray, gte, lte, desc, asc, sql, count, isNull } from "drizzle-orm"

import { db } from "@/lib/database/db"
import { drivers, driverDocuments, hoursOfService } from "@/lib/database/schema"
import { hasPermission } from "@/lib/auth/permissions"
import type { 
  Driver, 
  DriverListResponse, 
  DriverStatsResponse,
  DriverFilters,
  DriverPerformance,
  HoursOfService,
  DriverDocument
} from "@/types/drivers"

// ================== Core Fetchers ==================

/**
 * Get driver by ID with permission check
 */
export const getDriverById = cache(async (driverId: string): Promise<Driver | null> => {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) return null

    // Check permissions
    const canView = await hasPermission(userId, driver[0].tenantId, "drivers:read")
    if (!canView) return null

    return parseDriverData(driver[0])
  } catch (error) {
    console.error("Error fetching driver:", error)
    return null
  }
})

/**
 * List drivers by organization with filtering and pagination
 */
export const listDriversByOrg = cache(async (
  tenantId: string, 
  filters: DriverFilters = {}
): Promise<DriverListResponse> => {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { drivers: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    }

    // Check permissions
    const canView = await hasPermission(userId, tenantId, "drivers:read")
    if (!canView) {
      return { drivers: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    }

    // Build where conditions
    let whereConditions = [
      eq(drivers.tenantId, tenantId),
      eq(drivers.isActive, true)
    ]

    // Apply filters
    if (filters.search) {
      const searchTerm = `%${filters.search}%`
      whereConditions.push(
        or(
          like(drivers.firstName, searchTerm),
          like(drivers.lastName, searchTerm),
          like(drivers.email, searchTerm),
          like(drivers.cdlNumber, searchTerm),
          like(drivers.phone, searchTerm)
        )!
      )
    }

    if (filters.status && filters.status.length > 0) {
      whereConditions.push(inArray(drivers.status, filters.status))
    }

    if (filters.availabilityStatus && filters.availabilityStatus.length > 0) {
      whereConditions.push(inArray(drivers.availabilityStatus, filters.availabilityStatus))
    }

    if (filters.homeTerminal && filters.homeTerminal.length > 0) {
      whereConditions.push(inArray(drivers.homeTerminal, filters.homeTerminal))
    }

    if (filters.cdlClass && filters.cdlClass.length > 0) {
      whereConditions.push(inArray(drivers.cdlClass, filters.cdlClass))
    }

    // Expiration filters
    if (filters.cdlExpiringInDays !== undefined) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + filters.cdlExpiringInDays)
      whereConditions.push(lte(drivers.cdlExpiration, expirationDate.toISOString().split('T')[0]))
    }

    if (filters.medicalExpiringInDays !== undefined) {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + filters.medicalExpiringInDays)
      whereConditions.push(lte(drivers.medicalCardExpiration, expirationDate.toISOString().split('T')[0]))
    }

    // Performance filters
    if (filters.minSafetyScore !== undefined) {
      whereConditions.push(gte(drivers.safetyScore, filters.minSafetyScore))
    }

    if (filters.maxViolations !== undefined) {
      whereConditions.push(lte(drivers.violationCount, filters.maxViolations))
    }

    // Date filters
    if (filters.hiredAfter) {
      whereConditions.push(gte(drivers.hireDate, filters.hiredAfter))
    }

    if (filters.hiredBefore) {
      whereConditions.push(lte(drivers.hireDate, filters.hiredBefore))
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(drivers)
      .where(and(...whereConditions))

    const total = totalResult[0]?.count || 0

    // Calculate pagination
    const page = filters.page || 1
    const limit = Math.min(filters.limit || 20, 100)
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Build order by
    let orderBy
    const sortBy = filters.sortBy || 'firstName'
    const sortOrder = filters.sortOrder || 'asc'

    switch (sortBy) {
      case 'firstName':
        orderBy = sortOrder === 'desc' ? desc(drivers.firstName) : asc(drivers.firstName)
        break
      case 'lastName':
        orderBy = sortOrder === 'desc' ? desc(drivers.lastName) : asc(drivers.lastName)
        break
      case 'status':
        orderBy = sortOrder === 'desc' ? desc(drivers.status) : asc(drivers.status)
        break
      case 'hireDate':
        orderBy = sortOrder === 'desc' ? desc(drivers.hireDate) : asc(drivers.hireDate)
        break
      case 'cdlExpiration':
        orderBy = sortOrder === 'desc' ? desc(drivers.cdlExpiration) : asc(drivers.cdlExpiration)
        break
      case 'safetyScore':
        orderBy = sortOrder === 'desc' ? desc(drivers.safetyScore) : asc(drivers.safetyScore)
        break
      default:
        orderBy = asc(drivers.firstName)
    }

    // Fetch drivers
    const driverResults = await db
      .select()
      .from(drivers)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    const parsedDrivers = driverResults.map(parseDriverData)

    return {
      drivers: parsedDrivers,
      total,
      page,
      limit,
      totalPages
    }

  } catch (error) {
    console.error("Error listing drivers:", error)
    return { drivers: [], total: 0, page: 1, limit: 20, totalPages: 0 }
  }
})

/**
 * Get available drivers for assignment
 */
export const getAvailableDrivers = cache(async (tenantId: string): Promise<Driver[]> => {
  try {
    const { userId } = await auth()
    if (!userId) return []

    // Check permissions
    const canView = await hasPermission(userId, tenantId, "drivers:read")
    if (!canView) return []

    const availableDrivers = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.tenantId, tenantId),
          eq(drivers.isActive, true),
          eq(drivers.availabilityStatus, 'available'),
          inArray(drivers.status, ['available', 'on_duty'])
        )
      )
      .orderBy(asc(drivers.firstName), asc(drivers.lastName))

    return availableDrivers.map(parseDriverData)
  } catch (error) {
    console.error("Error fetching available drivers:", error)
    return []
  }
})

/**
 * Get driver statistics for dashboard
 */
export const getDriverStats = cache(async (tenantId: string): Promise<DriverStatsResponse | null> => {
  try {
    const { userId } = await auth()
    if (!userId) return null

    // Check permissions
    const canView = await hasPermission(userId, tenantId, "drivers:read")
    if (!canView) return null

    // Get various counts and stats
    const [
      totalDriversResult,
      activeDriversResult,
      availableDriversResult,
      drivingDriversResult,
      expiringCDLsResult,
      expiringMedicalsResult,
      safetyStatsResult,
      utilizationResult
    ] = await Promise.all([
      // Total drivers
      db.select({ count: count() })
        .from(drivers)
        .where(and(eq(drivers.tenantId, tenantId), eq(drivers.isActive, true))),
      
      // Active drivers (not terminated or inactive)
      db.select({ count: count() })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true),
            inArray(drivers.status, ['available', 'assigned', 'driving', 'on_duty'])
          )
        ),
      
      // Available drivers
      db.select({ count: count() })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true),
            eq(drivers.availabilityStatus, 'available')
          )
        ),
      
      // Currently driving
      db.select({ count: count() })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true),
            eq(drivers.status, 'driving')
          )
        ),
      
      // CDLs expiring in 30 days
      db.select({ count: count() })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true),
            lte(drivers.cdlExpiration, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          )
        ),
      
      // Medical cards expiring in 30 days
      db.select({ count: count() })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true),
            lte(drivers.medicalCardExpiration, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          )
        ),
      
      // Safety statistics
      db.select({
        avgSafetyScore: sql<number>`AVG(${drivers.safetyScore})::numeric`,
        totalViolations: sql<number>`SUM(${drivers.violationCount})::numeric`
      })
        .from(drivers)
        .where(
          and(
            eq(drivers.tenantId, tenantId),
            eq(drivers.isActive, true)
          )
        ),
      
      // TODO: Utilization calculation when load/assignment data is available
      Promise.resolve([{ utilization: 0 }])
    ])

    return {
      totalDrivers: totalDriversResult[0]?.count || 0,
      activeDrivers: activeDriversResult[0]?.count || 0,
      availableDrivers: availableDriversResult[0]?.count || 0,
      drivingDrivers: drivingDriversResult[0]?.count || 0,
      
      expiringCDLs: expiringCDLsResult[0]?.count || 0,
      expiringMedicals: expiringMedicalsResult[0]?.count || 0,
      
      averageSafetyScore: Number(safetyStatsResult[0]?.avgSafetyScore || 0),
      totalViolations: Number(safetyStatsResult[0]?.totalViolations || 0),
      
      utilizationRate: Number(utilizationResult[0]?.utilization || 0)
    }

  } catch (error) {
    console.error("Error fetching driver stats:", error)
    return null
  }
})

// ================== Document Fetchers ==================

/**
 * Get driver documents
 */
export const getDriverDocuments = cache(async (driverId: string): Promise<DriverDocument[]> => {
  try {
    const { userId } = await auth()
    if (!userId) return []

    // Get driver to check permissions
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) return []

    // Check permissions
    const canView = await hasPermission(userId, driver[0].tenantId, "drivers:read")
    if (!canView) return []

    const documents = await db
      .select()
      .from(driverDocuments)
      .where(eq(driverDocuments.driverId, driverId))
      .orderBy(desc(driverDocuments.createdAt))

    return documents.map(doc => ({
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt || new Date().toISOString()
    }))

  } catch (error) {
    console.error("Error fetching driver documents:", error)
    return []
  }
})

/**
 * Get expiring driver documents
 */
export const getExpiringDriverDocuments = cache(async (
  tenantId: string, 
  daysAhead: number = 30
): Promise<DriverDocument[]> => {
  try {
    const { userId } = await auth()
    if (!userId) return []

    // Check permissions
    const canView = await hasPermission(userId, tenantId, "drivers:read")
    if (!canView) return []

    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + daysAhead)

    const expiringDocs = await db
      .select({
        document: driverDocuments,
        driver: drivers
      })
      .from(driverDocuments)
      .innerJoin(drivers, eq(driverDocuments.driverId, drivers.id))
      .where(
        and(
          eq(drivers.tenantId, tenantId),
          eq(drivers.isActive, true),
          lte(driverDocuments.expirationDate, expirationDate.toISOString().split('T')[0]),
          eq(driverDocuments.status, 'active')
        )
      )
      .orderBy(asc(driverDocuments.expirationDate))

    return expiringDocs.map(({ document }) => ({
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: document.updatedAt || new Date().toISOString()
    }))

  } catch (error) {
    console.error("Error fetching expiring documents:", error)
    return []
  }
})

// ================== HOS Fetchers ==================

/**
 * Get driver HOS logs
 */
export const getDriverHOSLogs = cache(async (
  driverId: string,
  startDate: string,
  endDate: string
): Promise<HoursOfService[]> => {
  try {
    const { userId } = await auth()
    if (!userId) return []

    // Get driver to check permissions
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) return []

    // Check permissions
    const canView = await hasPermission(userId, driver[0].tenantId, "drivers:read")
    if (!canView) return []

    const hosLogs = await db
      .select()
      .from(hoursOfService)
      .where(
        and(
          eq(hoursOfService.driverId, driverId),
          gte(hoursOfService.date, startDate),
          lte(hoursOfService.date, endDate)
        )
      )
      .orderBy(desc(hoursOfService.date), desc(hoursOfService.startTime))

    return hosLogs.map(log => ({
      ...log,
      createdAt: log.createdAt || new Date().toISOString(),
      updatedAt: log.updatedAt || new Date().toISOString()
    }))

  } catch (error) {
    console.error("Error fetching HOS logs:", error)
    return []
  }
})

/**
 * Get current HOS status for driver
 */
export const getDriverCurrentHOS = cache(async (driverId: string): Promise<HoursOfService | null> => {
  try {
    const { userId } = await auth()
    if (!userId) return null

    // Get driver to check permissions
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) return null

    // Check permissions
    const canView = await hasPermission(userId, driver[0].tenantId, "drivers:read")
    if (!canView) return null

    const currentHOS = await db
      .select()
      .from(hoursOfService)
      .where(
        and(
          eq(hoursOfService.driverId, driverId),
          isNull(hoursOfService.endTime)
        )
      )
      .orderBy(desc(hoursOfService.startTime))
      .limit(1)

    if (!currentHOS[0]) return null

    return {
      ...currentHOS[0],
      createdAt: currentHOS[0].createdAt || new Date().toISOString(),
      updatedAt: currentHOS[0].updatedAt || new Date().toISOString()
    }

  } catch (error) {
    console.error("Error fetching current HOS:", error)
    return null
  }
})

// ================== Performance Fetchers ==================

/**
 * Get driver performance metrics
 */
export const getDriverPerformance = cache(async (
  driverId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  startDate?: string,
  endDate?: string
): Promise<DriverPerformance | null> => {
  try {
    const { userId } = await auth()
    if (!userId) return null

    // Get driver to check permissions
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) return null

    // Check permissions
    const canView = await hasPermission(userId, driver[0].tenantId, "drivers:read")
    if (!canView) return null

    // Calculate date range if not provided
    const now = new Date()
    let calculatedStartDate: string
    let calculatedEndDate: string

    if (startDate && endDate) {
      calculatedStartDate = startDate
      calculatedEndDate = endDate
    } else {
      calculatedEndDate = now.toISOString().split('T')[0]
      
      switch (period) {
        case 'daily':
          calculatedStartDate = calculatedEndDate
          break
        case 'weekly':
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          calculatedStartDate = weekStart.toISOString().split('T')[0]
          break
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          calculatedStartDate = monthStart.toISOString().split('T')[0]
          break
        case 'quarterly':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          calculatedStartDate = quarterStart.toISOString().split('T')[0]
          break
        case 'yearly':
          const yearStart = new Date(now.getFullYear(), 0, 1)
          calculatedStartDate = yearStart.toISOString().split('T')[0]
          break
      }
    }

    // TODO: Calculate actual performance metrics when load/assignment data is available
    // For now, return mock data structure
    return {
      driverId,
      period,
      startDate: calculatedStartDate,
      endDate: calculatedEndDate,
      
      metrics: {
        totalMiles: 0,
        totalHours: 0,
        totalLoads: 0,
        revenue: 0,
        
        milesPerGallon: 0,
        revenuePerMile: 0,
        utilizationRate: 0,
        
        safetyScore: driver[0].safetyScore || 0,
        violations: driver[0].violationCount || 0,
        accidents: driver[0].accidentCount || 0,
        inspectionScore: 0,
        
        onTimeDeliveryRate: driver[0].onTimeDeliveryRate || 0,
        averageDeliveryTime: 0,
        customerRating: 0,
        
        hosViolations: 0,
        availableHours: 0,
        usedHours: 0
      },
      
      calculatedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error("Error fetching driver performance:", error)
    return null
  }
})

// ================== Utility Functions ==================

/**
 * Parse driver data from database
 */
function parseDriverData(dbDriver: any): Driver {
  return {
    ...dbDriver,
    address: dbDriver.address ? JSON.parse(dbDriver.address) : undefined,
    currentLocation: dbDriver.currentLocation ? JSON.parse(dbDriver.currentLocation) : undefined,
    endorsements: dbDriver.endorsements ? JSON.parse(dbDriver.endorsements) : undefined,
    restrictions: dbDriver.restrictions ? JSON.parse(dbDriver.restrictions) : undefined,
    emergencyContact: dbDriver.emergencyContact ? JSON.parse(dbDriver.emergencyContact) : undefined,
    tags: dbDriver.tags ? JSON.parse(dbDriver.tags) : undefined,
    createdAt: dbDriver.createdAt || new Date().toISOString(),
    updatedAt: dbDriver.updatedAt || new Date().toISOString()
  }
}
