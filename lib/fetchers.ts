import { db } from "@/db"

// Get KPIs for the dashboard
export async function getKPIs(companyId: string) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Active vehicles count
  const activeVehicles = await db.query.vehicles.findMany({
    where: (vehicles, { eq, and }) => and(eq(vehicles.companyId, companyId), eq(vehicles.status, "active")),
    columns: { id: true },
  })

  // Active drivers count
  const activeDrivers = await db.query.drivers.findMany({
    where: (drivers, { eq, and }) => and(eq(drivers.companyId, companyId), eq(drivers.status, "active")),
    columns: { id: true },
  })

  // Loads in last 30 days
  const recentLoads = await db.query.loads.findMany({
    where: (loads, { eq, and, gte }) => and(eq(loads.companyId, companyId), gte(loads.createdAt, thirtyDaysAgo)),
    columns: { id: true, status: true, miles: true, rate: true },
  })

  // Calculate load statistics
  const totalLoads = recentLoads.length
  const completedLoads = recentLoads.filter((load) => load.status === "completed").length
  const pendingLoads = recentLoads.filter((load) => load.status === "pending").length
  const inTransitLoads = recentLoads.filter((load) => load.status === "in_transit").length

  // Calculate revenue and miles
  const totalMiles = recentLoads.reduce((sum, load) => sum + (load.miles || 0), 0)
  const totalRevenue = recentLoads.reduce((sum, load) => sum + (Number(load.rate) || 0), 0)

  // Upcoming maintenance
  const upcomingMaintenance = await db.query.maintenanceRecords.findMany({
    where: (records, { eq, and, gte, lte }) =>
      and(
        eq(records.companyId, companyId),
        eq(records.status, "scheduled"),
        gte(records.scheduledDate, today),
        lte(records.scheduledDate, new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // Next 7 days
      ),
    columns: { id: true },
  })

  // Recent inspections
  const recentInspections = await db.query.inspections.findMany({
    where: (inspections, { eq, and, gte }) =>
      and(eq(inspections.companyId, companyId), gte(inspections.date, thirtyDaysAgo)),
    columns: { id: true, status: true },
  })

  const failedInspections = recentInspections.filter((inspection) => inspection.status === "failed").length

  return {
    activeVehicles: activeVehicles.length,
    activeDrivers: activeDrivers.length,
    totalLoads,
    completedLoads,
    pendingLoads,
    inTransitLoads,
    totalMiles,
    totalRevenue,
    upcomingMaintenance: upcomingMaintenance.length,
    recentInspections: recentInspections.length,
    failedInspections,
    utilizationRate: activeVehicles.length > 0 ? (completedLoads / activeVehicles.length).toFixed(2) : 0,
    revenuePerMile: totalMiles > 0 ? (totalRevenue / totalMiles).toFixed(2) : 0,
  }
}

// Get loads for the dispatch board
export async function getLoads(companyId: string, status?: string, driverId?: string) {
  const query = db.query.loads.findMany({
    where: (loads, { eq, and }) => {
      const conditions = [eq(loads.companyId, companyId)]

      if (status) {
        conditions.push(eq(loads.status, status))
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

// Get vehicles with their status and maintenance info
export async function getVehicles(companyId: string, status?: string) {
  const query = db.query.vehicles.findMany({
    where: (vehicles, { eq, and }) => {
      const conditions = [eq(vehicles.companyId, companyId)]

      if (status) {
        conditions.push(eq(vehicles.status, status))
      }

      return and(...conditions)
    },
    with: {
      maintenanceRecords: {
        where: (records, { eq }) => eq(records.status, "scheduled"),
        orderBy: (records, { asc }) => [asc(records.scheduledDate)],
        limit: 1,
      },
    },
    orderBy: (vehicles, { asc }) => [asc(vehicles.unitNumber)],
  })

  return query
}

// Get drivers with their status and assignment info
export async function getDrivers(companyId: string, status?: string) {
  const query = db.query.drivers.findMany({
    where: (drivers, { eq, and }) => {
      const conditions = [eq(drivers.companyId, companyId)]

      if (status) {
        conditions.push(eq(drivers.status, status))
      }

      return and(...conditions)
    },
    orderBy: (drivers, { asc }) => [asc(drivers.lastName), asc(drivers.firstName)],
  })

  return query
}
