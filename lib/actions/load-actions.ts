"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "../../db"
import {
    loads as loadsSchema,
    drivers as driversSchema,
    vehicles as vehiclesSchema,
    UserRole
} from "../../db/schema"
import { eq, and } from "drizzle-orm"
import { getCurrentCompanyId, authorizeRoles } from "../../lib/auth"
import { v4 as uuidv4 } from "uuid"

// Helper function to protect routes based on role
async function protectRoute(role: UserRole) {
    await authorizeRoles([role])
}

// Helper for descending order (Drizzle ORM style)

// Schema for load validation
const loadInputSchema = z.object({
    driverId: z.string().uuid().nullable().optional(),
    vehicleId: z.string().uuid().nullable().optional(),
    trailerId: z.string().uuid().nullable().optional(),
    status: z.enum(["pending", "assigned", "in_transit", "completed", "cancelled"]),
    referenceNumber: z.string().optional(),
    customerName: z.string().min(1, "Customer name is required"),
    customerContact: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().email().optional().nullable(),
    originAddress: z.string().min(1, "Origin address is required"),
    originCity: z.string().min(1, "Origin city is required"),
    originState: z.string().min(1, "Origin state is required"),
    originZip: z.string().min(1, "Origin ZIP is required"),
    destinationAddress: z.string().min(1, "Destination address is required"),
    destinationCity: z.string().min(1, "Destination city is required"),
    destinationState: z.string().min(1, "Destination state is required"),
    destinationZip: z.string().min(1, "Destination ZIP is required"),
    pickupDate: z.string().or(z.date()).optional(),
    deliveryDate: z.string().or(z.date()).optional(),
    commodity: z.string().optional(),
    weight: z.number().or(z.string()).optional(),
    rate: z.number().or(z.string()).optional(),
    miles: z.number().optional(),
    notes: z.string().optional()
})
// Types for function returns

type SuccessResponse<T> = {
    success: true
    data: T
}

type ErrorResponse = {
    success: false
    error: string
    errors?: Record<string, string[]>
}

type LoadResponse<T> = SuccessResponse<T> | ErrorResponse

export type LoadWithRelations = typeof loadsSchema.$inferSelect & {
    driver?: {
        id: string
        firstName: string
        lastName: string
    } | null
    vehicle?: {
        id: string
        unitNumber: string
    } | null
    trailer?: {
        id: string
        unitNumber: string
    } | null
}

// Get all loads for a company with optional filtering
export async function getLoadsForCompany(
    companyId: string,
    options?: {
        status?: string
        driverId?: string
        vehicleId?: string
        trailerId?: string
        sortBy?: string
        sortOrder?: "asc" | "desc"
        limit?: number
        page?: number
    }
): Promise<LoadResponse<LoadWithRelations[]>> {
    try {
        await protectRoute(UserRole.DISPATCHER)

        // Build where conditions
        const whereConditions = [eq(loadsSchema.companyId, companyId)]

        if (options?.status) {
            whereConditions.push(eq(loadsSchema.status, options.status))
        }

        if (options?.driverId) {
            whereConditions.push(eq(loadsSchema.driverId, options.driverId))
        }

        if (options?.vehicleId) {
            whereConditions.push(eq(loadsSchema.vehicleId, options.vehicleId))
        }

        if (options?.trailerId) {
            whereConditions.push(eq(loadsSchema.trailerId, options.trailerId))
        }

        // Calculate pagination
        const limit = options?.limit || 100
        const offset = options?.page ? (options.page - 1) * limit : 0

        // Execute query
        const results = await db.query.loads.findMany({
            where: and(...whereConditions),
            limit,
            offset,
            with: {
                driver: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                vehicle: {
                    columns: {
                        id: true,
                        unitNumber: true
                    }
                },
                trailer: {
                    columns: {
                        id: true,
                        unitNumber: true
                    }
                }
            }
        })

        return {
            success: true,
            data: results
        }
    } catch (error) {
        console.error("[LoadActions] Error fetching loads:", error)
        return {
            success: false,
            error: "Failed to fetch loads",
            errors: undefined
        }
    }
}

// Get a single load by ID with related driver and vehicle data
export async function getLoadById(loadId: string, companyId: string): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    try {
        const load = await db.query.loads.findFirst({
            where: and(
                eq(loadsSchema.id, String(loadId)),
                eq(loadsSchema.companyId, String(companyId))
            ),
            with: {
                driver: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                vehicle: {
                    columns: {
                        id: true,
                        unitNumber: true
                    }
                },
                trailer: {
                    columns: {
                        id: true,
                        unitNumber: true
                    }
                }
            }
        })

        if (!load) {
            return {
                success: false,
                error: "Load not found"
            }
        }

        return {
            success: true,
            data: load
        }
    } catch (error) {
        console.error("Error fetching load:", error)
        return {
            success: false,
            error: "Failed to fetch load details"
        }
    }
}

/**
 * Creates a new load for the company. Validates input and returns result.
 * @param formData FormData containing load fields
 */
export async function createLoad(formData: FormData): Promise<LoadResponse<any>> {
    try {
        await protectRoute(UserRole.DISPATCHER)

        const companyId = await getCurrentCompanyId()

        if (!companyId) {
            return {
                success: false,
                error: "Company not found",
                errors: undefined
            }
        }

        const validatedFields = loadInputSchema.safeParse({
            driverId: formData.get("driverId") || null,
            vehicleId: formData.get("vehicleId") || null,
            trailerId: formData.get("trailerId") || null,
            status: formData.get("status") || "pending",
            referenceNumber:
                formData.get("referenceNumber") || `L-${Math.floor(10000 + Math.random() * 90000)}`,
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
            notes: formData.get("notes")
        })

        if (!validatedFields.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: validatedFields.error.flatten().fieldErrors
            }
        }

        // Actually insert the load into the database
        const id = uuidv4()
        await db.insert(loadsSchema).values({
            id,
            companyId,
            driverId: validatedFields.data.driverId,
            vehicleId: validatedFields.data.vehicleId,
            trailerId: validatedFields.data.trailerId,
            status: validatedFields.data.status,
            referenceNumber: validatedFields.data.referenceNumber,
            customerName: validatedFields.data.customerName,
            customerContact: validatedFields.data.customerContact,
            customerPhone: validatedFields.data.customerPhone,
            customerEmail: validatedFields.data.customerEmail,
            originAddress: validatedFields.data.originAddress,
            originCity: validatedFields.data.originCity,
            originState: validatedFields.data.originState,
            originZip: validatedFields.data.originZip,
            destinationAddress: validatedFields.data.destinationAddress,
            destinationCity: validatedFields.data.destinationCity,
            destinationState: validatedFields.data.destinationState,
            destinationZip: validatedFields.data.destinationZip,
            pickupDate: validatedFields.data.pickupDate
                ? new Date(validatedFields.data.pickupDate)
                : undefined,
            deliveryDate: validatedFields.data.deliveryDate
                ? new Date(validatedFields.data.deliveryDate)
                : undefined,
            commodity: validatedFields.data.commodity,
            weight: validatedFields.data.weight?.toString(),
            rate: validatedFields.data.rate?.toString(),
            miles: validatedFields.data.miles,
            notes: validatedFields.data.notes,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        // Revalidate relevant paths
        revalidatePath("/dispatch")

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("[LoadActions] Failed to create load:", error)

        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to create load. Please try again.",
            errors: undefined
        }
    }
}

// Update an existing load
export async function updateLoad(
    id: string,
    driverId: string | null,
    vehicleId: string | null,
    trailerId: string | null,
    formData: FormData
): Promise<LoadResponse<any>> {
    try {
        await protectRoute(UserRole.DISPATCHER)

        const companyId = await getCurrentCompanyId()

        if (!companyId) {
            return {
                success: false,
                error: "Company not found",
                errors: undefined
            }
        }

        // Check if the load exists and belongs to the company
        const existingLoad = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, String(id)), eq(loadsSchema.companyId, String(companyId)))
        })

        if (!existingLoad) {
            return {
                success: false,
                error: "Load not found or you don't have permission to edit it",
                errors: undefined
            }
        }

        const validatedFields = loadInputSchema.safeParse({
            driverId: formData.get("driverId") || null,
            vehicleId: formData.get("vehicleId") || null,
            trailerId: formData.get("trailerId") || null,
            status: formData.get("status"),
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
            notes: formData.get("notes")
        })

        if (!validatedFields.success) {
            return {
                success: false,
                error: "Validation failed",
                errors: validatedFields.error.flatten().fieldErrors
            }
        }

        // Update the load
        await db
            .update(loadsSchema)
            .set({
                driverId: validatedFields.data.driverId,
                vehicleId: validatedFields.data.vehicleId,
                trailerId: validatedFields.data.trailerId,
                status: validatedFields.data.status,
                referenceNumber: validatedFields.data.referenceNumber,
                customerName: validatedFields.data.customerName,
                customerContact: validatedFields.data.customerContact,
                customerPhone: validatedFields.data.customerPhone,
                customerEmail: validatedFields.data.customerEmail,
                originAddress: validatedFields.data.originAddress,
                originCity: validatedFields.data.originCity,
                originState: validatedFields.data.originState,
                originZip: validatedFields.data.originZip,
                destinationAddress: validatedFields.data.destinationAddress,
                destinationCity: validatedFields.data.destinationCity,
                destinationState: validatedFields.data.destinationState,
                destinationZip: validatedFields.data.destinationZip,
                commodity: validatedFields.data.commodity,
                weight: validatedFields.data.weight?.toString(),
                rate: validatedFields.data.rate?.toString(),
                miles: validatedFields.data.miles,
                notes: validatedFields.data.notes,
                updatedAt: new Date()
            })
            .where(eq(loadsSchema.id, String(id)))

        revalidatePath("/dispatch")

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("[LoadActions] Failed to update load:", error)

        return {
            success: false,
            error:
                error instanceof Error ? error.message : "Failed to update load. Please try again.",
            errors: undefined
        }
    }
}

// Get available drivers for assignment
export async function getAvailableDrivers(): Promise<LoadResponse<any[]>> {
    await protectRoute(UserRole.DISPATCHER)

    const companyId = await getCurrentCompanyId()

    if (!companyId) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Get all active drivers for the company
        const drivers = await db
            .select()
            .from(driversSchema)
            .where(and(eq(driversSchema.status, "active"), eq(driversSchema.companyId, companyId)))

        return {
            success: true,
            data: drivers
        }
    } catch (error) {
        console.error("Error fetching drivers:", error)
        return {
            success: false,
            error: "Failed to fetch available drivers"
        }
    }
}

// Get available vehicles for assignment
export async function getAvailableVehicles(): Promise<LoadResponse<any[]>> {
    await protectRoute(UserRole.DISPATCHER)

    const companyId = await getCurrentCompanyId()

    if (!companyId) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Get all available vehicles for the company
        const vehicles = await db
            .select()
            .from(vehiclesSchema)
            .where(
                and(eq(vehiclesSchema.status, "active"), eq(vehiclesSchema.companyId, companyId))
            )

        return {
            success: true,
            data: vehicles
        }
    } catch (error) {
        console.error("Error fetching vehicles:", error)
        return {
            success: false,
            error: "Failed to fetch available vehicles"
        }
    }
}
