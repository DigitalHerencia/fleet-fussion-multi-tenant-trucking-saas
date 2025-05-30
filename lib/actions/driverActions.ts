"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import type { 
  Driver, 
  DriverFormData, 
  DriverUpdateData, 
  DriverActionResult,
  DriverBulkActionResult
} from "@/types/drivers"
import { db } from "../database"
import { createAuditLog } from "./auditActions"
import { 
  driverFormSchema,
  driverUpdateSchema,
  driverStatusUpdateSchema,
  driverDocumentSchema,
  hosEntrySchema,
  driverAssignmentSchema,
  driverBulkUpdateSchema
} from "@/validations/drivers"

// Helper function to convert Prisma Driver to Driver interface
function convertPrismaDriverToDriver(prismaDriver: any): Driver {
  return {
    ...prismaDriver,
    tenantId: prismaDriver.tenantId || prismaDriver.organizationId,
    address: prismaDriver.address ? JSON.parse(prismaDriver.address) : undefined,
    endorsements: prismaDriver.endorsements ? JSON.parse(prismaDriver.endorsements) : undefined,
    restrictions: prismaDriver.restrictions ? JSON.parse(prismaDriver.restrictions) : undefined,
    emergencyContact: prismaDriver.emergencyContact ? JSON.parse(prismaDriver.emergencyContact) : undefined,
    tags: prismaDriver.tags ? JSON.parse(prismaDriver.tags) : undefined,
    payRate: prismaDriver.payRate ? Number(prismaDriver.payRate) : undefined,
    createdAt: prismaDriver.createdAt.toISOString(),
    updatedAt: prismaDriver.updatedAt.toISOString(),
    hireDate: prismaDriver.hireDate?.toISOString() || '',
    medicalCardExpiration: prismaDriver.medicalCardExpiration?.toISOString() || ''
  } as Driver
}

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

    // Validate input data
    const validatedData = driverFormSchema.parse(data)

    // Create driver record
    const newDriver = await db.driver.create({
      data: {
        organizationId: tenantId,
        tenantId: tenantId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address?.street || null,
        city: validatedData.address?.city || null,
        state: validatedData.address?.state || null,
        zip: validatedData.address?.zipCode || null,
        employeeId: validatedData.employeeId || null,
        hireDate: validatedData.hireDate,
        payRate: validatedData.payRate || null,
        payType: validatedData.payType || null,
        cdlNumber: validatedData.cdlNumber,
        endorsements: validatedData.endorsements ? JSON.stringify(validatedData.endorsements) : null,
        restrictions: validatedData.restrictions ? JSON.stringify(validatedData.restrictions) : null,
        medicalCardNumber: validatedData.medicalCardNumber || null,
        medicalCardExpiration: validatedData.medicalCardExpiration,
        availabilityStatus: 'available',
        isActive: true,
        emergencyContact: validatedData.emergencyContact ? JSON.stringify(validatedData.emergencyContact) : null,
        notes: validatedData.notes || null,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
      }
    })

    if (!newDriver) {
      return { success: false, error: "Failed to create driver", code: "CREATE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId,
      userId,
      action: "driver.created",
      entityType: "driver",
      entityId: newDriver.id,
      details: { 
        driverName: `${validatedData.firstName} ${validatedData.lastName}`,
        cdlNumber: validatedData.cdlNumber 
      }
    })

    revalidatePath(`/dashboard/${tenantId}/driver`)
    
    return { 
      success: true, 
      data: convertPrismaDriverToDriver(newDriver)
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
    const existingDriver = await db.driver.findFirst({
      where: {
        id: driverId,
        isActive: true
      }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate input data
    const validatedData = driverUpdateSchema.parse(data)

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date(),
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
    const updatedDriver = await db.driver.update({
      where: { id: driverId },
      data: updateData
    })

    if (!updatedDriver) {
      return { success: false, error: "Failed to update driver", code: "UPDATE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver.tenantId,
      userId,
      action: "driver.updated",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver.firstName} ${existingDriver.lastName}`,
        updatedFields: Object.keys(validatedData)
      }
    })

    revalidatePath(`/dashboard/${existingDriver.tenantId}/driver`)
    revalidatePath(`/dashboard/${existingDriver.tenantId}/driver/${driverId}`)
    
    return { 
      success: true, 
      data: convertPrismaDriverToDriver(updatedDriver)
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
    const existingDriver = await db.driver.findFirst({
      where: {
        id: driverId,
        isActive: true
      }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Check if driver has active assignments
    if (existingDriver.status === 'assigned' || existingDriver.status === 'driving') {
      return { 
        success: false, 
        error: "Cannot delete driver with active assignments", 
        code: "HAS_ACTIVE_ASSIGNMENTS" 
      }
    }

    // Soft delete (deactivate) driver
    const deletedDriver = await db.driver.update({
      where: { id: driverId },
      data: {
        isActive: false,
        status: 'terminated',
        availabilityStatus: 'suspended',
        terminationDate: new Date(),
        updatedAt: new Date(),
      }
    })

    if (!deletedDriver) {
      return { success: false, error: "Failed to delete driver", code: "DELETE_FAILED" }
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver.tenantId,
      userId,
      action: "driver.deleted",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver.firstName} ${existingDriver.lastName}`,
        cdlNumber: existingDriver.cdlNumber
      }
    })

    revalidatePath(`/dashboard/${existingDriver.tenantId}/driver`)
    
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
    const existingDriver = await db.driver.findFirst({
      where: {
        id: driverId,
        isActive: true
      }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate input
    const validatedData = driverStatusUpdateSchema.parse(statusUpdate)

    // Update driver status
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date(),
      updatedBy: userId
    }

    if (validatedData.availabilityStatus) {
      updateData.availabilityStatus = validatedData.availabilityStatus
    }

    if (validatedData.location) {
      updateData.currentLocation = JSON.stringify(validatedData.location)
    }

    const updatedDriver = await db.driver.update({
      where: { id: driverId },
      data: updateData
    })

    // Create HOS entry if it's a status change
    if (validatedData.status !== existingDriver.status) {
      await db.hoursOfService.create({
        data: {
          driverId,
          date: new Date().toISOString().split('T')[0],
          status: validatedData.status === 'driving' ? 'driving' : 
                 validatedData.status === 'on_duty' ? 'on_duty_not_driving' : 'off_duty',
          location: validatedData.location?.address || 'Unknown',
          latitude: validatedData.location?.latitude || null,
          longitude: validatedData.location?.longitude || null,
          startTime: new Date().toISOString(),
          duration: 0,
          isPersonalTime: false,
          isDriving: validatedData.status === 'driving',
          source: 'manual',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Create audit log
    await createAuditLog({
      tenantId: existingDriver.tenantId,
      userId,
      action: "driver.status_updated",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${existingDriver.firstName} ${existingDriver.lastName}`,
        oldStatus: existingDriver.status,
        newStatus: validatedData.status,
        notes: validatedData.notes
      }
    })

    revalidatePath(`/dashboard/${existingDriver.tenantId}/driver`)
    revalidatePath(`/dashboard/${existingDriver.tenantId}/driver/${driverId}`)
    
    return { 
      success: true, 
      data: convertPrismaDriverToDriver(updatedDriver)
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
export async function bulkUpdateDriverAction(
  bulkUpdate: z.infer<typeof driverBulkUpdateSchema>
): Promise<DriverBulkActionResult> {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { 
        success: false, 
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [{ driverId: "unknown", error: "Authentication required" }]
      }
    }

    // Validate input
    const validatedData = driverBulkUpdateSchema.parse(bulkUpdate)

    // Get existing drivers and validate permissions
    const existingDrivers = await db.driver.findMany({
      where: {
        id: { in: validatedData.driverIds },
        isActive: true
      }
    })

    if (existingDrivers.length === 0) {
      return { 
        success: false, 
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [{ driverId: "unknown", error: "No drivers found" }]
      }
    }

    // Check if all requested drivers exist
    const missingDriverIds = validatedData.driverIds.filter(
      id => !existingDrivers.find(d => d.id === id)
    )
    
    const errors: Array<{ driverId: string; error: string }> = []
    
    if (missingDriverIds.length > 0) {
      missingDriverIds.forEach(id => {
        errors.push({ driverId: id, error: "Driver not found" })
      })
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: userId
    }

    if (validatedData.updates.status) {
      updateData.status = validatedData.updates.status
    }

    if (validatedData.updates.availabilityStatus) {
      updateData.availabilityStatus = validatedData.updates.availabilityStatus
    }

    if (validatedData.updates.homeTerminal) {
      updateData.homeTerminal = validatedData.updates.homeTerminal
    }

    if (validatedData.updates.tags) {
      updateData.tags = JSON.stringify(validatedData.updates.tags)
    }

    // Update drivers
    const updatedDrivers = await db.driver.updateMany({
      where: {
        id: { in: existingDrivers.map(d => d.id) }
      },
      data: updateData
    })

    // Create audit logs for each driver
    for (const driver of existingDrivers) {
      await createAuditLog({
        tenantId: driver.tenantId,
        userId,
        action: "driver.bulk_updated",
        entityType: "driver",
        entityId: driver.id,
        details: {
          driverName: `${driver.firstName} ${driver.lastName}`,
          updates: validatedData.updates
        }
      })
    }

    // Revalidate paths
    const tenantIds = [...new Set(existingDrivers.map(d => d.tenantId))]
    for (const tenantId of tenantIds) {
      revalidatePath(`/dashboard/${tenantId}/driver`)
    }

    return { 
      success: true,
      processed: validatedData.driverIds.length,
      succeeded: updatedDrivers.count,
      failed: validatedData.driverIds.length - updatedDrivers.count,
      errors: errors,
      data: undefined // Bulk operations don't return driver data
    }

  } catch (error) {
    console.error("Error bulk updating drivers:", error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [{ driverId: "unknown", error: "Invalid bulk update data" }]
      }
    }
    
    return { 
      success: false,
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [{ driverId: "unknown", error: "Failed to bulk update drivers" }]
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
    const driver = await db.driver.findFirst({
      where: {
        id: validatedData.driverId,
        isActive: true
      }
    })

    if (!driver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Check driver availability
    if (driver.availabilityStatus !== 'available') {
      return { 
        success: false, 
        error: "Driver is not available for assignment", 
        code: "DRIVER_NOT_AVAILABLE" 
      }
    }

    // Update driver status
    await db.driver.update({
      where: { id: validatedData.driverId },
      data: {
        status: 'assigned',
        availabilityStatus: 'busy',
        currentAssignment: validatedData.loadId || null,
        updatedAt: new Date(),
      }
    })

    // Create audit log
    await createAuditLog({
      tenantId: driver.tenantId,
      userId,
      action: "driver.assigned",
      entityType: "driver",
      entityId: validatedData.driverId,
      details: {
        driverName: `${driver.firstName} ${driver.lastName}`,
        assignmentType: validatedData.assignmentType,
        loadId: validatedData.loadId,
        vehicleId: validatedData.vehicleId
      }
    })

    revalidatePath(`/dashboard/${driver.tenantId}/driver`)
    revalidatePath(`/dashboard/${driver.tenantId}/dispatch`)
    
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
    const driver = await db.driver.findFirst({
      where: {
        id: driverId,
        isActive: true
      }
    })

    if (!driver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Update driver status
    await db.driver.update({
      where: { id: driverId },
      data: {
        status: 'available',
        availabilityStatus: 'available',
        currentAssignment: null,
        updatedAt: new Date(),
      }
    })

    // Create audit log
    await createAuditLog({
      tenantId: driver.tenantId,
      userId,
      action: "driver.unassigned",
      entityType: "driver",
      entityId: driverId,
      details: {
        driverName: `${driver.firstName} ${driver.lastName}`,
        previousAssignment: driver.currentAssignment
      }
    })

    revalidatePath(`/dashboard/${driver.tenantId}/driver`)
    revalidatePath(`/dashboard/${driver.tenantId}/dispatch`)
    
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

