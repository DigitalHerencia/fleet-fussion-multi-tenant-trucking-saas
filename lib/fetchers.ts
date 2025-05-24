import { db } from "@/lib/database"

// Get KPIs for the dashboard
export async function getKPIs(organizationId: string) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Active vehicles count
  const activeVehicles = await db.query.vehicles.findMany({
    where: (vehicles, { eq, and }) => and(eq(vehicles.organizationId, organizationId), eq(vehicles.status, "active")),
    columns: { id: true },
  })

  // Active drivers count
  const activeDrivers = await db.query.drivers.findMany({
    where: (drivers, { eq, and }) => and(eq(drivers.organizationId, organizationId), eq(drivers.status, "active")),
    columns: { id: true },
  })

  // Loads in last 30 days
  const recentLoads = await db.query.loads.findMany({
    where: (loads, { eq, and, gte }) => and(eq(loads.organizationId, organizationId), gte(loads.createdAt, thirtyDaysAgo)),
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
  const query = db.query.loads.findMany({
    where: (loads, { eq, and }) => {
      const conditions = [eq(loads.organizationId, organizationId)]

      if (status) {
        conditions.push(eq(loads.status, status as "pending" | "assigned" | "in_transit" | "delivered" | "cancelled"))
      }

      if (driverId) {
        conditions.push(eq(loads.driverId, driverId))
      }

      return and(...conditions)
    },
    with: {
      driver: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      vehicle: {
        columns: {
          id: true,
          unitNumber: true,
        },
      },
    },
    orderBy: (loads, { desc }) => [desc(loads.createdAt)],
  })

  return query
}

// Get vehicles with their status
export async function getVehicles(organizationId: string, status?: string) {
  const query = db.query.vehicles.findMany({
    where: (vehicles, { eq, and }) => {
      const conditions = [eq(vehicles.organizationId, organizationId)]

      if (status) {
        conditions.push(eq(vehicles.status, status as "active" | "inactive" | "maintenance" | "decommissioned"))
      }

      return and(...conditions)
    },
    orderBy: (vehicles, { asc }) => [asc(vehicles.unitNumber)],
  })

  return query
}

// Get drivers with their status and assignment info
export async function getDrivers(organizationId: string, status?: string) {
  const query = db.query.drivers.findMany({
    where: (drivers, { eq, and }) => {
      const conditions = [eq(drivers.organizationId, organizationId)]

      if (status) {
        conditions.push(eq(drivers.status, status as "active" | "inactive" | "suspended" | "terminated"))
      }

      return and(...conditions)
    },
    orderBy: (drivers, { asc }) => [asc(drivers.lastName), asc(drivers.firstName)],
  })

  return query
}
