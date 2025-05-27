"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/database"
import { auth } from "@clerk/nextjs/server"
import { DatabaseQueries } from "@/lib/database"

// Helper to get current user with organizationId
async function getCurrentUserWithOrg() {
  const { userId, orgId } = await auth()
  
  if (!userId || !orgId) {
    return null
  }

  try {
    // Get user from database with organizationId
    const dbUser = await DatabaseQueries.getUserByClerkId(userId)
    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      organizationId: dbUser.organizationId,
      email: dbUser.email,
      name: `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email,
      role: dbUser.role,
      permissions: dbUser.permissions
    }
  } catch (error) {
    console.error('Error getting user context:', error)
    return null
  }
}

// Schema for driver creation/update - matches database schema
const driverSchema = z.object({
  employeeId: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  licenseClass: z.string().optional(),
  licenseExpiration: z.string().optional(),
  medicalCardExpiration: z.string().optional(),
  drugTestDate: z.string().optional(),
  backgroundCheckDate: z.string().optional(),
  hireDate: z.string().optional(),
  terminationDate: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "terminated"]).default("active"),
  emergencyContact1: z.string().optional(),
  emergencyContact1Phone: z.string().optional(),
  emergencyContact1Relation: z.string().optional(),
  notes: z.string().optional(),
})

// Create a new driver
export async function createDriver(formData: FormData) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
    }
  }

  try {
    const validatedFields = driverSchema.parse({
      employeeId: formData.get("employeeId"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      licenseNumber: formData.get("licenseNumber"),
      licenseState: formData.get("licenseState"),
      licenseClass: formData.get("licenseClass"),
      licenseExpiration: formData.get("licenseExpiration"),
      medicalCardExpiration: formData.get("medicalCardExpiration"),
      drugTestDate: formData.get("drugTestDate"),
      backgroundCheckDate: formData.get("backgroundCheckDate"),
      hireDate: formData.get("hireDate"),
      terminationDate: formData.get("terminationDate"),
      status: formData.get("status") || "active",
      emergencyContact1: formData.get("emergencyContactName"),
      emergencyContact1Phone: formData.get("emergencyContactPhone"),
      emergencyContact1Relation: formData.get("emergencyContactRelation"),
      notes: formData.get("notes"),
    })

    const driver = await db.driver.create({
      data: {
        organizationId: user.organizationId,
        employeeId: validatedFields.employeeId,
        firstName: validatedFields.firstName,
        lastName: validatedFields.lastName,
        email: validatedFields.email,
        phone: validatedFields.phone,
        address: validatedFields.address,
        city: validatedFields.city,
        state: validatedFields.state,
        zip: validatedFields.zip,
        licenseNumber: validatedFields.licenseNumber,
        licenseState: validatedFields.licenseState,
        licenseClass: validatedFields.licenseClass,
        licenseExpiration: validatedFields.licenseExpiration,
        medicalCardExpiration: validatedFields.medicalCardExpiration,
        drugTestDate: validatedFields.drugTestDate,
        backgroundCheckDate: validatedFields.backgroundCheckDate,
        hireDate: validatedFields.hireDate,
        terminationDate: validatedFields.terminationDate,
        status: validatedFields.status,
        emergencyContact1: validatedFields.emergencyContact1,
        notes: validatedFields.notes,
      }
    })

    revalidatePath("/drivers")

    return {
      success: true,
      message: "Driver created successfully",
      data: driver,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }

    console.error('Error creating driver:', error)
    return {
      success: false,
      message: "Failed to create driver",
    }
  }
}

// Update an existing driver
export async function updateDriver(id: string, formData: FormData) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
    }
  }

  try {
    const validatedFields = driverSchema.parse({
      employeeId: formData.get("employeeId"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      licenseNumber: formData.get("licenseNumber"),
      licenseState: formData.get("licenseState"),
      licenseClass: formData.get("licenseClass"),
      licenseExpiration: formData.get("licenseExpiration"),
      medicalCardExpiration: formData.get("medicalCardExpiration"),
      drugTestDate: formData.get("drugTestDate"),
      backgroundCheckDate: formData.get("backgroundCheckDate"),
      hireDate: formData.get("hireDate"),
      terminationDate: formData.get("terminationDate"),
      status: formData.get("status") || "active",
      emergencyContact1: formData.get("emergencyContactName"),
      emergencyContact1Phone: formData.get("emergencyContactPhone"),
      emergencyContact1Relation: formData.get("emergencyContactRelation"),
      notes: formData.get("notes"),
    })

    // Check if the driver exists and belongs to the organization
    const existingDriver = await db.driver.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    await db.driver.update({
      where: { id },
      data: {
        employeeId: validatedFields.employeeId,
        firstName: validatedFields.firstName,
        lastName: validatedFields.lastName,
        email: validatedFields.email,
        phone: validatedFields.phone,
        address: validatedFields.address,
        city: validatedFields.city,
        state: validatedFields.state,
        zip: validatedFields.zip,
        licenseNumber: validatedFields.licenseNumber,
        licenseState: validatedFields.licenseState,
        licenseClass: validatedFields.licenseClass,
        licenseExpiration: validatedFields.licenseExpiration,
        medicalCardExpiration: validatedFields.medicalCardExpiration,
        drugTestDate: validatedFields.drugTestDate,
        backgroundCheckDate: validatedFields.backgroundCheckDate,
        hireDate: validatedFields.hireDate,
        terminationDate: validatedFields.terminationDate,
        status: validatedFields.status,
        emergencyContact1: validatedFields.emergencyContact1,
        notes: validatedFields.notes,
        updatedAt: new Date(),
      }
    })

    revalidatePath("/drivers")
    revalidatePath(`/drivers/${id}`)

    return {
      success: true,
      message: "Driver updated successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }

    console.error('Error updating driver:', error)
    return {
      success: false,
      message: "Failed to update driver",
    }
  }
}

// Update driver status
export async function updateDriverStatus(id: string, status: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
    }
  }

  try {
    // Check if the driver exists and belongs to the organization
    const existingDriver = await db.driver.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    await db.driver.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      }
    })

    revalidatePath("/drivers")
    revalidatePath(`/drivers/${id}`)

    return {
      success: true,
      message: "Driver status updated successfully",
    }
  } catch (error) {
    console.error('Error updating driver status:', error)
    return {
      success: false,
      message: "Failed to update driver status",
    }
  }
}

// Delete a driver
export async function deleteDriver(id: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
    }
  }

  try {
    // Check if the driver exists and belongs to the organization
    const existingDriver = await db.driver.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    await db.driver.delete({
      where: { id }
    })

    revalidatePath("/drivers")

    return {
      success: true,
      message: "Driver deleted successfully",
    }
  } catch (error) {
    console.error('Error deleting driver:', error)
    return {
      success: false,
      message: "Failed to delete driver",
    }
  }
}

// Get all drivers for the current organization
export async function getDrivers() {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      data: [],
    }
  }

  try {
    const allDrivers = await db.driver.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        loads: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: allDrivers,
    }
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return {
      success: false,
      message: "Failed to fetch drivers",
      data: [],
    }
  }
}

// Get a single driver by ID
export async function getDriver(id: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      data: null,
    }
  }

  try {
    const driver = await db.driver.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        loads: {
          orderBy: { createdAt: "desc" },
          include: {
            vehicle: true,
          },
        },
      },
    })

    if (!driver) {
      return {
        success: false,
        message: "Driver not found",
        data: null,
      }
    }

    return {
      success: true,
      data: driver,
    }
  } catch (error) {
    console.error('Error fetching driver:', error)
    return {
      success: false,
      message: "Failed to fetch driver",
      data: null,
    }
  }
}

// Get available drivers for assignment
export async function getAvailableDrivers() {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      data: [],
    }
  }

  try {
    const availableDrivers = await db.driver.findMany({
      where: {
        organizationId: user.organizationId,
        status: "active",
      },
      orderBy: [
        { firstName: "asc" },
        { lastName: "asc" }
      ],
    })

    return {
      success: true,
      data: availableDrivers,
    }
  } catch (error) {
    console.error('Error fetching available drivers:', error)
    return {
      success: false,
      message: "Failed to fetch available drivers",
      data: [],
    }
  }
}
