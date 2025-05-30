"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/database";
import {
  createLoadSchema,
  updateLoadSchema,
  loadAssignmentSchema,
  loadStatusUpdateSchema,
  bulkLoadOperationSchema,
  loadDocumentSchema,
  trackingUpdateSchema,
  loadAlertSchema,
  type BulkLoadOperationInput,
  type CreateLoadInput,
  type LoadAssignmentInput,
  type LoadStatusUpdateInput,
  type UpdateLoadInput,
} from "@/validations/dispatch";
import { LoadStatus, DriverStatus, VehicleStatus } from "@prisma/client";

// Only use LoadStatus: pending, assigned, in_transit, delivered, cancelled
// Only use VehicleStatus: active, inactive, maintenance, decommissioned
// Only use DriverStatus: active, inactive, suspended, terminated
// Update all status assignments and comparisons accordingly

// Helper function to check user permissions
async function checkUserPermissions(orgId: string, requiredPermissions: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user belongs to the organization and has required permissions
  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId, // Assuming clerkId is the correct field name
      organizationId: orgId,
    },
  });

  if (!user) {
    throw new Error("User not found or not member of organization");
  }

  // Access permissions directly if they're a relation on the user model
  let userPermissions: string[] = [];
  if (Array.isArray(user.permissions)) {
    userPermissions = user.permissions
      .map((p: any) => typeof p === "object" && p !== null && "name" in p ? p.name : null)
      .filter((name: any) => typeof name === "string");
  }
  
  const hasPermission = requiredPermissions.some(permission => 
    userPermissions.includes(permission) || userPermissions.includes("*")
  );

  if (!hasPermission) {
    throw new Error(`Insufficient permissions. Required: ${requiredPermissions.join(" or ")}`);
  }

  return user;
}

// Helper function to create audit log entry
async function createAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  changes: Record<string, any>,
  userId: string,
  organizationId: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      changes: changes as any, // Use 'as any' to handle JSON serialization
      userId,
      organizationId,
      timestamp: new Date(),
    },
  });
}

// Helper function to generate reference number
function generateReferenceNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `FL${timestamp.slice(-6)}${random}`;
}

// Infer types from Zod schemas
import type { Customer as CustomerInput, Location as LocationInput } from "@/types/dispatch";

// Minimal types for driver, vehicle, trailer
interface IdObj { id?: string }

// Create load action
export async function createLoadAction(orgId: string, data: CreateLoadInput) {
  try {
    const user = await checkUserPermissions(orgId, ["loads:create", "dispatch:manage"]);
    const validatedData = createLoadSchema.parse(data);
    // Generate reference number if not provided
    let referenceNumber = validatedData.referenceNumber;
    if (!referenceNumber) {
      referenceNumber = generateReferenceNumber();
    }
    if (typeof referenceNumber !== "string") {
      referenceNumber = String(referenceNumber ?? "");
    }
    // Check if reference number is unique within tenant
    const existingLoad = await prisma.load.findFirst({
      where: {
        organizationId: orgId,
        referenceNumber,
      },
    });
    if (existingLoad) {
      return {
        success: false,
        error: "Reference number already exists",
      };
    }
    // Ensure rate is a number or string (Decimal)
    const { rate, rateDetails, customer, origin, destination, driver, vehicle, trailer, ...rest } = validatedData;
    if (typeof rate !== "number" && typeof rate !== "string") {
      return {
        success: false,
        error: "Rate must be a number or string",
      };
    }
    // Type guards for nested objects
    const safeCustomer: Partial<CustomerInput> | undefined = (customer && typeof customer === "object") ? customer : undefined;
    const safeOrigin: Partial<LocationInput> | undefined = (origin && typeof origin === "object") ? origin : undefined;
    const safeDestination: Partial<LocationInput> | undefined = (destination && typeof destination === "object") ? destination : undefined;
    const safeDriver = driver && typeof driver === "object" ? (driver as IdObj) : undefined;
    const safeVehicle = vehicle && typeof vehicle === "object" ? (vehicle as IdObj) : undefined;
    const safeTrailer = trailer && typeof trailer === "object" ? (trailer as IdObj) : undefined;
    // Map nested fields to flat DB fields
    const dbData: any = {
      ...rest,
      referenceNumber,
      rate,
      organizationId: orgId,
      status: LoadStatus.pending,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (safeCustomer) {
      dbData.customerName = safeCustomer.name ?? null;
      dbData.customerContact = safeCustomer.contactName ?? null;
      dbData.customerPhone = safeCustomer.phone ?? null;
      dbData.customerEmail = safeCustomer.email ?? null;
    }
    if (safeOrigin) {
      dbData.originAddress = safeOrigin.address ?? null;
      dbData.originCity = safeOrigin.city ?? null;
      dbData.originState = safeOrigin.state ?? null;
      dbData.originZip = safeOrigin.zipCode ?? null;
      dbData.originLat = safeOrigin.latitude ?? null;
      dbData.originLng = safeOrigin.longitude ?? null;
    }
    if (safeDestination) {
      dbData.destinationAddress = safeDestination.address ?? null;
      dbData.destinationCity = safeDestination.city ?? null;
      dbData.destinationState = safeDestination.state ?? null;
      dbData.destinationZip = safeDestination.zipCode ?? null;
      dbData.destinationLat = safeDestination.latitude ?? null;
      dbData.destinationLng = safeDestination.longitude ?? null;
    }
    if (safeDriver && safeDriver.id) dbData.driverId = safeDriver.id;
    if (safeVehicle && safeVehicle.id) dbData.vehicleId = safeVehicle.id;
    if (safeTrailer && safeTrailer.id) dbData.trailerId = safeTrailer.id;
    await prisma.load.create({ data: dbData });
    revalidatePath(`/dashboard/${orgId}/dispatch`);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating load:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create load",
    };
  }
}

// Update load action
export async function updateLoadAction(loadId: string, data: UpdateLoadInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    // Get load to verify tenant and permissions
    const existingLoad = await prisma.load.findUnique({
      where: { id: loadId },
      select: { organizationId: true, status: true },
    });
    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }
    const user = await checkUserPermissions(existingLoad.organizationId, ["loads:update", "dispatch:manage"]);
    const validatedData = updateLoadSchema.parse(data);
    // Remove id from validated data as it shouldn't be updated
    const { id, rate, rateDetails, customer, origin, destination, driver, vehicle, trailer, ...updateData } = validatedData;
    if (typeof rate !== "number" && typeof rate !== "string" && typeof rate !== "undefined") {
      return {
        success: false,
        error: "Rate must be a number or string",
      };
    }
    // Type guards for nested objects
    const safeCustomer: Partial<CustomerInput> | undefined = (customer && typeof customer === "object") ? customer : undefined;
    const safeOrigin: Partial<LocationInput> | undefined = (origin && typeof origin === "object") ? origin : undefined;
    const safeDestination: Partial<LocationInput> | undefined = (destination && typeof destination === "object") ? destination : undefined;
    const safeDriver = driver && typeof driver === "object" ? (driver as IdObj) : undefined;
    const safeVehicle = vehicle && typeof vehicle === "object" ? (vehicle as IdObj) : undefined;
    const safeTrailer = trailer && typeof trailer === "object" ? (trailer as IdObj) : undefined;
    // Map nested fields to flat DB fields
    const dbData: any = {
      ...updateData,
      updatedAt: new Date(),
    };
    if (typeof rate !== "undefined") dbData.rate = rate;
    if (safeCustomer) {
      dbData.customerName = safeCustomer.name ?? null;
      dbData.customerContact = safeCustomer.contactName ?? null;
      dbData.customerPhone = safeCustomer.phone ?? null;
      dbData.customerEmail = safeCustomer.email ?? null;
    }
    if (safeOrigin) {
      dbData.originAddress = safeOrigin.address ?? null;
      dbData.originCity = safeOrigin.city ?? null;
      dbData.originState = safeOrigin.state ?? null;
      dbData.originZip = safeOrigin.zipCode ?? null;
      dbData.originLat = safeOrigin.latitude ?? null;
      dbData.originLng = safeOrigin.longitude ?? null;
    }
    if (safeDestination) {
      dbData.destinationAddress = safeDestination.address ?? null;
      dbData.destinationCity = safeDestination.city ?? null;
      dbData.destinationState = safeDestination.state ?? null;
      dbData.destinationZip = safeDestination.zipCode ?? null;
      dbData.destinationLat = safeDestination.latitude ?? null;
      dbData.destinationLng = safeDestination.longitude ?? null;
    }
    if (safeDriver && safeDriver.id) dbData.driverId = safeDriver.id;
    if (safeVehicle && safeVehicle.id) dbData.vehicleId = safeVehicle.id;
    if (safeTrailer && safeTrailer.id) dbData.trailerId = safeTrailer.id;
    // Update the load
    const updatedLoad = await prisma.load.update({
      where: { id: loadId },
      data: dbData,
    });
    // Create audit log
    await createAuditLog(
      "UPDATE",
      "Load",
      loadId,
      updateData,
      user.id,
      existingLoad.organizationId
    );
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch/${loadId}`);
    return {
      success: true,
      data: updatedLoad,
    };
  } catch (error) {
    console.error("Error updating load:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update load",
    };
  }
}

// Delete load action
export async function deleteLoadAction(loadId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get load to verify tenant and permissions
    const existingLoad = await prisma.load.findUnique({
      where: { id: loadId },
      select: { organizationId: true, status: true, referenceNumber: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.organizationId, ["loads:delete", "dispatch:manage"]);

    // Check if load can be deleted (only pending or cancelled loads)
    if (
      existingLoad.status !== LoadStatus.pending &&
      existingLoad.status !== LoadStatus.cancelled
    ) {
      return {
        success: false,
        error: "Cannot delete load in current status",
      };
    }

    // Delete the load directly
    await prisma.load.delete({ where: { id: loadId } });

    // Create audit log
    await createAuditLog(
      "DELETE",
      "Load",
      loadId,
      { referenceNumber: existingLoad.referenceNumber },
      user.id,
      existingLoad.organizationId
    );

    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting load:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete load",
    };
  }
}

// Assign load action
export async function assignLoadAction(data: LoadAssignmentInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedData = loadAssignmentSchema.parse(data);

    // Get load to verify tenant and permissions
    const existingLoad = await prisma.load.findUnique({
      where: { id: validatedData.loadId },
      select: { organizationId: true, status: true, driverId: true, vehicleId: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.organizationId, ["loads:assign", "dispatch:manage"]);

    // Verify driver and vehicle belong to the same tenant
    const [driver, vehicle, trailer] = await Promise.all([
      prisma.driver.findFirst({
        where: { id: validatedData.driverId, organizationId: existingLoad.organizationId },
        select: { id: true, status: true, licenseNumber: true },
      }),
      prisma.vehicle.findFirst({
        where: { id: validatedData.vehicleId, organizationId: existingLoad.organizationId },
        select: { id: true, status: true, make: true, model: true, year: true, vin: true, licensePlate: true },
      }),
      validatedData.trailerId ? prisma.vehicle.findFirst({ // Use vehicle if trailer is not a separate model
        where: { 
          id: validatedData.trailerId, 
          organizationId: existingLoad.organizationId,
          type: "trailer" // Assuming you differentiate by type
        },
        select: { id: true, status: true, make: true, model: true, year: true, vin: true, licensePlate: true },
      }) : null,
    ]);

    if (!driver) {
      return {
        success: false,
        error: "Driver not found or not available",
      };
    }

    if (!vehicle) {
      return {
        success: false,
        error: "Vehicle not found or not available",
      };
    }

    if (validatedData.trailerId && !trailer) {
      return {
        success: false,
        error: "Trailer not found or not available",
      };
    }

    // Check if driver and vehicle are available
    if (driver.status !== DriverStatus.available) {
      return {
        success: false,
        error: "Driver is not available for assignment",
      };
    }

    if (vehicle.status !== VehicleStatus.active) {
      return {
        success: false,
        error: "Vehicle is not available for assignment",
      };
    }

    if (trailer && trailer.status !== VehicleStatus.active) {
      return {
        success: false,
        error: "Trailer is not available for assignment",
      };
    }

    const assignedAt = new Date();

    // Update load with assignment details - use transaction for data consistency
    const updatedLoad = await prisma.$transaction(async (tx) => {
      // Update load
      const load = await tx.load.update({
        where: { id: validatedData.loadId },
        data: {
          status: "assigned",
          driverId: validatedData.driverId,
          vehicleId: validatedData.vehicleId,
          trailerId: validatedData.trailerId,
          updatedAt: new Date(),
        },
      });

      // Update driver status
      await tx.driver.update({
        where: { id: validatedData.driverId },
        data: {
          status: "active" as any, // Use type assertion for enum
        },
      });

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: validatedData.vehicleId },
        data: {
          status: "active" as any, // Use type assertion for enum
        },
      });

      // If trailers are stored as vehicles with type=trailer
      if (validatedData.trailerId) {
        await tx.vehicle.update({
          where: { id: validatedData.trailerId },
          data: {
            status: "active" as any, // Use type assertion for enum
          },
        });
      }

      // Use raw SQL if loadStatusEvent isn't in the Prisma schema
      await tx.$executeRaw`
        INSERT INTO "LoadStatusEvent" ("loadId", "status", "timestamp", "notes", "automaticUpdate", "source", "createdBy")
        VALUES (${validatedData.loadId}, 'assigned', ${assignedAt}, ${validatedData.notes || `Assigned to driver with vehicle `}, false, 'dispatcher', ${user.id})
      `;

      return load;
    });

    // Create audit log
    await createAuditLog(
      "ASSIGN",
      "Load",
      validatedData.loadId,
      validatedData,
      user.id,
      existingLoad.organizationId
    );

    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.organizationId}/drivers`);
    revalidatePath(`/dashboard/${existingLoad.organizationId}/vehicles`);
    
    return {
      success: true,
      data: updatedLoad,
    };
  } catch (error) {
    console.error("Error assigning load:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign load",
    };
  }
}

// Update load status action
export async function updateLoadStatusAction(data: LoadStatusUpdateInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const validatedData = loadStatusUpdateSchema.parse(data);

    // Get load to verify tenant and permissions
    const existingLoad = await prisma.load.findUnique({
      where: { id: validatedData.loadId },
      select: { organizationId: true, status: true, driverId: true, vehicleId: true, trailerId: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.organizationId, ["loads:update", "dispatch:manage"]);

    const timestamp = new Date();

    // Update load status and related data
    const updatedLoad = await prisma.$transaction(async (tx) => {
      // Update load
      const updateData: any = {
        status: validatedData.status,
        updatedAt: timestamp,
      };

      // Set actual times based on status
      // Only 'delivered' is valid for actualDeliveryTime now
      if (validatedData.status === "delivered") {
        updateData.actualDeliveryTime = timestamp;
      }

      const load = await tx.load.update({
        where: { id: validatedData.loadId },
        data: updateData,
      });

      // Record status event using raw SQL if model doesn't exist
      await tx.$executeRaw`
        INSERT INTO "LoadStatusEvent" ("loadId", "status", "timestamp", "location", "notes", "automaticUpdate", "source", "createdBy")
        VALUES (
          ${validatedData.loadId},
          ${validatedData.status},
          ${timestamp},
          ${validatedData.location || null},
          ${validatedData.notes || null},
          ${validatedData.automaticUpdate || false},
          ${validatedData.source || 'dispatcher'},
          ${user.id}
        )
      `;

      // Update driver status based on load status
      if (existingLoad.driverId) {
        let driverStatus: DriverStatus = DriverStatus.available;
        if (["in_transit"].includes(validatedData.status)) {
          driverStatus = DriverStatus.available;
        } else if (["delivered", "cancelled"].includes(validatedData.status)) {
          driverStatus = DriverStatus.inactive;
        }

        await tx.driver.update({
          where: { id: existingLoad.driverId },
          data: {
            status: driverStatus as any,
          },
        });
      }

      // Update vehicle status
      if (existingLoad.vehicleId) {
        let vehicleStatus: VehicleStatus = VehicleStatus.active;
        if (["delivered", "cancelled"].includes(validatedData.status)) {
          vehicleStatus = VehicleStatus.inactive;
        }

        await tx.vehicle.update({
          where: { id: existingLoad.vehicleId },
          data: {
            status: vehicleStatus as any,
          },
        });
      }

      // Update trailer status if stored as vehicle with type=trailer
      if (existingLoad.trailerId) {
        let trailerStatus: VehicleStatus = VehicleStatus.active;
        if (["delivered", "cancelled"].includes(validatedData.status)) {
          trailerStatus = VehicleStatus.inactive;
        }

        await tx.vehicle.update({
          where: { id: existingLoad.trailerId },
          data: {
            status: trailerStatus as any,
          },
        });
      }

      return load;
    });

    // Create audit log
    await createAuditLog(
      "STATUS_UPDATE",
      "Load",
      validatedData.loadId,
      validatedData,
      user.id,
      existingLoad.organizationId
    );

    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.organizationId}/dispatch/${validatedData.loadId}`);
    
    return {
      success: true,
      data: updatedLoad,
    };
  } catch (error) {
    console.error("Error updating load status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update load status",
    };
  }
}

// Bulk operations action
export async function bulkLoadOperationAction(orgId: string, data: BulkLoadOperationInput) {
  try {
    const user = await checkUserPermissions(orgId, ["loads:bulk_edit", "dispatch:manage"]);
    
    const validatedData = bulkLoadOperationSchema.parse(data);

    // Verify all loads belong to the tenant
    const loads = await prisma.load.findMany({
      where: {
        id: { in: validatedData.loadIds },
        organizationId: orgId,
      },
      select: { id: true, status: true, referenceNumber: true },
    });

    if (loads.length !== validatedData.loadIds.length) {
      return {
        success: false,
        error: "Some loads not found or not accessible",
      };
    }

    let results: any[] = [];

    switch (validatedData.operation) {
      case "delete":
        // Only allow deletion of pending or cancelled loads
        const deletableLoads = loads.filter(load => 
          ["pending", "cancelled"].includes(load.status)
        );
        
        if (deletableLoads.length === 0) {
          return {
            success: false,
            error: "No loads can be deleted in their current status",
          };
        }

        // Delete loads directly
        await prisma.load.deleteMany({ 
          where: { id: { in: deletableLoads.map(l => l.id) } }
        });

        results = deletableLoads.map(load => ({ id: load.id, success: true }));
        break;

      case "update_status":
        if (!validatedData.data?.status) {
          return {
            success: false,
            error: "Status is required for status update operation",
          };
        }

        const statusUpdates = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const result = await updateLoadStatusAction({
                loadId,
                status: validatedData.data!.status,
                notes: validatedData.data?.notes,
                automaticUpdate: false,
                source: "dispatcher",
              });
              return { id: loadId, success: result.success, error: result.error };
            } catch (error) {
              return { id: loadId, success: false, error: "Failed to update status" };
            }
          })
        );

        results = statusUpdates;
        break;

      // Handle other cases that don't involve tags
      default:
        return {
          success: false,
          error: "Unsupported bulk operation",
        };
    }

    // Create audit log
    await createAuditLog(
      `BULK_${validatedData.operation.toUpperCase()}`,
      "Load",
      validatedData.loadIds.join(","),
      validatedData,
      user.id,
      orgId
    );

    revalidatePath(`/dashboard/${orgId}/dispatch`);
    
    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Error performing bulk operation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to perform bulk operation",
    };
  }
}
