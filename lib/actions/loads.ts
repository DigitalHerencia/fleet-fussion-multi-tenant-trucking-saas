"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { loads } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentCompany } from "@/lib/auth"

// Schema for load creation/update
const loadSchema = z.object({
  driverId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
  trailerId: z.string().uuid().optional().nullable(),
  status: z.enum(["pending", "assigned", "in_transit", "completed", "cancelled"]),
  referenceNumber: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerContact: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  originAddress: z.string().min(1, "Origin address is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originState: z.string().min(1, "Origin state is required"),
  originZip: z.string().min(1, "Origin ZIP is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  destinationState: z.string().min(1, "Destination state is required"),
  destinationZip: z.string().min(1, "Destination ZIP is required"),
  pickupDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  commodity: z.string().optional(),
  weight: z.number().optional(),
  rate: z.number().optional(),
  miles: z.number().optional(),
  notes: z.string().optional(),
})

// Create a new load
export async function createLoad(formData: FormData) {
  const company = await getCurrentCompany()

  if (!company) {
    return {
      success: false,
      message: "Company not found",
    }
  }

  try {
    const validatedFields = loadSchema.parse({
      driverId: formData.get("driverId") || null,
      vehicleId: formData.get("vehicleId") || null,
      trailerId: formData.get("trailerId") || null,
      status: formData.get("status") || "pending",
      referenceNumber: formData.get("referenceNumber"),
      customerName: formData.get("customerName"),
      customerContact: formData.get("customerContact"),
      customerPhone: formData.get("customerPhone"),
      customerEmail: formData.get("customerEmail"),
      originAddress: formData.get("originAddress"),
      originCity: formData.get("originCity"),
      originState: formData.get("originState"),
      originZip: formData.get("originZip"),
      destinationAddress: formData.get("destinationAddress"),
      destinationCity: formData.get("destinationCity"),
      destinationState: formData.get("destinationState"),
      destinationZip: formData.get("destinationZip"),
      pickupDate: formData.get("pickupDate"),
      deliveryDate: formData.get("deliveryDate"),
      commodity: formData.get("commodity"),
      weight: formData.get("weight") ? Number(formData.get("weight")) : undefined,
      rate: formData.get("rate") ? Number(formData.get("rate")) : undefined,
      miles: formData.get("miles") ? Number(formData.get("miles")) : undefined,
      notes: formData.get("notes"),
    })

    // Convert date strings to Date objects
    const pickupDateForDb = validatedFields.pickupDate ? new Date(validatedFields.pickupDate) : undefined
    const deliveryDateForDb = validatedFields.deliveryDate ? new Date(validatedFields.deliveryDate) : undefined

    // Destructure validatedFields to exclude the original string date properties
    const { pickupDate, deliveryDate, ...restOfValidatedFields } = validatedFields;

    

    revalidatePath("/dispatch")

    return {
      success: true,
      message: "Load created successfully",
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
      message: "Failed to create load",
    }
  }
}

// Update an existing load
export async function updateLoad(id: string, formData: FormData) {
  const company = await getCurrentCompany()

  if (!company) {
    return {
      success: false,
      message: "Company not found",
    }
  }

  try {
    const validatedFields = loadSchema.parse({
      driverId: formData.get("driverId") || null,
      vehicleId: formData.get("vehicleId") || null,
      trailerId: formData.get("trailerId") || null,
      status: formData.get("status") || "pending",
      referenceNumber: formData.get("referenceNumber"),
      customerName: formData.get("customerName"),
      customerContact: formData.get("customerContact"),
      customerPhone: formData.get("customerPhone"),
      customerEmail: formData.get("customerEmail"),
      originAddress: formData.get("originAddress"),
      originCity: formData.get("originCity"),
      originState: formData.get("originState"),
      originZip: formData.get("originZip"),
      destinationAddress: formData.get("destinationAddress"),
      destinationCity: formData.get("destinationCity"),
      destinationState: formData.get("destinationState"),
      destinationZip: formData.get("destinationZip"),
      pickupDate: formData.get("pickupDate"),
      deliveryDate: formData.get("deliveryDate"),
      commodity: formData.get("commodity"),
      weight: formData.get("weight") ? Number(formData.get("weight")) : undefined,
      rate: formData.get("rate") ? Number(formData.get("rate")) : undefined,
      miles: formData.get("miles") ? Number(formData.get("miles")) : undefined,
      notes: formData.get("notes"),
    })

    // Convert date strings to Date objects
    const pickupDateForDb = validatedFields.pickupDate ? new Date(validatedFields.pickupDate) : undefined
    const deliveryDateForDb = validatedFields.deliveryDate ? new Date(validatedFields.deliveryDate) : undefined

    // Destructure validatedFields to exclude the original string date properties
    const { pickupDate, deliveryDate, ...restOfValidatedFields } = validatedFields;

    // Check if the load exists and belongs to the company
    const existingLoad = await db.query.loads.findFirst({
      where: (loads: { id: any; companyId: any }, { eq, and }: any) => and(eq(loads.id, id), eq(loads.companyId, company.id)),
    })

    if (!existingLoad) {
      return {
        success: false,
        message: "Load not found",
      }
    }

    await db
      .update(loads)
      .set({
        
      })
      .where(eq(loads.id, id))

    revalidatePath("/dispatch")
    revalidatePath(`/loads/${id}`)

    return {
      success: true,
      message: "Load updated successfully",
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
      message: "Failed to update load",
    }
  }
}

// Update load status
export async function updateLoadStatus(id: string, status: string) {
  const company = await getCurrentCompany()

  if (!company) {
    return {
      success: false,
      message: "Company not found",
    }
  }

  try {
    // Check if the load exists and belongs to the company
    const existingLoad = await db.query.loads.findFirst({
      where: (loads: { id: any; companyId: any }, { eq, and }: any) => and(eq(loads.id, id), eq(loads.companyId, company.id)),
    })

    if (!existingLoad) {
      return {
        success: false,
        message: "Load not found",
      }
    }

    await db
      .update(loads)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(loads.id, id))

    revalidatePath("/dispatch")
    revalidatePath(`/loads/${id}`)

    return {
      success: true,
      message: "Load status updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to update load status",
    }
  }
}

// Assign driver and vehicle to load
export async function assignLoad(id: string, driverId: string, vehicleId: string, trailerId?: string) {
  const company = await getCurrentCompany()

  if (!company) {
    return {
      success: false,
      message: "Company not found",
    }
  }

  try {
    // Check if the load exists and belongs to the company
    const existingLoad = await db.query.loads.findFirst({
      where: (loads: { id: any; companyId: any }, { eq, and }: any) => and(eq(loads.id, id), eq(loads.companyId, company.id)),
    })

    if (!existingLoad) {
      return {
        success: false,
        message: "Load not found",
      }
    }

    await db
      .update(loads)
      .set({
        driverId,
        vehicleId,
        trailerId: trailerId || null,
        status: "assigned",
        updatedAt: new Date(),
      })
      .where(eq(loads.id, id))

    revalidatePath("/dispatch")
    revalidatePath(`/loads/${id}`)

    return {
      success: true,
      message: "Load assigned successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to assign load",
    }
  }
}
