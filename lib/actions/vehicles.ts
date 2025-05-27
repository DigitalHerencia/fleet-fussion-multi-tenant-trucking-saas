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

// Schema for vehicle creation/update
const vehicleSchema = z.object({
  type: z.enum(["tractor", "trailer", "straight_truck"]),
  status: z.enum(["active", "inactive", "maintenance", "decommissioned"]).default("active"),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  licensePlateState: z.string().optional(),
  unitNumber: z.string().min(1, "Unit number is required"),
  currentOdometer: z.number().optional(),
  fuelType: z.enum(["diesel", "gas"]).optional(),
  lastInspectionDate: z.string().optional(),
  nextInspectionDue: z.string().optional(),
  insuranceExpiration: z.string().optional(),
  registrationExpiration: z.string().optional(),
  notes: z.string().optional(),
})

// Create a new vehicle
export async function createVehicle(formData: FormData) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  try {
    const validatedFields = vehicleSchema.parse({
      type: formData.get("type"),
      status: formData.get("status") || "active",
      make: formData.get("make"),
      model: formData.get("model"),
      year: formData.get("year") ? Number(formData.get("year")) : undefined,
      vin: formData.get("vin"),
      licensePlate: formData.get("licensePlate"),
      licensePlateState: formData.get("licensePlateState"),
      unitNumber: formData.get("unitNumber"),
      currentOdometer: formData.get("currentOdometer") ? Number(formData.get("currentOdometer")) : undefined,
      fuelType: formData.get("fuelType"),
      lastInspectionDate: formData.get("lastInspectionDate"),
      nextInspectionDue: formData.get("nextInspectionDue"),
      insuranceExpiration: formData.get("insuranceExpiration"),
      registrationExpiration: formData.get("registrationExpiration"),
      notes: formData.get("notes"),
    })

    const vehicle = await db.vehicle.create({
      data: {
        organizationId: user.organizationId,
        type: validatedFields.type,
        status: validatedFields.status,
        make: validatedFields.make,
        model: validatedFields.model,
        year: validatedFields.year,
        vin: validatedFields.vin,
        licensePlate: validatedFields.licensePlate,
        licensePlateState: validatedFields.licensePlateState,
        unitNumber: validatedFields.unitNumber,
        currentOdometer: validatedFields.currentOdometer,
        lastOdometerUpdate: validatedFields.currentOdometer ? new Date() : null,
        fuelType: validatedFields.fuelType,
        lastInspectionDate: validatedFields.lastInspectionDate,
        nextInspectionDue: validatedFields.nextInspectionDue,
        insuranceExpiration: validatedFields.insuranceExpiration,
        registrationExpiration: validatedFields.registrationExpiration,
        notes: validatedFields.notes,
      }
    })

    revalidatePath("/vehicles")

    return {
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }

    return {
      success: false,
      message: "Failed to create vehicle",
    }
  }
}

// Update an existing vehicle
export async function updateVehicle(id: string, formData: FormData) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  try {
    const validatedFields = vehicleSchema.parse({
      type: formData.get("type"),
      status: formData.get("status") || "active",
      make: formData.get("make"),
      model: formData.get("model"),
      year: formData.get("year") ? Number(formData.get("year")) : undefined,
      vin: formData.get("vin"),
      licensePlate: formData.get("licensePlate"),
      licensePlateState: formData.get("licensePlateState"),
      unitNumber: formData.get("unitNumber"),
      currentOdometer: formData.get("currentOdometer") ? Number(formData.get("currentOdometer")) : undefined,
      fuelType: formData.get("fuelType"),
      lastInspectionDate: formData.get("lastInspectionDate"),
      nextInspectionDue: formData.get("nextInspectionDue"),
      insuranceExpiration: formData.get("insuranceExpiration"),
      registrationExpiration: formData.get("registrationExpiration"),
      notes: formData.get("notes"),
    })

    // Check if the vehicle exists and belongs to the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingVehicle) {
      return {
        success: false,
        message: "Vehicle not found",
      }
    }

    // Check if odometer was updated
    const odometerUpdated = existingVehicle.currentOdometer !== validatedFields.currentOdometer

    await db.vehicle.update({
      where: { id },
      data: {
        type: validatedFields.type,
        status: validatedFields.status,
        make: validatedFields.make,
        model: validatedFields.model,
        year: validatedFields.year,
        vin: validatedFields.vin,
        licensePlate: validatedFields.licensePlate,
        licensePlateState: validatedFields.licensePlateState,
        unitNumber: validatedFields.unitNumber,
        currentOdometer: validatedFields.currentOdometer,
        lastOdometerUpdate: odometerUpdated ? new Date() : existingVehicle.lastOdometerUpdate,
        fuelType: validatedFields.fuelType,
        lastInspectionDate: validatedFields.lastInspectionDate,
        nextInspectionDue: validatedFields.nextInspectionDue,
        insuranceExpiration: validatedFields.insuranceExpiration,
        registrationExpiration: validatedFields.registrationExpiration,
        notes: validatedFields.notes,
        updatedAt: new Date(),
      }
    })

    revalidatePath("/vehicles")
    revalidatePath(`/vehicles/${id}`)

    return {
      success: true,
      message: "Vehicle updated successfully",
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }

    return {
      success: false,
      message: "Failed to update vehicle",
    }
  }
}

// Update vehicle status
export async function updateVehicleStatus(id: string, status: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  try {
    // Check if the vehicle exists and belongs to the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingVehicle) {
      return {
        success: false,
        message: "Vehicle not found",
      }
    }

    await db.vehicle.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      }
    })

    revalidatePath("/vehicles")
    revalidatePath(`/vehicles/${id}`)

    return {
      success: true,
      message: "Vehicle status updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to update vehicle status",
    }
  }
}

// Update vehicle odometer
export async function updateVehicleOdometer(id: string, odometer: number) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  try {
    // Check if the vehicle exists and belongs to the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingVehicle) {
      return {
        success: false,
        message: "Vehicle not found",
      }
    }

    await db.vehicle.update({
      where: { id },
      data: {
        currentOdometer: odometer,
        lastOdometerUpdate: new Date(),
        updatedAt: new Date(),
      }
    })

    revalidatePath("/vehicles")
    revalidatePath(`/vehicles/${id}`)

    return {
      success: true,
      message: "Vehicle odometer updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to update vehicle odometer",
    }
  }
}

// Delete a vehicle
export async function deleteVehicle(id: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
    }
  }

  try {
    // Check if the vehicle exists and belongs to the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      }
    })

    if (!existingVehicle) {
      return {
        success: false,
        message: "Vehicle not found",
      }
    }

    await db.vehicle.delete({
      where: { id }
    })

    revalidatePath("/vehicles")

    return {
      success: true,
      message: "Vehicle deleted successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete vehicle",
    }
  }
}

// Get all vehicles for the current organization
export async function getVehicles() {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
      data: [],
    }
  }

  try {
    const allVehicles = await db.vehicle.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        loads: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        trailerLoads: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { unitNumber: "asc" },
    })

    return {
      success: true,
      data: allVehicles,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch vehicles",
      data: [],
    }
  }
}

// Get a single vehicle by ID
export async function getVehicle(id: string) {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
      data: null,
    }
  }

  try {
    const vehicle = await db.vehicle.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
      },
      include: {
        loads: {
          orderBy: { createdAt: "desc" },
          include: {
            driver: true,
          },
        },
        trailerLoads: {
          orderBy: { createdAt: "desc" },
          include: {
            driver: true,
          },
        },
        complianceDocuments: true,
      },
    })

    if (!vehicle) {
      return {
        success: false,
        message: "Vehicle not found",
        data: null,
      }
    }

    return {
      success: true,
      data: vehicle,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch vehicle",
      data: null,
    }
  }
}

// Get available vehicles for assignment (tractors)
export async function getAvailableTractors() {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
      data: [],
    }
  }

  try {
    const availableTractors = await db.vehicle.findMany({
      where: {
        organizationId: user.organizationId,
        status: "active",
        type: "tractor",
      },
      orderBy: { unitNumber: "asc" },
    })

    return {
      success: true,
      data: availableTractors,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch available tractors",
      data: [],
    }
  }
}

// Get available trailers for assignment
export async function getAvailableTrailers() {
  const user = await getCurrentUserWithOrg()

  if (!user) {
    return {
      success: false,
      message: "User not found",
      data: [],
    }
  }

  try {
    const availableTrailers = await db.vehicle.findMany({
      where: {
        organizationId: user.organizationId,
        status: "active",
        type: "trailer",
      },
      orderBy: { unitNumber: "asc" },
    })

    return {
      success: true,
      data: availableTrailers,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch available trailers",
      data: [],
    }
  }
}
