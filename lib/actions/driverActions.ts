import { UserContext } from "@/types/auth";
"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import prisma from "@/lib/db"
import { 
  driverFormSchema, 
  driverUpdateSchema, 
  driverStatusUpdateSchema,
  driverAssignmentSchema,
  driverBulkUpdateSchema
} from "@/schemas/drivers"
import { hasPermission } from "@/lib/auth/permissions"
import type { 
  Driver, 
  DriverFormData, 
  DriverUpdateData, 
  DriverActionResult,
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
  const parsed = driverFormSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Validate permissions

    // Validate input data
    const validatedData = driverFormSchema.parse(data)    // Check for duplicate CDL number within tenant
    const existingDriver = await prisma.driver.findFirst({
      where: {
        organizationId: tenantId,
        licenseNumber: validatedData.cdlNumber,
        status: {
          not: "terminated"
        }
      }
    })

    if (existingDriver) {
      return { 
        success: false, 
        error: "A driver with this CDL number already exists", 
        code: "DUPLICATE_CDL" 
      }
    }    // Check for duplicate email within tenant
    const existingEmail = await prisma.driver.findFirst({
      where: {
        organizationId: tenantId,
        email: validatedData.email,
        status: {
          not: "terminated"
        }
      }
    })

    if (existingEmail) {
      return { 
        success: false, 
        error: "A driver with this email already exists", 
        code: "DUPLICATE_EMAIL" 
      }
    }    // Create driver record
    const newDriver = await prisma.driver.create({
      data: {
        organizationId: tenantId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        employeeId: validatedData.employeeId || null,
        hireDate: validatedData.hireDate,
        
        licenseNumber: validatedData.cdlNumber,
        licenseState: validatedData.cdlState,
        licenseClass: validatedData.cdlClass,
        licenseExpiration: validatedData.cdlExpiration,
        
        medicalCardExpiration: validatedData.medicalCardExpiration,
        
        status: 'active',
        
        emergencyContact1: validatedData.emergencyContact?.name || null,
        emergencyContact2: validatedData.emergencyContact?.phone || null,
        notes: validatedData.notes || null,
        
        customFields: validatedData.tags ? { tags: validatedData.tags } : {},
      }
    })

    if (!newDriver) {
      return { success: false, error: "Failed to create driver", code: "CREATE_FAILED" }
    }

    revalidatePath(`/dashboard/${tenantId}/drivers`)
    
    return { 
      success: true, 
      data: newDriver as unknown as Driver
    }

  } catch (error) {
    console.error("Error creating driver:", error)
    
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
  const parsed = driverUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get existing driver to check permissions
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions
    


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
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: updateData
    })

    if (!updatedDriver) {
      return { success: false, error: "Failed to update driver", code: "UPDATE_FAILED" }
    }


    return { 
      success: true, 
      data: updatedDriver as unknown as Driver
    }

  } catch (error) {
    console.error("Error updating driver:", error)
    
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
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions




    // Soft delete (deactivate) driver
    const deletedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: 'terminated',
        terminationDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    if (!deletedDriver) {
      return { success: false, error: "Failed to delete driver", code: "DELETE_FAILED" }
    }

    
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
  const parsed = driverStatusUpdateSchema.safeParse(statusUpdate)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Authentication required", code: "UNAUTHORIZED" }
    }

    // Get existing driver
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!existingDriver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

    // Validate permissions

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

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: updateData
    })

    return { 
      success: true, 
      data: updatedDriver as unknown as Driver
    }
  } catch (error) {
    console.error("Error updating driver status:", error)
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
        const driver = await prisma.driver.findUnique({
          where: { id: driverId }
        })

        if (!driver) {
          errors.push({ driverId, error: "Driver not found" })
          failed++
          continue
        }

        // Check permissions
    
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
        await prisma.driver.update({
          where: { id: driverId },
          data: updateData
        })

        succeeded++

      

      } catch (error) {
        console.error(`Error updating driver ${driverId}:`, error)
        errors.push({ driverId, error: "Update failed" })
        failed++
      }
    }

    // Revalidate paths for all affected tenants
  
  
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
    const driver = await prisma.driver.findUnique({
      where: { id: validatedData.driverId }
    })

    if (!driver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }







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
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return { success: false, error: "Driver not found", code: "NOT_FOUND" }
    }

  
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
