"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { db } from "@/lib/database/db"
import { drivers, driverDocuments, hoursOfService, auditLogs } from "@/lib/database/schema"
import { 
  driverFormSchema, 
  driverUpdateSchema, 
  driverStatusUpdateSchema,
  driverDocumentSchema,
  hosEntrySchema,
  driverAssignmentSchema,
  driverBulkUpdateSchema
} from "@/validations/drivers"
import { hasPermission } from "@/lib/auth/permissions"
import { createAuditLog } from "@/lib/utils/audit"
import { eq, and, like, or, inArray, gte, lte, desc, asc, sql, count } from "drizzle-orm"
import type { 
  Driver, 
  DriverFormData, 
  DriverUpdateData, 
  DriverActionResult,
  DriverListResponse,
  DriverStatsResponse,
  DriverBulkActionResult
} from "@/types/drivers"

// ================== Core CRUD Operations ==================

/**
 * Create a new driver
 */
export async function createDriverAction(
  tenantId: string,
  data: DriverFormData
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Validate permissions
    const canCreate = await hasPermission(userId, tenantId, "drivers:create")
    if (!canCreate) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Validate input data
    const validatedData = driverFormSchema.parse(data)

    // Check for duplicate CDL number within tenant
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.tenantId, tenantId),
          eq(drivers.cdlNumber, validatedData.cdlNumber),
          eq(drivers.isActive, true)
        )
      )
      .limit(1)

    if (existingDriver.length > 0) {
      return { 
        success: false, 
        error: "A driver with this CDL number already exists", 
        code: "DUPLICATE_CDL" 
      }
    }

    // Check for duplicate email within tenant
    const existingEmail = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.tenantId, tenantId),
          eq(drivers.email, validatedData.email),
          eq(drivers.isActive, true)
        )
      )
      .limit(1)

    if (existingEmail.length > 0) {
      return { 
        success: false, 
        error: "A driver with this email already exists", 
        code: "DUPLICATE_EMAIL" 
      }
    }

    // Create driver record
    const newDriver = await db
      .insert(drivers)
      .values({
        tenantId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        dateOfBirth: validatedData.dateOfBirth || null,
        address: validatedData.address ? JSON.stringify(validatedData.address) : null,
        
        employeeId: validatedData.employeeId || null,
        hireDate: validatedData.hireDate,
        payRate: validatedData.payRate || null,
        payType: validatedData.payType || null,
        homeTerminal: validatedData.homeTerminal,
        
        cdlNumber: validatedData.cdlNumber,
        cdlState: validatedData.cdlState,
        cdlClass: validatedData.cdlClass,
        cdlExpiration: validatedData.cdlExpiration,
        endorsements: validatedData.endorsements ? JSON.stringify(validatedData.endorsements) : null,
        restrictions: validatedData.restrictions ? JSON.stringify(validatedData.restrictions) : null,
        
        medicalCardNumber: validatedData.medicalCardNumber || null,
        medicalCardExpiration: validatedData.medicalCardExpiration,
        
        status: 'available',
        availabilityStatus: 'available',
        isActive: true,
        violationCount: 0,
        accidentCount: 0,
        
        emergencyContact: validatedData.emergencyContact ? JSON.stringify(validatedData.emergencyContact) : null,
        notes: validatedData.notes || null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning()

    if (!newDriver[0]) {
      return { success: false, error: "Failed to create driver", code: "CREATE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId,
      userId,
      action: "driver.created",
      entityType: "driver",
      entityId: newDriver[0].id,
      details: { 
        driverName: `${validatedData.firstName} ${validatedData.lastName}`,
        cdlNumber: validatedData.cdlNumber 
      }
    })

    revalidatePath(`/dashboard/${tenantId}/drivers`)
    
    return { 
      success: true, 
      data: newDriver[0] as Driver
    }

  } catch (error) {
    console.error("Error creating driver:", error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data", 
        code: "VALIDATION_ERROR" 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to create driver", 
      code: "INTERNAL_ERROR" 
    }
  }
}

/**
 * Update an existing driver
 */
export async function updateDriverAction(
  driverId: string,
  data: DriverUpdateData
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get existing driver to check permissions
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!existingDriver[0]) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    const canUpdate = await hasPermission(userId, existingDriver[0].tenantId, "drivers:update")
    if (!canUpdate) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Validate input data
    const validatedData = driverUpdateSchema.parse(data)

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    }

    // Update only provided fields
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone
    if (validatedData.address !== undefined) updateData.address = validatedData.address ? JSON.stringify(validatedData.address) : null
    if (validatedData.payRate !== undefined) updateData.payRate = validatedData.payRate
    if (validatedData.payType !== undefined) updateData.payType = validatedData.payType
    if (validatedData.homeTerminal !== undefined) updateData.homeTerminal = validatedData.homeTerminal
    if (validatedData.cdlExpiration !== undefined) updateData.cdlExpiration = validatedData.cdlExpiration
    if (validatedData.endorsements !== undefined) updateData.endorsements = validatedData.endorsements ? JSON.stringify(validatedData.endorsements) : null
    if (validatedData.restrictions !== undefined) updateData.restrictions = validatedData.restrictions ? JSON.stringify(validatedData.restrictions) : null
    if (validatedData.medicalCardExpiration !== undefined) updateData.medicalCardExpiration = validatedData.medicalCardExpiration
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.availabilityStatus !== undefined) updateData.availabilityStatus = validatedData.availabilityStatus
    if (validatedData.emergencyContact !== undefined) updateData.emergencyContact = validatedData.emergencyContact ? JSON.stringify(validatedData.emergencyContact) : null
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null

    // Update driver
    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning()

    if (!updatedDriver[0]) {
      return { success: false, error: "Failed to update driver", code: "UPDATE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver[0].tenantId,
      userId,
      action: "driver.updated",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver[0].firstName} ${existingDriver[0].lastName}`,
        updatedFields: Object.keys(validatedData)
      }
    })

    revalidatePath(`/dashboard/${existingDriver[0].tenantId}/drivers`)
    revalidatePath(`/dashboard/${existingDriver[0].tenantId}/drivers/${driverId}`)
    
    return { 
      success: true, 
      data: updatedDriver[0] as Driver
    }

  } catch (error) {
    console.error("Error updating driver:", error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid input data", 
        code: "VALIDATION_ERROR" 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to update driver", 
      code: "INTERNAL_ERROR" 
    }
  }
}

/**
 * Delete (deactivate) a driver
 */
export async function deleteDriverAction(driverId: string): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get existing driver to check permissions
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!existingDriver[0]) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    const canDelete = await hasPermission(userId, existingDriver[0].tenantId, "drivers:delete")
    if (!canDelete) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Check if driver has active assignments
    // TODO: Check against loads/assignments table when implemented
    // For now, check if driver is currently assigned
    if (existingDriver[0].status === 'assigned' || existingDriver[0].status === 'driving') {
      return { 
        success: false, 
        error: "Cannot delete driver with active assignments", 
        code: "HAS_ACTIVE_ASSIGNMENTS" 
      }
    }

    // Soft delete (deactivate) driver
    const deletedDriver = await db
      .update(drivers)
      .set({
        isActive: false,
        status: 'terminated',
        availabilityStatus: 'suspended',
        terminationDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      })
      .where(eq(drivers.id, driverId))
      .returning()

    if (!deletedDriver[0]) {
      return { success: false, error: "Failed to delete driver", code: "DELETE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver[0].tenantId,
      userId,
      action: "driver.deleted",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver[0].firstName} ${existingDriver[0].lastName}`,
        cdlNumber: existingDriver[0].cdlNumber
      }
    })

    revalidatePath(`/dashboard/${existingDriver[0].tenantId}/drivers`)
    
    return { success: true }

  } catch (error) {
    console.error("Error deleting driver:", error)
    return { 
      success: false, 
      error: "Failed to delete driver", 
      code: "INTERNAL_ERROR" 
    }
  }
}

// ================== Status Management ==================

/**
 * Update driver status
 */
export async function updateDriverStatusAction(
  driverId: string,
  statusUpdate: z.infer<typeof driverStatusUpdateSchema>
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get existing driver
    const existingDriver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!existingDriver[0]) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    const canUpdate = await hasPermission(userId, existingDriver[0].tenantId, "drivers:update")
    if (!canUpdate) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Validate input
    const validatedData = driverStatusUpdateSchema.parse(statusUpdate)

    // Update driver status
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    }

    if (validatedData.availabilityStatus) {
      updateData.availabilityStatus = validatedData.availabilityStatus
    }

    if (validatedData.location) {
      updateData.currentLocation = JSON.stringify(validatedData.location)
    }

    const updatedDriver = await db
      .update(drivers)
      .set(updateData)
      .where(eq(drivers.id, driverId))
      .returning()

    // Create HOS entry if it's a status change
    if (validatedData.status !== existingDriver[0].status) {
      await db.insert(hoursOfService).values({
        driverId,
        date: new Date().toISOString().split('T')[0],
        status: validatedData.status === 'driving' ? 'driving' : 
               validatedData.status === 'on_duty' ? 'on_duty_not_driving' : 'off_duty',
        location: validatedData.location?.address || 'Unknown',
        coordinates: validatedData.location ? JSON.stringify({
          latitude: validatedData.location.latitude,
          longitude: validatedData.location.longitude
        }) : null,
        startTime: new Date().toISOString(),
        duration: 0,
        isPersonalTime: false,
        isDriving: validatedData.status === 'driving',
        source: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver[0].tenantId,
      userId,
      action: "driver.status_updated",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver[0].firstName} ${existingDriver[0].lastName}`,
        oldStatus: existingDriver[0].status,
        newStatus: validatedData.status,
        notes: validatedData.notes
      }
    })

    revalidatePath(`/dashboard/${existingDriver[0].tenantId}/drivers`)
    revalidatePath(`/dashboard/${existingDriver[0].tenantId}/drivers/${driverId}`)
    
    return { 
      success: true, 
      data: updatedDriver[0] as Driver
    }

  } catch (error) {
    console.error("Error updating driver status:", error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid status data", 
        code: "VALIDATION_ERROR" 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to update driver status", 
      code: "INTERNAL_ERROR" 
    }
  }
}

// ================== Bulk Operations ==================

/**
 * Bulk update drivers
 */
export async function bulkUpdateDriversAction(
  bulkUpdate: z.infer<typeof driverBulkUpdateSchema>
): Promise<DriverBulkActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { 
        success: false, 
        processed: 0, 
        succeeded: 0, 
        failed: bulkUpdate.driverIds.length,
        errors: bulkUpdate.driverIds.map(id => ({ driverId: id, error: "Authentication required" }))
      }
    }

    // Validate input
    const validatedData = driverBulkUpdateSchema.parse(bulkUpdate)
    
    let succeeded = 0
    let failed = 0
    const errors: Array<{ driverId: string; error: string }> = []

    // Process each driver
    for (const driverId of validatedData.driverIds) {
      try {
        // Get driver to check permissions
        const driver = await db
          .select()
          .from(drivers)
          .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
          .limit(1)

        if (!driver[0]) {
          errors.push({ driverId, error: "Driver not found" })
          failed++
          continue
        }

        // Check permissions
        const canUpdate = await hasPermission(userId, driver[0].tenantId, "drivers:update")
        if (!canUpdate) {
          errors.push({ driverId, error: "Insufficient permissions" })
          failed++
          continue
        }

        // Prepare update
        const updateData: any = {
          updatedAt: new Date().toISOString(),
          updatedBy: userId
        }

        if (validatedData.updates.status) updateData.status = validatedData.updates.status
        if (validatedData.updates.availabilityStatus) updateData.availabilityStatus = validatedData.updates.availabilityStatus
        if (validatedData.updates.homeTerminal) updateData.homeTerminal = validatedData.updates.homeTerminal
        if (validatedData.updates.tags) updateData.tags = JSON.stringify(validatedData.updates.tags)

        // Update driver
        await db
          .update(drivers)
          .set(updateData)
          .where(eq(drivers.id, driverId))

        succeeded++

        // Create audit log
        await createAuditLog({
          tenantId: driver[0].tenantId,
          userId,
          action: "driver.bulk_updated",
          entityType: "driver",
          entityId: driverId,
          details: {
            driverName: `${driver[0].firstName} ${driver[0].lastName}`,
            updatedFields: Object.keys(validatedData.updates)
          }
        })

      } catch (error) {
        console.error(`Error updating driver ${driverId}:`, error)
        errors.push({ driverId, error: "Update failed" })
        failed++
      }
    }

    // Revalidate paths for all affected tenants
    const tenantIds = await db
      .selectDistinct({ tenantId: drivers.tenantId })
      .from(drivers)
      .where(inArray(drivers.id, validatedData.driverIds))

    for (const { tenantId } of tenantIds) {
      revalidatePath(`/dashboard/${tenantId}/drivers`)
    }

    return {
      success: succeeded > 0,
      processed: validatedData.driverIds.length,
      succeeded,
      failed,
      errors
    }

  } catch (error) {
    console.error("Error in bulk update:", error)
    return {
      success: false,
      processed: bulkUpdate.driverIds.length,
      succeeded: 0,
      failed: bulkUpdate.driverIds.length,
      errors: bulkUpdate.driverIds.map(id => ({ driverId: id, error: "Internal error" }))
    }
  }
}

// ================== Assignment Management ==================

/**
 * Assign driver to a load/vehicle
 */
export async function assignDriverAction(
  assignmentData: z.infer<typeof driverAssignmentSchema>
): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Validate input
    const validatedData = driverAssignmentSchema.parse(assignmentData)

    // Get driver to check permissions
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, validatedData.driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    const canAssign = await hasPermission(userId, driver[0].tenantId, "drivers:assign")
    if (!canAssign) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Check driver availability
    if (driver[0].availabilityStatus !== 'available') {
      return { 
        success: false, 
        error: "Driver is not available for assignment", 
        code: "DRIVER_NOT_AVAILABLE" 
      }
    }

    // Update driver status
    await db
      .update(drivers)
      .set({
        status: 'assigned',
        availabilityStatus: 'busy',
        currentAssignment: validatedData.loadId || null,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      })
      .where(eq(drivers.id, validatedData.driverId))

    // TODO: Create assignment record in assignments table when implemented

    // Create audit log
    await createAuditLog({
      tenantId: driver[0].tenantId,
      userId,
      action: "driver.assigned",
      entityType: "driver",
      entityId: validatedData.driverId,
      details: {
        driverName: `${driver[0].firstName} ${driver[0].lastName}`,
        assignmentType: validatedData.assignmentType,
        loadId: validatedData.loadId,
        vehicleId: validatedData.vehicleId
      }
    })

    revalidatePath(`/dashboard/${driver[0].tenantId}/drivers`)
    revalidatePath(`/dashboard/${driver[0].tenantId}/dispatch`)
    
    return { success: true }

  } catch (error) {
    console.error("Error assigning driver:", error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid assignment data", 
        code: "VALIDATION_ERROR" 
      }
    }
    
    return { 
      success: false, 
      error: "Failed to assign driver", 
      code: "INTERNAL_ERROR" 
    }
  }
}

/**
 * Unassign driver from current assignment
 */
export async function unassignDriverAction(driverId: string): Promise<DriverActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get driver
    const driver = await db
      .select()
      .from(drivers)
      .where(and(eq(drivers.id, driverId), eq(drivers.isActive, true)))
      .limit(1)

    if (!driver[0]) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    const canAssign = await hasPermission(userId, driver[0].tenantId, "drivers:assign")
    if (!canAssign) {
      return { success: false, error: "Insufficient permissions", code: "FORBIDDEN" }
    }

    // Update driver status
    await db
      .update(drivers)
      .set({
        status: 'available',
        availabilityStatus: 'available',
        currentAssignment: null,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      })
      .where(eq(drivers.id, driverId))

    // Create audit log
    await createAuditLog({
      tenantId: driver[0].tenantId,
      userId,
      action: "driver.unassigned",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${driver[0].firstName} ${driver[0].lastName}`,
        previousAssignment: driver[0].currentAssignment
      }
    })

    revalidatePath(`/dashboard/${driver[0].tenantId}/drivers`)
    revalidatePath(`/dashboard/${driver[0].tenantId}/dispatch`)
    
    return { success: true }

  } catch (error) {
    console.error("Error unassigning driver:", error)
    return { 
      success: false, 
      error: "Failed to unassign driver", 
      code: "INTERNAL_ERROR" 
    }
  }
}
