import { db } from "@/db"
import { 
    complianceDocuments, 
    hosLogs, 
    drivers, 
    vehicles, 
    inspections 
} from "@/db/schema"
import { eq, and, lte, gte, count, sql, desc, lt, isNull } from "drizzle-orm"
import { addDays, isAfter, isBefore, parseISO } from "date-fns"
import { cache } from "react";

type DeadlineItem = {
    type: string;
    name: string;
    dueIn: number;
    status: string;
};

/**
 * Fetches compliance documents for a specific company
 */

/**
 * Fetches HOS logs for a specific company
 */

/**
 * Fetches a specific HOS log by ID for a company
 */
export async function getHosLogById(id: string, companyId: string) {
    try {
        const log = await db.query.hosLogs.findFirst({
            where: and(
                eq(hosLogs.id, id),
                eq(hosLogs.companyId, companyId)
            )
        })
        if (!log) throw new Error("HOS log not found")
        return log
    } catch (error) {
        console.error("getHosLogById error:", error)
        throw new Error("Unable to load that HOS log")
    }
}

/**
 * Fetches driver compliance data for the dashboard
 */
export async function getDriverComplianceData(companyId: string) {
    try {
        // Get all drivers for the company
        const driversData = await db.select({
            id: drivers.id,
            firstName: drivers.firstName,
            lastName: drivers.lastName,
            licenseExpiration: drivers.licenseExpiration,
            medicalCardExpiration: drivers.medicalCardExpiration,
            status: drivers.status
        })
        .from(drivers)
        .where(eq(drivers.companyId, companyId))

        // Get HOS violations in the last 30 days
        const today = new Date()
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // Get violations for each driver
        const violationsQuery = await db.select({
            driverId: hosLogs.driverId,
            violationCount: count(hosLogs.id)
        })
        .from(hosLogs)
        .where(and(
            eq(hosLogs.companyId, companyId),
            gte(hosLogs.date, thirtyDaysAgo),
            eq(hosLogs.edited, true) // Edited logs might indicate violations
        ))
        .groupBy(hosLogs.driverId)

        // Create a map of driver IDs to violation counts
        const violationsMap = new Map()
        violationsQuery.forEach(v => {
            violationsMap.set(v.driverId, v.violationCount)
        })

        // Map driver data to compliance format
        return driversData.map(d => {
            const name = `${d.firstName} ${d.lastName}`
            const licenseExpiry = d.licenseExpiration
            const medicalExpiry = d.medicalCardExpiration
            
            // Determine compliance status based on license and medical card expiration
            let status = "Compliant"
            const warningThreshold = addDays(new Date(), 30) // Warning if expiring within 30 days
            
            if (licenseExpiry && isBefore(new Date(licenseExpiry), new Date())) {
                status = "Non-Compliant"
            } else if (medicalExpiry && isBefore(new Date(medicalExpiry), new Date())) {
                status = "Non-Compliant"
            } else if (licenseExpiry && isBefore(new Date(licenseExpiry), warningThreshold)) {
                status = "Warning"
            } else if (medicalExpiry && isBefore(new Date(medicalExpiry), warningThreshold)) {
                status = "Warning"
            }
            
            // Format violation data
            const violations = violationsMap.get(d.id) || 0
            const lastHosViolation = violations > 0 ? 
                thirtyDaysAgo.toISOString().split('T')[0] : // This is a simplification
                "None"
            
            return {
                id: d.id,
                name,
                status,
                licenseExpiry: licenseExpiry ? new Date(licenseExpiry).toISOString().split('T')[0] : 'N/A',
                medicalExpiry: medicalExpiry ? new Date(medicalExpiry).toISOString().split('T')[0] : 'N/A',
                lastHosViolation,
                dutyStatus: "Off Duty", // Would come from actual duty status tracking
                availableHours: 11 // Would come from HOS calculation
            }
        })
    } catch (error) {
        console.error("getDriverComplianceData error:", error)
        throw new Error("Unable to load driver compliance data")
    }
}

/**
 * Fetches vehicle compliance data for the dashboard
 */
export async function getVehicleComplianceData(companyId: string) {
    try {
        // Get all vehicles for the company
        const vehiclesData = await db.select({
            id: vehicles.id,
            unitNumber: vehicles.unitNumber,
            type: vehicles.type,
            status: vehicles.status,
            make: vehicles.make,
            model: vehicles.model,
            year: vehicles.year,
            vin: vehicles.vin,
            licensePlate: vehicles.licensePlate,
            state: vehicles.state,
            currentOdometer: vehicles.currentOdometer,
            lastOdometerUpdate: vehicles.lastOdometerUpdate
        })
        .from(vehicles)
        .where(eq(vehicles.companyId, companyId))
        
        // Get the latest inspection for each vehicle
        const latestInspections = await db.select({
            vehicleId: inspections.vehicleId,
            date: sql`MAX(${inspections.date})`.as('latest_date'),
            status: inspections.status
        })
        .from(inspections)
        .where(eq(inspections.companyId, companyId))
        .groupBy(inspections.vehicleId, inspections.status)
        
        // Create a map of vehicle IDs to their latest inspection
        const inspectionMap = new Map()
        latestInspections.forEach(i => {
            inspectionMap.set(i.vehicleId, { 
                date: i.date, 
                status: i.status
            })
        })

        // Map vehicle data to compliance format
        return vehiclesData.map(v => {
            const inspection = inspectionMap.get(v.id)
            
            // Determine compliance status based on vehicle status and inspections
            let complianceStatus = "Compliant"
            if (v.status !== "active") {
                complianceStatus = "Non-Compliant"
            } else if (inspection && inspection.status === "failed") {
                complianceStatus = "Non-Compliant"
            } else if (!inspection || isAfter(addDays(new Date(), -90), inspection.date ? new Date(inspection.date) : new Date())) {
                // Warning if no inspection in the last 90 days
                complianceStatus = "Warning"
            }
            
            // Calculate next inspection date (90 days after last inspection)
            const lastInspectionDate = inspection ? new Date(inspection.date) : new Date()
            const nextInspectionDate = addDays(lastInspectionDate, 90)
            
            // Mock registration expiry (would come from actual registration data)
            const today = new Date()
            const registrationExpiry = addDays(today, Math.floor(Math.random() * 365) + 30).toISOString().split('T')[0]
            
            // Determine if there are defects (simplified)
            const defects = inspection && inspection.status === "failed" ? "Major - Requires Attention" : "None"
            
            return {
                id: v.id,
                unitNumber: v.unitNumber,
                unit: v.unitNumber,
                status: complianceStatus,
                type: v.type ? v.type.charAt(0).toUpperCase() + v.type.slice(1) : '', // Capitalize type
                make: v.make,
                model: v.model,
                year: v.year,
                vin: v.vin,
                licensePlate: v.licensePlate,
                state: v.state,
                currentOdometer: v.currentOdometer,
                lastOdometerUpdate: v.lastOdometerUpdate,
                lastInspection: inspection ? new Date(inspection.date).toISOString().split('T')[0] : "None",
                nextInspection: nextInspectionDate.toISOString().split('T')[0],
                defects,
                registrationExpiry
            }
        })
    } catch (error) {
        console.error("getVehicleComplianceData error:", error)
        throw new Error("Unable to load vehicle compliance data")
    }
}

/**
 * Fetches compliance document data for the dashboard
 */
export async function getComplianceDocumentData(companyId: string) {
    try {
        const documents = await db.select({
            id: complianceDocuments.id,
            name: complianceDocuments.name,
            type: complianceDocuments.type,
            status: complianceDocuments.status,
            updatedAt: complianceDocuments.updatedAt,
            expirationDate: complianceDocuments.expirationDate,
            driverId: complianceDocuments.driverId,
            vehicleId: complianceDocuments.vehicleId
        })
        .from(complianceDocuments)
        .where(eq(complianceDocuments.companyId, companyId))
        
        return documents.map(doc => {
            // Determine who the document is assigned to
            let assignedTo = "Company"
            if (doc.driverId) assignedTo = "Driver"
            if (doc.vehicleId) assignedTo = "Vehicle"
            
            // If assignedTo is Driver or Vehicle and we have multiple of them, use "All Drivers" or "All Vehicles"
            if (assignedTo === "Driver" && documents.filter(d => d.driverId).length > 1) {
                assignedTo = "All Drivers"
            }
            if (assignedTo === "Vehicle" && documents.filter(d => d.vehicleId).length > 1) {
                assignedTo = "All Vehicles"
            }
            
            return {
                id: doc.id,
                name: doc.name,
                type: doc.type === "required" ? "Required" : "Optional",
                lastUpdated: doc.updatedAt ? doc.updatedAt.toISOString().split('T')[0] : undefined,
                status: doc.status === "active" ? "Complete" : "Incomplete",
                assignedTo
            }
        })
    } catch (error) {
        console.error("getComplianceDocumentData error:", error)
        throw new Error("Unable to load compliance document data")
    }
}

/**
 * Fetches compliance summary metrics for the dashboard
 */
export async function getComplianceSummaryMetrics(companyId: string) {
    try {
        // Get driver compliance metrics
        const driversData = await getDriverComplianceData(companyId)
        const totalDrivers = driversData.length
        const compliantDrivers = driversData.filter(d => d.status === "Compliant").length
        const driverComplianceRate = totalDrivers > 0 ? 
            Math.round((compliantDrivers / totalDrivers) * 100) : 0
        
        // Get vehicle compliance metrics
        const vehiclesData = await getVehicleComplianceData(companyId)
        const totalVehicles = vehiclesData.length
        const compliantVehicles = vehiclesData.filter(v => v.status === "Compliant").length
        const vehicleComplianceRate = totalVehicles > 0 ? 
            Math.round((compliantVehicles / totalVehicles) * 100) : 0
        
        // Get document compliance metrics
        const documentsData = await getComplianceDocumentData(companyId)
        const totalDocuments = documentsData.length
        const compliantDocuments = documentsData.filter(d => d.status === "Complete").length
        const documentComplianceRate = totalDocuments > 0 ? 
            Math.round((compliantDocuments / totalDocuments) * 100) : 0
        
        // Calculate HOS violations in the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const violations = await db.select({
            count: count()
        })
        .from(hosLogs)
        .where(and(
            eq(hosLogs.companyId, companyId),
            gte(hosLogs.date, thirtyDaysAgo),
            eq(hosLogs.edited, true) // simplified assumption that edited logs indicate violations
        ))
        
        const hosViolations = violations[0]?.count ?? 0
        
        return {
            driverCompliance: {
                rate: driverComplianceRate,
                total: totalDrivers,
                compliant: compliantDrivers,
                needAttention: totalDrivers - compliantDrivers
            },
            vehicleCompliance: {
                rate: vehicleComplianceRate,
                total: totalVehicles,
                compliant: compliantVehicles,
                needAttention: totalVehicles - compliantVehicles
            },
            documentCompliance: {
                rate: documentComplianceRate,
                total: totalDocuments,
                compliant: compliantDocuments,
                needAttention: totalDocuments - compliantDocuments
            },
            hosViolations
        }
    } catch (error) {
        console.error("getComplianceSummaryMetrics error:", error)
        throw new Error("Unable to load compliance summary metrics")
    }
}

/**
 * Fetches upcoming compliance deadlines for the dashboard
 */
export async function getUpcomingComplianceDeadlines(companyId: string): Promise<DeadlineItem[]> {
    try {
        const today = new Date()
        const thirtyDaysFromNow = addDays(today, 30)
        const deadlines: DeadlineItem[] = []

        // Get drivers with expiring documents
        const driverDeadlines = await db.select({
            id: drivers.id,
            firstName: drivers.firstName,
            lastName: drivers.lastName,
            licenseExpiration: drivers.licenseExpiration,
            medicalCardExpiration: drivers.medicalCardExpiration
        })
        .from(drivers)
        .where(and(
            eq(drivers.companyId, companyId),
            sql`(
                ${drivers.licenseExpiration} < ${thirtyDaysFromNow} AND ${drivers.licenseExpiration} >= ${today}
                OR 
                ${drivers.medicalCardExpiration} < ${thirtyDaysFromNow} AND ${drivers.medicalCardExpiration} >= ${today}
            )`
        ))
        
        // Process driver deadlines
        driverDeadlines.forEach(driver => {
            if (driver.licenseExpiration && 
                isAfter(new Date(driver.licenseExpiration), today) && 
                isBefore(new Date(driver.licenseExpiration), thirtyDaysFromNow)) {
                const daysUntil = Math.ceil((new Date(driver.licenseExpiration).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                deadlines.push({
                    type: "Driver CDL",
                    name: `${driver.firstName} ${driver.lastName}`,
                    dueIn: daysUntil,
                    status: daysUntil <= 15 ? "Expiring Soon" : "Upcoming"
                })
            }
            
            if (driver.medicalCardExpiration && 
                isAfter(new Date(driver.medicalCardExpiration), today) && 
                isBefore(new Date(driver.medicalCardExpiration), thirtyDaysFromNow)) {
                const daysUntil = Math.ceil((new Date(driver.medicalCardExpiration).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                deadlines.push({
                    type: "Driver Medical Card",
                    name: `${driver.firstName} ${driver.lastName}`,
                    dueIn: daysUntil,
                    status: daysUntil <= 15 ? "Expiring Soon" : "Upcoming"
                })
            }
        })

        // Add document expiration deadlines
        const documentDeadlines = await db.select({
            id: complianceDocuments.id,
            name: complianceDocuments.name,
            expirationDate: complianceDocuments.expirationDate,
            status: complianceDocuments.status
        })
        .from(complianceDocuments)
        .where(eq(complianceDocuments.companyId, companyId))

        documentDeadlines.forEach(doc => {
            if (doc.expirationDate) {
                const exp = new Date(doc.expirationDate)
                if (isAfter(exp, today) && isBefore(exp, thirtyDaysFromNow)) {
                    const daysUntil = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    deadlines.push({
                        type: "Document Expiration",
                        name: doc.name,
                        dueIn: daysUntil,
                        status: daysUntil <= 15 ? "Expiring Soon" : "Upcoming"
                    })
                } else if (isBefore(exp, today)) {
                    deadlines.push({
                        type: "Document Expiration",
                        name: doc.name,
                        dueIn: 0,
                        status: "Expired"
                    })
                }
            }
        })
        
        // Add quarterly IFTA deadlines if within 30 days
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()
        
        // IFTA due dates: Jan 31, Apr 30, Jul 31, Oct 31
        const iftaDueDates = [
            { quarter: "Q4", month: 1, day: 31 },
            { quarter: "Q1", month: 4, day: 30 },
            { quarter: "Q2", month: 7, day: 31 },
            { quarter: "Q3", month: 10, day: 31 }
        ]
        
        iftaDueDates.forEach(iftaDate => {
            // Determine year based on the due date (previous year if Q4)
            const iftaYear = iftaDate.quarter === "Q4" ? currentYear - 1 : currentYear
            const iftaDueDate = new Date(iftaYear, iftaDate.month - 1, iftaDate.day)
            
            // Check if the due date is within the next 30 days
            if (isAfter(iftaDueDate, today) && isBefore(iftaDueDate, thirtyDaysFromNow)) {
                const daysUntil = Math.ceil((iftaDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                deadlines.push({
                    type: "IFTA Filing",
                    name: `${iftaYear} - ${iftaDate.quarter}`,
                    dueIn: daysUntil,
                    status: daysUntil <= 15 ? "Due Soon" : "Upcoming"
                })
            }
        })
        
        // Sort deadlines by urgency (days until due)
        return deadlines.sort((a, b) => a.dueIn - b.dueIn)
    } catch (error) {
        console.error("getUpcomingComplianceDeadlines error:", error)
        throw new Error("Unable to load upcoming compliance deadlines")
    }
}
