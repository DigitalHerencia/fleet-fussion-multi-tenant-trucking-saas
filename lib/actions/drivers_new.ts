"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/database"
import { drivers } from "@/lib/database/schema"
import { eq, and, desc } from "drizzle-orm"
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

// Schema for driver creation/update
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
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
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
      emergencyContactName: formData.get("emergencyContactName"),
      emergencyContactPhone: formData.get("emergencyContactPhone"),
      emergencyContactRelation: formData.get("emergencyContactRelation"),
      notes: formData.get("notes"),
    })

    // Convert date strings to Date objects for database
    const dateFields = {
      licenseExpiration: validatedFields.licenseExpiration ? new Date(validatedFields.licenseExpiration) : null,
      medicalCardExpiration: validatedFields.medicalCardExpiration ? new Date(validatedFields.medicalCardExpiration) : null,
      drugTestDate: validatedFields.drugTestDate ? new Date(validatedFields.drugTestDate) : null,
      backgroundCheckDate: validatedFields.backgroundCheckDate ? new Date(validatedFields.backgroundCheckDate) : null,
      hireDate: validatedFields.hireDate ? new Date(validatedFields.hireDate) : null,
      terminationDate: validatedFields.terminationDate ? new Date(validatedFields.terminationDate) : null,
    }

    // Destructure to remove date strings and keep rest
    const { 
      licenseExpiration, 
      medicalCardExpiration, 
      drugTestDate, 
      backgroundCheckDate, 
      hireDate, 
      terminationDate, 
      ...restOfValidatedFields 
    } = validatedFields

  

    revalidatePath("/drivers")

    return {
      success: true,
      message: "Driver created successfully",
      data: drivers,
    }
  } catch (error) {
    console.error("Error creating driver:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }
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
      emergencyContactName: formData.get("emergencyContactName"),
      emergencyContactPhone: formData.get("emergencyContactPhone"),
      emergencyContactRelation: formData.get("emergencyContactRelation"),
      notes: formData.get("notes"),
    })

    // Check if the driver exists and belongs to the organization
    const existingDriver = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.organizationId, user.organizationId)),
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    // Convert date strings to Date objects for database
    const dateFields = {
      licenseExpiration: validatedFields.licenseExpiration ? new Date(validatedFields.licenseExpiration) : null,
      medicalCardExpiration: validatedFields.medicalCardExpiration ? new Date(validatedFields.medicalCardExpiration) : null,
      drugTestDate: validatedFields.drugTestDate ? new Date(validatedFields.drugTestDate) : null,
      backgroundCheckDate: validatedFields.backgroundCheckDate ? new Date(validatedFields.backgroundCheckDate) : null,
      hireDate: validatedFields.hireDate ? new Date(validatedFields.hireDate) : null,
      terminationDate: validatedFields.terminationDate ? new Date(validatedFields.terminationDate) : null,
    }

    // Destructure to remove date strings and keep rest
    const { 
      licenseExpiration, 
      medicalCardExpiration, 
      drugTestDate, 
      backgroundCheckDate, 
      hireDate, 
      terminationDate, 
      ...restOfValidatedFields 
    } = validatedFields

    await db
      .update(drivers)
      .set({  
        
        updatedAt: new Date(),
      })
      
      .where(eq(drivers.id, id))

    revalidatePath("/drivers")
    revalidatePath(`/drivers/${id}`)

    return {
      success: true,
      message: "Driver updated successfully",
    }
  } catch (error) {
    console.error("Error updating driver:", error)
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }
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
    const existingDriver = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.organizationId, user.organizationId)),
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    await db
      .update(drivers)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(drivers.id, id))

    revalidatePath("/drivers")
    revalidatePath(`/drivers/${id}`)

    return {
      success: true,
      message: "Driver status updated successfully",
    }
  } catch (error) {
    console.error("Error updating driver status:", error)
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
    const existingDriver = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.organizationId, user.organizationId)),
    })

    if (!existingDriver) {
      return {
        success: false,
        message: "Driver not found",
      }
    }

    await db.delete(drivers).where(eq(drivers.id, id))

    revalidatePath("/drivers")

    return {
      success: true,
      message: "Driver deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting driver:", error)
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
    const allDrivers = await db.query.drivers.findMany({
      where: eq(drivers.organizationId, user.organizationId),
      with: {
        user: true,
        loads: {
          limit: 5,
          orderBy: desc(drivers.createdAt),
        },
      },
      orderBy: desc(drivers.createdAt),
    })

    return {
      success: true,
      data: allDrivers,
    }
  } catch (error) {
    console.error("Error fetching drivers:", error)
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
    const driver = await db.query.drivers.findFirst({
      where: and(eq(drivers.id, id), eq(drivers.organizationId, user.organizationId)),
      with: {
        user: true,
        loads: {
          orderBy: desc(drivers.createdAt),
          with: {
            vehicle: true,
            trailer: true,
          },
        },
        complianceDocuments: true,
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
    console.error("Error fetching driver:", error)
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
    const availableDrivers = await db.query.drivers.findMany({
      where: and(eq(drivers.organizationId, user.organizationId), eq(drivers.status, 'active')),
      orderBy: [drivers.firstName, drivers.lastName],
    })

    return {
      success: true,
      data: availableDrivers,
    }
  } catch (error) {
    console.error("Error fetching available drivers:", error)
    return {
      success: false,
      message: "Failed to fetch available drivers",
      data: [],
    }
  }
}
