"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import {
  loads as loadsSchema,
  drivers as driversSchema,
  vehicles as vehiclesSchema,
  UserRole,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentCompanyId, authorizeRoles } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { 
  createLoadSchema, 
  updateLoadSchema} from "@/lib/validation/load-schema";

// Helper function to protect routes based on role
async function protectRoute(role: UserRole) {
  await authorizeRoles([role]);
}
// Types for function returns

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
};

type LoadResponse<T> = SuccessResponse<T> | ErrorResponse;

export type LoadWithRelations = typeof loadsSchema.$inferSelect & {
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    unitNumber: string;
  } | null;
  trailer?: {
    id: string;
    unitNumber: string;
  } | null;
};

// Get all loads for a company with optional filtering
export async function getLoadsForCompany(
  companyId: string,
  options?: {
    status?: string;
    driverId?: string;
    vehicleId?: string;
    trailerId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    page?: number;
  },
): Promise<LoadResponse<LoadWithRelations[]>> {
  try {
    await protectRoute(UserRole.DISPATCHER);

    // Build where conditions
    const whereConditions = [eq(loadsSchema.companyId, companyId)];

    if (options?.status) {
      whereConditions.push(eq(loadsSchema.status, options.status));
    }

    if (options?.driverId) {
      whereConditions.push(eq(loadsSchema.driverId, options.driverId));
    }

    if (options?.vehicleId) {
      whereConditions.push(eq(loadsSchema.vehicleId, options.vehicleId));
    }

    if (options?.trailerId) {
      whereConditions.push(eq(loadsSchema.trailerId, options.trailerId));
    }

    // Calculate pagination
    const limit = options?.limit || 100;
    const offset = options?.page ? (options.page - 1) * limit : 0;

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
            lastName: true,
          },
        },
        vehicle: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
        trailer: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
      },
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("[LoadActions] Error fetching loads:", error);
    return {
      success: false,
      error: "Failed to fetch loads",
      errors: undefined,
    };
  }
}

// Get a single load by ID with related driver and vehicle data
export async function getLoadById(
  loadId: string,
  companyId: string,
): Promise<LoadResponse<LoadWithRelations>> {
  await protectRoute(UserRole.DISPATCHER);

  try {
    const load = await db.query.loads.findFirst({
      where: and(
        eq(loadsSchema.id, String(loadId)),
        eq(loadsSchema.companyId, String(companyId)),
      ),
      with: {
        driver: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
        trailer: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
      },
    });

    if (!load) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    return {
      success: true,
      data: load,
    };
  } catch (error) {
    console.error("Error fetching load:", error);
    return {
      success: false,
      error: "Failed to fetch load details",
    };
  }
}

/**
 * Creates a new load for the company. Validates input and returns result.
 * @param formData FormData containing load fields
 */
export async function createLoad(
  formData: FormData,
): Promise<LoadResponse<LoadWithRelations>> {
  try {
    await protectRoute(UserRole.DISPATCHER);

    const companyId = await getCurrentCompanyId();

    if (!companyId) {
      return {
        success: false,
        error: "Company not found",
        errors: undefined,
      };
    }

    // Generate reference number if not provided
    const formDataObject = Object.fromEntries(formData);
    const formDataWithDefaults = new FormData();

    Object.entries(formDataObject).forEach(([key, value]) => {
      formDataWithDefaults.append(key, value as string);
    });

    if (!formDataWithDefaults.get("referenceNumber")) {
      formDataWithDefaults.set(
        "referenceNumber", 
        `L-${Math.floor(10000 + Math.random() * 90000)}`
      );
    }
    
    const validatedFields = createLoadSchema.safeParse(
      Object.fromEntries(formDataWithDefaults)
    );

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Actually insert the load into the database
    const id = uuidv4();
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
      updatedAt: new Date(),
    });

    // Revalidate relevant paths
    revalidatePath("/dispatch");

    // Fetch the newly created load with relations
    const newLoad = await db.query.loads.findFirst({
      where: eq(loadsSchema.id, id),
      with: {
        driver: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
        trailer: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
      },
    });

    if (!newLoad) {
      return {
        success: false,
        error: "Failed to retrieve the newly created load",
      };
    }

    return {
      success: true,
      data: newLoad,
    };
  } catch (error) {
    console.error("[LoadActions] Failed to create load:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create load. Please try again.",
      errors: undefined,
    };
  }
}

// Update an existing load
export async function updateLoad(
  id: string,
  driverId: string | null,
  vehicleId: string | null,
  trailerId: string | null,
  formData: FormData,
): Promise<LoadResponse<LoadWithRelations>> {
  try {
    await protectRoute(UserRole.DISPATCHER);

    const companyId = await getCurrentCompanyId();

    if (!companyId) {
      return {
        success: false,
        error: "Company not found",
        errors: undefined,
      };
    }

    // Check if the load exists and belongs to the company
    const existingLoad = await db.query.loads.findFirst({
      where: and(
        eq(loadsSchema.id, String(id)),
        eq(loadsSchema.companyId, String(companyId)),
      ),
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found or you don't have permission to edit it",
        errors: undefined,
      };
    }

    // Create a new FormData with ID and other properties
    const formDataWithProperties = new FormData(undefined);
    formDataWithProperties.set("id", id);
    
    // Set driver, vehicle and trailer IDs from params if not in formData
    if (driverId !== undefined && !formDataWithProperties.get("driverId")) {
      formDataWithProperties.set("driverId", driverId || "");
    }
    if (vehicleId !== undefined && !formDataWithProperties.get("vehicleId")) {
      formDataWithProperties.set("vehicleId", vehicleId || "");
    }
    if (trailerId !== undefined && !formDataWithProperties.get("trailerId")) {
      formDataWithProperties.set("trailerId", trailerId || "");
    }
    
    const validatedFields = updateLoadSchema.safeParse(
      Object.fromEntries(formDataWithProperties)
    );

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
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
        updatedAt: new Date(),
      })
      .where(eq(loadsSchema.id, String(id)));

    revalidatePath("/dispatch");

    // Fetch the updated load with relations
    const updatedLoad = await db.query.loads.findFirst({
      where: eq(loadsSchema.id, id),
      with: {
        driver: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
        trailer: {
          columns: {
            id: true,
            unitNumber: true,
          },
        },
      },
    });

    if (!updatedLoad) {
      return {
        success: false,
        error: "Failed to retrieve the updated load",
      };
    }

    return {
      success: true,
      data: updatedLoad,
    };
  } catch (error) {
    console.error("[LoadActions] Failed to update load:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update load. Please try again.",
      errors: undefined,
    };
  }
}

// Get available drivers for assignment
export async function getAvailableDrivers(): Promise<LoadResponse<unknown[]>> {
  await protectRoute(UserRole.DISPATCHER);

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    return {
      success: false,
      error: "Company not found",
    };
  }

  try {
    // Get all active drivers for the company
    const drivers = await db
      .select()
      .from(driversSchema)
      .where(
        and(
          eq(driversSchema.status, "active"),
          eq(driversSchema.companyId, companyId),
        ),
      );

    return {
      success: true,
      data: drivers,
    };
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return {
      success: false,
      error: "Failed to fetch available drivers",
    };
  }
}

// Get available vehicles for assignment
export async function getAvailableVehicles(): Promise<LoadResponse<unknown[]>> {
  await protectRoute(UserRole.DISPATCHER);

  const companyId = await getCurrentCompanyId();

  if (!companyId) {
    return {
      success: false,
      error: "Company not found",
    };
  }

  try {
    // Get all available vehicles for the company
    const vehicles = await db
      .select()
      .from(vehiclesSchema)
      .where(
        and(
          eq(vehiclesSchema.status, "active"),
          eq(vehiclesSchema.companyId, companyId),
        ),
      );

    return {
      success: true,
      data: vehicles,
    };
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return {
      success: false,
      error: "Failed to fetch available vehicles",
    };
  }
}
