"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { loads as loadsSchema } from "@/db/schema"
import { eq, and, desc, asc, type AnyColumn } from "drizzle-orm"
import { getCurrentCompanyFromAuth, protectRoute, UserRole } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

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

const loadAssignmentSchema = z.object({
    driverId: z.string().uuid().nullable(),
    vehicleId: z.string().uuid().nullable(),
    trailerId: z.string().uuid().nullable()
})

const loadStatusSchema = z.enum(["pending", "assigned", "in_transit", "completed", "cancelled"])

// Types for function returns
type SuccessResponse<T> = {
    success: true
    data: T
}

type ErrorResponse = {
    success: false
    error: string
}

type LoadResponse<T> = SuccessResponse<T> | ErrorResponse

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
): Promise<LoadResponse<any[]>> {
    await protectRoute(UserRole.DISPATCHER)

    try {
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

        // Build sort options
        let sortOptions: any = [];
        if (options?.sortBy && options.sortBy in loadsSchema) {
            const column = loadsSchema[options.sortBy as keyof typeof loadsSchema] as unknown as AnyColumn;
            sortOptions =
                options.sortOrder === "asc"
                    ? [asc(column)]
                    : options.sortOrder === "desc"
                    ? [desc(column)]
                    : [];
        } else {
            // Default sort by updated date descending
            sortOptions = [desc(loadsSchema.updatedAt)];
        }

        // Calculate pagination
        const limit = options?.limit || 100
        const offset = options?.page ? (options.page - 1) * limit : 0

        // Execute query
        const results = await db.query.loads.findMany({
            where: and(...whereConditions),
            orderBy: sortOptions,
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
        console.error("Error fetching loads:", error)
        return {
            success: false,
            error: "Failed to fetch loads"
        }
    }
}

// Get a single load by ID with related driver and vehicle data
export async function getLoadById(loadId: string, companyId: string): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    try {
        const load = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, loadId), eq(loadsSchema.companyId, companyId)),
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

// Create a new load
export async function createLoad(formData: FormData): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    const company = await getCurrentCompanyFromAuth()

    if (!company) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        const validatedFields = loadInputSchema.parse({
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

        // Convert date strings to Date objects
        const pickupDate = validatedFields.pickupDate
            ? new Date(validatedFields.pickupDate)
            : undefined
        const deliveryDate = validatedFields.deliveryDate
            ? new Date(validatedFields.deliveryDate)
            : undefined

        // Create a unique ID for the new load
        const id = uuidv4()

        // Insert the new load with proper conversions for numeric fields
        await db.insert(loadsSchema).values({
            id,
            companyId: company.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            driverId: validatedFields.driverId,
            vehicleId: validatedFields.vehicleId,
            trailerId: validatedFields.trailerId,
            status: validatedFields.status,
            referenceNumber: validatedFields.referenceNumber,
            customerName: validatedFields.customerName,
            customerContact: validatedFields.customerContact,
            customerPhone: validatedFields.customerPhone,
            customerEmail: validatedFields.customerEmail,
            originAddress: validatedFields.originAddress,
            originCity: validatedFields.originCity,
            originState: validatedFields.originState,
            originZip: validatedFields.originZip,
            destinationAddress: validatedFields.destinationAddress,
            destinationCity: validatedFields.destinationCity,
            destinationState: validatedFields.destinationState,
            destinationZip: validatedFields.destinationZip,
            pickupDate,
            deliveryDate,
            commodity: validatedFields.commodity,
            weight: validatedFields.weight?.toString(),
            rate: validatedFields.rate?.toString(),
            miles: validatedFields.miles,
            notes: validatedFields.notes
        })

        // Revalidate relevant paths
        revalidatePath("/dispatch")

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("Failed to create load:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `Invalid form data: ${error.errors.map(e => e.message).join(", ")}`
            }
        }

        return {
            success: false,
            error: "Failed to create load. Please try again."
        }
    }
}

// Update an existing load
export async function updateLoad(id: string, formData: FormData): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    const company = await getCurrentCompanyFromAuth()

    if (!company) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Check if the load exists and belongs to the company
        const existingLoad = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, id), eq(loadsSchema.companyId, company.id))
        })

        if (!existingLoad) {
            return {
                success: false,
                error: "Load not found or you don't have permission to edit it"
            }
        }

        const validatedFields = loadInputSchema.parse({
            driverId: formData.get("driverId") || null,
            vehicleId: formData.get("vehicleId") || null,
            trailerId: formData.get("trailerId") || null,
            status: formData.get("status") || existingLoad.status,
            referenceNumber: formData.get("referenceNumber") || existingLoad.referenceNumber,
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

        // Convert date strings to Date objects
        const pickupDate = validatedFields.pickupDate
            ? new Date(validatedFields.pickupDate)
            : undefined
        const deliveryDate = validatedFields.deliveryDate
            ? new Date(validatedFields.deliveryDate)
            : undefined

        // Update the load
        await db
            .update(loadsSchema)
            .set({
                driverId: validatedFields.driverId,
                vehicleId: validatedFields.vehicleId,
                trailerId: validatedFields.trailerId,
                status: validatedFields.status,
                referenceNumber: validatedFields.referenceNumber,
                customerName: validatedFields.customerName,
                customerContact: validatedFields.customerContact,
                customerPhone: validatedFields.customerPhone,
                customerEmail: validatedFields.customerEmail,
                originAddress: validatedFields.originAddress,
                originCity: validatedFields.originCity,
                originState: validatedFields.originState,
                originZip: validatedFields.originZip,
                destinationAddress: validatedFields.destinationAddress,
                destinationCity: validatedFields.destinationCity,
                destinationState: validatedFields.destinationState,
                destinationZip: validatedFields.destinationZip,
                pickupDate,
                deliveryDate,
                commodity: validatedFields.commodity,
                weight: validatedFields.weight?.toString(),
                rate: validatedFields.rate?.toString(),
                miles: validatedFields.miles,
                notes: validatedFields.notes,
                updatedAt: new Date()
            })
            .where(eq(loadsSchema.id, id))

        // Revalidate relevant paths
        revalidatePath("/dispatch")
        revalidatePath(`/dispatch/${id}`)
        revalidatePath(`/dispatch/${id}/edit`)

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("Failed to update load:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `Invalid form data: ${error.errors.map(e => e.message).join(", ")}`
            }
        }

        return {
            success: false,
            error: "Failed to update load. Please try again."
        }
    }
}

// Update load status
export async function updateLoadStatus(id: string, status: string): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    const company = await getCurrentCompanyFromAuth()

    if (!company) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Validate status
        const validatedStatus = loadStatusSchema.parse(status)

        // Check if the load exists and belongs to the company
        const existingLoad = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, id), eq(loadsSchema.companyId, company.id))
        })

        if (!existingLoad) {
            return {
                success: false,
                error: "Load not found or you don't have permission to edit it"
            }
        }

        // Update the load status
        await db
            .update(loadsSchema)
            .set({
                status: validatedStatus,
                updatedAt: new Date()
            })
            .where(eq(loadsSchema.id, id))

        // Revalidate relevant paths
        revalidatePath("/dispatch")
        revalidatePath(`/dispatch/${id}`)
        revalidatePath(`/dispatch/${id}/edit`)

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("Failed to update load status:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `Invalid status: ${error.errors.map(e => e.message).join(", ")}`
            }
        }

        return {
            success: false,
            error: "Failed to update load status. Please try again."
        }
    }
}

// Update load assignment (driver, vehicle, trailer)
export async function updateLoadAssignment(
    id: string,
    driverId: string | null,
    vehicleId: string | null,
    trailerId: string | null
): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    const company = await getCurrentCompanyFromAuth()

    if (!company) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Validate input
        const validatedFields = loadAssignmentSchema.parse({
            driverId,
            vehicleId,
            trailerId
        })

        // Check if the load exists and belongs to the company
        const existingLoad = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, id), eq(loadsSchema.companyId, company.id))
        })

        if (!existingLoad) {
            return {
                success: false,
                error: "Load not found or you don't have permission to edit it"
            }
        }

        // Update the load assignment
        await db
            .update(loadsSchema)
            .set({
                driverId: validatedFields.driverId,
                vehicleId: validatedFields.vehicleId,
                trailerId: validatedFields.trailerId,
                // If we have any assignment but status is still pending, set to assigned
                status:
                    (validatedFields.driverId || validatedFields.vehicleId) &&
                    existingLoad.status === "pending"
                        ? "assigned"
                        : existingLoad.status,
                updatedAt: new Date()
            })
            .where(eq(loadsSchema.id, id))

        // Revalidate relevant paths
        revalidatePath("/dispatch")
        revalidatePath(`/dispatch/${id}`)
        revalidatePath(`/dispatch/${id}/edit`)

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("Failed to update load assignment:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: `Invalid assignment data: ${error.errors.map(e => e.message).join(", ")}`
            }
        }

        return {
            success: false,
            error: "Failed to update load assignment. Please try again."
        }
    }
}

// Delete a load
export async function deleteLoad(id: string): Promise<LoadResponse<any>> {
    await protectRoute(UserRole.DISPATCHER)

    const company = await getCurrentCompanyFromAuth()

    if (!company) {
        return {
            success: false,
            error: "Company not found"
        }
    }

    try {
        // Check if the load exists and belongs to the company
        const existingLoad = await db.query.loads.findFirst({
            where: and(eq(loadsSchema.id, id), eq(loadsSchema.companyId, company.id))
        })

        if (!existingLoad) {
            return {
                success: false,
                error: "Load not found or you don't have permission to delete it"
            }
        }

        // Delete the load
        await db.delete(loadsSchema).where(eq(loadsSchema.id, id))

        // Revalidate relevant paths
        revalidatePath("/dispatch")

        return {
            success: true,
            data: { id }
        }
    } catch (error) {
        console.error("Failed to delete load:", error)
        return {
            success: false,
            error: "Failed to delete load. Please try again."
        }
    }
}

// Fetch all active drivers for a company
export async function getDriversForCompany(companyId: string) {
    await protectRoute(UserRole.DISPATCHER)
    try {
        const drivers = await db.query.drivers.findMany({
            where: and(
                eq(db.drivers.companyId, companyId),
                eq(db.drivers.status, "active")
            ),
            columns: {
                id: true,
                firstName: true,
                lastName: true,
                status: true
            }
        })
        return { success: true, data: drivers }
    } catch (error) {
        console.error("Error fetching drivers:", error)
        return { success: false, error: "Failed to fetch drivers" }
    }
}

// Fetch all active vehicles for a company
export async function getVehiclesForCompany(companyId: string) {
    await protectRoute(UserRole.DISPATCHER)
    try {
        const vehicles = await db.query.vehicles.findMany({
            where: and(
                eq(db.vehicles.companyId, companyId),
                eq(db.vehicles.status, "active")
            ),
            columns: {
                id: true,
                unitNumber: true,
                type: true,
                status: true
            }
        })
        return { success: true, data: vehicles }
    } catch (error) {
        console.error("Error fetching vehicles:", error)
        return { success: false, error: "Failed to fetch vehicles" }
    }
}
