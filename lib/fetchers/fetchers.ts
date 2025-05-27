import { db } from "@/lib/database"

// Get KPIs for the dashboard
export async function getKPIs(organizationId: string) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Active vehicles count
  const activeVehicles = await db.vehicle.findMany({
    where: {
      organizationId,
      status: "active",
    },
    select: { id: true },
  })

  // Active drivers count
  const activeDrivers = await db.driver.findMany({
    where: {
      organizationId,
      status: "active",
    },
    select: { id: true },
  })

  // Loads in last 30 days
  const recentLoads = await db.load.findMany({
    where: {
      organizationId,
      createdAt: { gte: thirtyDaysAgo },
    },
  })

  // Calculate load statistics
  const totalLoads = recentLoads.length
  const completedLoads = recentLoads.filter((load: { status: string }) => load.status === "delivered").length
  const pendingLoads = recentLoads.filter((load: { status: string }) => load.status === "pending").length
  const inTransitLoads = recentLoads.filter((load: { status: string }) => load.status === "in_transit").length

  // Calculate revenue and miles
  const totalRevenue = recentLoads.reduce((sum: number, load: { rate: any }) => sum + (Number(load.rate) || 0), 0)

  // Placeholder for upcoming maintenance (table not implemented yet)
  const upcomingMaintenance: any[] = []

  // Placeholder for recent inspections (table not implemented yet)
  const recentInspections: any[] = []
  const failedInspections = 0

  return {
    activeVehicles: activeVehicles.length,
    activeDrivers: activeDrivers.length,
    totalLoads,
    completedLoads,
    pendingLoads,
    inTransitLoads,
    totalRevenue,
    upcomingMaintenance: upcomingMaintenance.length,
    recentInspections: recentInspections.length,
    failedInspections,
    utilizationRate: activeVehicles.length > 0 ? (completedLoads / activeVehicles.length).toFixed(2) : 0,
  }
}

// Get loads for the dispatch board
export async function getLoads(organizationId: string, status?: string, driverId?: string) {
  const where: any = { organizationId }
  if (status) {
    where.status = status as "pending" | "assigned" | "in_transit" | "delivered" | "cancelled"
  }
  if (driverId) {
    where.driverId = driverId
  }

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
  })

  // Map database fields to interface fields
  return results.map((load: { scheduledPickupDate: any; createdAt: any; scheduledDeliveryDate: any; referenceNumber: any; loadNumber: any; customerName: any; commodity: any; weight: any; rate: any }) => ({
    ...load,
    pickupDate: load.scheduledPickupDate || load.createdAt,
    deliveryDate: load.scheduledDeliveryDate || load.createdAt,
    referenceNumber: load.referenceNumber || load.loadNumber,
    customerName: load.customerName || 'Unknown Customer',
    commodity: load.commodity || undefined,
    weight: load.weight || undefined,
    rate: load.rate ? Number(load.rate) : undefined,
  }))
}

// Get vehicles with their status
export async function getVehicles(organizationId: string, status?: string) {
  const where: any = { organizationId }
  if (status) {
    where.status = status as "active" | "inactive" | "maintenance" | "decommissioned"
  }

  const results = await db.vehicle.findMany({
    where,
    orderBy: { unitNumber: "asc" },
  })

  // Ensure consistent typing (null to undefined mapping if needed)
  return results.map((vehicle: { make: any; model: any }) => ({
    ...vehicle,
    make: vehicle.make ?? undefined,
    model: vehicle.model ?? undefined,
  }))
}

// Get drivers with their status and assignment info
export async function getDrivers(organizationId: string, status?: string) {
  const where: any = { organizationId }
  if (status) {
    where.status = status as "active" | "inactive" | "suspended" | "terminated"
  }

  const results = await db.driver.findMany({
    where,
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  })

  // Ensure consistent typing (null to undefined mapping if needed)
  return results.map((driver: { email: any; phone: any }) => ({
    ...driver,
    email: driver.email ?? undefined,
    phone: driver.phone ?? undefined,
  }))
}
