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
  type CreateLoadInput,
  type UpdateLoadInput,
  type LoadAssignmentInput,
  type LoadStatusUpdateInput,
  type BulkLoadOperationInput,
} from "@/validations/dispatch";
import type { Load, LoadStatus, LoadStatusEvent, TrackingUpdate, LoadAlert } from "@/types/dispatch";

// Helper function to check user permissions
async function checkUserPermissions(orgId: string, requiredPermissions: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user belongs to the organization and has required permissions
  const user = await prisma.user.findFirst({
    where: {
      clerkUserId: userId,
      tenantId: orgId,
    },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found or not member of organization");
  }

  const userPermissions = user.role?.permissions.map(p => p.name) || [];
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
  tenantId: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      changes,
      userId,
      tenantId,
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

// Create load action
export async function createLoadAction(orgId: string, data: CreateLoadInput) {
  try {
    const user = await checkUserPermissions(orgId, ["loads:create", "dispatch:manage"]);
    
    const validatedData = createLoadSchema.parse(data);
    
    // Generate reference number if not provided
    if (!validatedData.referenceNumber) {
      validatedData.referenceNumber = generateReferenceNumber();
    }

    // Check if reference number is unique within tenant
    const existingLoad = await prisma.load.findFirst({
      where: {
        tenantId: orgId,
        referenceNumber: validatedData.referenceNumber,
      },
    });

    if (existingLoad) {
      return {
        success: false,
        error: "Reference number already exists",
      };
    }

    // Create the load
    const load = await prisma.load.create({
      data: {
        tenantId: orgId,
        referenceNumber: validatedData.referenceNumber,
        status: "draft",
        priority: validatedData.priority || "medium",
        customer: validatedData.customer,
        origin: validatedData.origin,
        destination: validatedData.destination,
        pickupDate: new Date(validatedData.pickupDate),
        deliveryDate: new Date(validatedData.deliveryDate),
        estimatedPickupTime: validatedData.estimatedPickupTime,
        estimatedDeliveryTime: validatedData.estimatedDeliveryTime,
        equipment: validatedData.equipment,
        cargo: validatedData.cargo,
        rate: validatedData.rate,
        miles: validatedData.miles,
        estimatedMiles: validatedData.estimatedMiles,
        notes: validatedData.notes,
        internalNotes: validatedData.internalNotes,
        specialInstructions: validatedData.specialInstructions,
        brokerInfo: validatedData.brokerInfo,
        tags: validatedData.tags || [],
        createdBy: user.id,
        lastModifiedBy: user.id,
      },
    });

    // Create initial status event
    await prisma.loadStatusEvent.create({
      data: {
        loadId: load.id,
        status: "draft",
        timestamp: new Date(),
        notes: "Load created",
        automaticUpdate: false,
        source: "dispatcher",
        createdBy: user.id,
      },
    });

    // Create audit log
    await createAuditLog(
      "CREATE",
      "Load",
      load.id,
      validatedData,
      user.id,
      orgId
    );

    revalidatePath(`/dashboard/${orgId}/dispatch`);
    
    return {
      success: true,
      data: load,
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
      select: { tenantId: true, status: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.tenantId, ["loads:update", "dispatch:manage"]);
    
    const validatedData = updateLoadSchema.parse(data);

    // Remove id from validated data as it shouldn't be updated
    const { id, ...updateData } = validatedData;

    // Update the load
    const updatedLoad = await prisma.load.update({
      where: { id: loadId },
      data: {
        ...updateData,
        lastModifiedBy: user.id,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await createAuditLog(
      "UPDATE",
      "Load",
      loadId,
      updateData,
      user.id,
      existingLoad.tenantId
    );

    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch/${loadId}`);
    
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
      select: { tenantId: true, status: true, referenceNumber: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.tenantId, ["loads:delete", "dispatch:manage"]);

    // Check if load can be deleted (only draft, pending, or cancelled loads)
    if (!["draft", "pending", "cancelled"].includes(existingLoad.status)) {
      return {
        success: false,
        error: "Cannot delete load in current status",
      };
    }

    // Delete related records first (cascade delete should handle this, but being explicit)
    await prisma.$transaction([
      prisma.loadStatusEvent.deleteMany({ where: { loadId } }),
      prisma.trackingUpdate.deleteMany({ where: { loadId } }),
      prisma.loadAlert.deleteMany({ where: { loadId } }),
      prisma.loadDocument.deleteMany({ where: { loadId } }),
      prisma.load.delete({ where: { id: loadId } }),
    ]);

    // Create audit log
    await createAuditLog(
      "DELETE",
      "Load",
      loadId,
      { referenceNumber: existingLoad.referenceNumber },
      user.id,
      existingLoad.tenantId
    );

    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch`);
    
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
      select: { tenantId: true, status: true, driverId: true, vehicleId: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.tenantId, ["loads:assign", "dispatch:manage"]);

    // Verify driver and vehicle belong to the same tenant
    const [driver, vehicle, trailer] = await Promise.all([
      prisma.driver.findFirst({
        where: { id: validatedData.driverId, tenantId: existingLoad.tenantId },
        select: { id: true, status: true, name: true, phone: true, email: true, licenseNumber: true, cdlClass: true },
      }),
      prisma.vehicle.findFirst({
        where: { id: validatedData.vehicleId, tenantId: existingLoad.tenantId },
        select: { id: true, status: true, unit: true, make: true, model: true, year: true, vin: true, licensePlate: true },
      }),
      validatedData.trailerId ? prisma.trailer.findFirst({
        where: { id: validatedData.trailerId, tenantId: existingLoad.tenantId },
        select: { id: true, status: true, unit: true, type: true, make: true, model: true, year: true, vin: true, licensePlate: true },
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
    if (driver.status !== "available") {
      return {
        success: false,
        error: "Driver is not available for assignment",
      };
    }

    if (vehicle.status !== "available") {
      return {
        success: false,
        error: "Vehicle is not available for assignment",
      };
    }

    if (trailer && trailer.status !== "available") {
      return {
        success: false,
        error: "Trailer is not available for assignment",
      };
    }

    const assignedAt = new Date();

    // Update load with assignment details
    const updatedLoad = await prisma.$transaction(async (tx) => {
      // Update load
      const load = await tx.load.update({
        where: { id: validatedData.loadId },
        data: {
          status: "assigned",
          driverId: validatedData.driverId,
          vehicleId: validatedData.vehicleId,
          trailerId: validatedData.trailerId,
          driver: {
            id: driver.id,
            userId: driver.id, // Assuming driver.id is the user ID
            name: driver.name,
            phone: driver.phone,
            email: driver.email,
            licenseNumber: driver.licenseNumber,
            cdlClass: driver.cdlClass,
            assignedAt,
            assignedBy: user.id,
          },
          vehicle: {
            id: vehicle.id,
            unit: vehicle.unit,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            licensePlate: vehicle.licensePlate,
            assignedAt,
            assignedBy: user.id,
          },
          trailer: trailer ? {
            id: trailer.id,
            unit: trailer.unit,
            type: trailer.type,
            make: trailer.make,
            model: trailer.model,
            year: trailer.year,
            vin: trailer.vin,
            licensePlate: trailer.licensePlate,
            assignedAt,
            assignedBy: user.id,
          } : null,
          lastModifiedBy: user.id,
          updatedAt: new Date(),
        },
      });

      // Update driver status
      await tx.driver.update({
        where: { id: validatedData.driverId },
        data: {
          status: "assigned",
          currentLoadId: validatedData.loadId,
        },
      });

      // Update vehicle status
      await tx.vehicle.update({
        where: { id: validatedData.vehicleId },
        data: {
          status: "assigned",
          currentLoadId: validatedData.loadId,
        },
      });

      // Update trailer status if assigned
      if (validatedData.trailerId) {
        await tx.trailer.update({
          where: { id: validatedData.trailerId },
          data: {
            status: "assigned",
            currentLoadId: validatedData.loadId,
          },
        });
      }

      // Create status event
      await tx.loadStatusEvent.create({
        data: {
          loadId: validatedData.loadId,
          status: "assigned",
          timestamp: assignedAt,
          notes: validatedData.notes || `Assigned to driver ${driver.name} with vehicle ${vehicle.unit}`,
          automaticUpdate: false,
          source: "dispatcher",
          createdBy: user.id,
        },
      });

      return load;
    });

    // Create audit log
    await createAuditLog(
      "ASSIGN",
      "Load",
      validatedData.loadId,
      validatedData,
      user.id,
      existingLoad.tenantId
    );

    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.tenantId}/drivers`);
    revalidatePath(`/dashboard/${existingLoad.tenantId}/vehicles`);
    
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
      select: { tenantId: true, status: true, driverId: true, vehicleId: true, trailerId: true },
    });

    if (!existingLoad) {
      return {
        success: false,
        error: "Load not found",
      };
    }

    const user = await checkUserPermissions(existingLoad.tenantId, ["loads:update", "dispatch:manage"]);

    const timestamp = new Date();

    // Update load status and related data
    const updatedLoad = await prisma.$transaction(async (tx) => {
      // Update load
      const updateData: any = {
        status: validatedData.status,
        lastModifiedBy: user.id,
        updatedAt: timestamp,
      };

      // Set actual times based on status
      if (validatedData.status === "picked_up") {
        updateData.actualPickupTime = timestamp;
      } else if (validatedData.status === "delivered") {
        updateData.actualDeliveryTime = timestamp;
      }

      const load = await tx.load.update({
        where: { id: validatedData.loadId },
        data: updateData,
      });

      // Create status event
      await tx.loadStatusEvent.create({
        data: {
          loadId: validatedData.loadId,
          status: validatedData.status,
          timestamp,
          location: validatedData.location,
          notes: validatedData.notes,
          automaticUpdate: validatedData.automaticUpdate,
          source: validatedData.source,
          createdBy: user.id,
        },
      });

      // Update driver status based on load status
      if (existingLoad.driverId) {
        let driverStatus = "assigned";
        if (["in_transit", "at_pickup", "picked_up", "en_route", "at_delivery"].includes(validatedData.status)) {
          driverStatus = "driving";
        } else if (["delivered", "completed", "cancelled"].includes(validatedData.status)) {
          driverStatus = "available";
        }

        await tx.driver.update({
          where: { id: existingLoad.driverId },
          data: {
            status: driverStatus,
            currentLoadId: ["delivered", "completed", "cancelled"].includes(validatedData.status) ? null : existingLoad.driverId,
            lastLocationUpdate: validatedData.location ? timestamp : undefined,
            currentLocation: validatedData.location || undefined,
          },
        });
      }

      // Update vehicle status
      if (existingLoad.vehicleId) {
        let vehicleStatus = "assigned";
        if (["delivered", "completed", "cancelled"].includes(validatedData.status)) {
          vehicleStatus = "available";
        }

        await tx.vehicle.update({
          where: { id: existingLoad.vehicleId },
          data: {
            status: vehicleStatus,
            currentLoadId: ["delivered", "completed", "cancelled"].includes(validatedData.status) ? null : existingLoad.vehicleId,
          },
        });
      }

      // Update trailer status
      if (existingLoad.trailerId) {
        let trailerStatus = "assigned";
        if (["delivered", "completed", "cancelled"].includes(validatedData.status)) {
          trailerStatus = "available";
        }

        await tx.trailer.update({
          where: { id: existingLoad.trailerId },
          data: {
            status: trailerStatus,
            currentLoadId: ["delivered", "completed", "cancelled"].includes(validatedData.status) ? null : existingLoad.trailerId,
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
      existingLoad.tenantId
    );

    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch`);
    revalidatePath(`/dashboard/${existingLoad.tenantId}/dispatch/${validatedData.loadId}`);
    
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
        tenantId: orgId,
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
        // Only allow deletion of draft, pending, or cancelled loads
        const deletableLoads = loads.filter(load => 
          ["draft", "pending", "cancelled"].includes(load.status)
        );
        
        if (deletableLoads.length === 0) {
          return {
            success: false,
            error: "No loads can be deleted in their current status",
          };
        }

        await prisma.$transaction([
          prisma.loadStatusEvent.deleteMany({ 
            where: { loadId: { in: deletableLoads.map(l => l.id) } }
          }),
          prisma.trackingUpdate.deleteMany({ 
            where: { loadId: { in: deletableLoads.map(l => l.id) } }
          }),
          prisma.loadAlert.deleteMany({ 
            where: { loadId: { in: deletableLoads.map(l => l.id) } }
          }),
          prisma.loadDocument.deleteMany({ 
            where: { loadId: { in: deletableLoads.map(l => l.id) } }
          }),
          prisma.load.deleteMany({ 
            where: { id: { in: deletableLoads.map(l => l.id) } }
          }),
        ]);

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

      case "add_tags":
        if (!validatedData.data?.tags || !Array.isArray(validatedData.data.tags)) {
          return {
            success: false,
            error: "Tags array is required for add tags operation",
          };
        }

        await prisma.load.updateMany({
          where: { id: { in: validatedData.loadIds } },
          data: {
            tags: { push: validatedData.data.tags },
            lastModifiedBy: user.id,
            updatedAt: new Date(),
          },
        });

        results = validatedData.loadIds.map(id => ({ id, success: true }));
        break;

      case "remove_tags":
        if (!validatedData.data?.tags || !Array.isArray(validatedData.data.tags)) {
          return {
            success: false,
            error: "Tags array is required for remove tags operation",
          };
        }

        // This would require more complex logic to remove specific tags
        // For now, we'll update each load individually
        const tagRemovalUpdates = await Promise.all(
          validatedData.loadIds.map(async (loadId) => {
            try {
              const load = await prisma.load.findUnique({
                where: { id: loadId },
                select: { tags: true },
              });

              if (load) {
                const updatedTags = (load.tags as string[]).filter(
                  tag => !validatedData.data!.tags.includes(tag)
                );

                await prisma.load.update({
                  where: { id: loadId },
                  data: {
                    tags: updatedTags,
                    lastModifiedBy: user.id,
                    updatedAt: new Date(),
                  },
                });
              }

              return { id: loadId, success: true };
            } catch (error) {
              return { id: loadId, success: false, error: "Failed to remove tags" };
            }
          })
        );

        results = tagRemovalUpdates;
        break;

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
