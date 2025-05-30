"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/database";
import { VehicleFormSchema, VehicleUpdateStatusSchema, VehicleMaintenanceSchema } from "@/validations/vehicles";
import type { VehicleFormData, VehicleUpdateStatusData, VehicleMaintenanceData } from "@/validations/vehicles";
import { hasPermission } from "@/lib/auth/permissions";
import { auditLog } from "@/lib/audit";

export async function createVehicleAction(organizationId: string, data: VehicleFormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(userId, organizationId, "vehicles", "create");
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to create vehicles" };
    }

    // Validate input
    const validatedData = VehicleFormSchema.parse(data);

    // Check if VIN already exists in the organization
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        vin: validatedData.vin,
        organizationId,
      },
    });

    if (existingVehicle) {
      return { success: false, error: "A vehicle with this VIN already exists" };
    }

    // Convert date strings to Date objects
    const vehicleData = {
      ...validatedData,
      organizationId,
      status: "available" as const,
      registrationExpiry: validatedData.registrationExpiry 
        ? new Date(validatedData.registrationExpiry) 
        : null,
      insuranceExpiry: validatedData.insuranceExpiry 
        ? new Date(validatedData.insuranceExpiry) 
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate 
        ? new Date(validatedData.nextMaintenanceDate) 
        : null,
    };

    const vehicle = await prisma.vehicle.create({
      data: vehicleData,
    });

    // Audit log
    await auditLog({
      userId,
      organizationId,
      action: "vehicle.created",
      resourceType: "vehicle",
      resourceId: vehicle.id,
      details: {
        vehicleType: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
      },
    });

    revalidatePath(`/dashboard/${organizationId}/vehicles`);
    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Create vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create vehicle" 
    };
  }
}

export async function updateVehicleAction(vehicleId: string, data: VehicleFormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, organizationId: true, vin: true },
    });

    if (!existingVehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(
      userId, 
      existingVehicle.organizationId, 
      "vehicles", 
      "update"
    );
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to update vehicles" };
    }

    // Validate input
    const validatedData = VehicleFormSchema.parse(data);

    // Check if VIN change conflicts with existing vehicle
    if (validatedData.vin !== existingVehicle.vin) {
      const vinConflict = await prisma.vehicle.findFirst({
        where: {
          vin: validatedData.vin,
          organizationId: existingVehicle.organizationId,
          id: { not: vehicleId },
        },
      });

      if (vinConflict) {
        return { success: false, error: "A vehicle with this VIN already exists" };
      }
    }

    // Convert date strings to Date objects
    const updateData = {
      ...validatedData,
      registrationExpiry: validatedData.registrationExpiry 
        ? new Date(validatedData.registrationExpiry) 
        : null,
      insuranceExpiry: validatedData.insuranceExpiry 
        ? new Date(validatedData.insuranceExpiry) 
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate 
        ? new Date(validatedData.nextMaintenanceDate) 
        : null,
    };

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    // Audit log
    await auditLog({
      userId,
      organizationId: existingVehicle.organizationId,
      action: "vehicle.updated",
      resourceType: "vehicle",
      resourceId: vehicle.id,
      details: {
        changes: validatedData,
      },
    });

    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`);
    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Update vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update vehicle" 
    };
  }
}

export async function updateVehicleStatusAction(vehicleId: string, data: VehicleUpdateStatusData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { 
        id: true, 
        organizationId: true, 
        status: true,
        make: true,
        model: true,
        vin: true 
      },
    });

    if (!existingVehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(
      userId, 
      existingVehicle.organizationId, 
      "vehicles", 
      "update"
    );
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to update vehicle status" };
    }

    // Validate input
    const validatedData = VehicleUpdateStatusSchema.parse(data);

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditLog({
      userId,
      organizationId: existingVehicle.organizationId,
      action: "vehicle.status_updated",
      resourceType: "vehicle",
      resourceId: vehicle.id,
      details: {
        previousStatus: existingVehicle.status,
        newStatus: validatedData.status,
        notes: validatedData.notes,
        vehicle: {
          make: existingVehicle.make,
          model: existingVehicle.model,
          vin: existingVehicle.vin,
        },
      },
    });

    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`);
    return { success: true, data: vehicle };
  } catch (error) {
    console.error("Update vehicle status error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update vehicle status" 
    };
  }
}

export async function deleteVehicleAction(vehicleId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { 
        id: true, 
        organizationId: true,
        make: true,
        model: true,
        vin: true,
        currentDriverId: true,
        currentLoadId: true,
      },
    });

    if (!existingVehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(
      userId, 
      existingVehicle.organizationId, 
      "vehicles", 
      "delete"
    );
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to delete vehicles" };
    }

    // Check if vehicle is currently assigned
    if (existingVehicle.currentDriverId || existingVehicle.currentLoadId) {
      return { 
        success: false, 
        error: "Cannot delete vehicle that is currently assigned to a driver or load" 
      };
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    // Audit log
    await auditLog({
      userId,
      organizationId: existingVehicle.organizationId,
      action: "vehicle.deleted",
      resourceType: "vehicle",
      resourceId: vehicleId,
      details: {
        vehicle: {
          make: existingVehicle.make,
          model: existingVehicle.model,
          vin: existingVehicle.vin,
        },
      },
    });

    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    return { success: true };
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete vehicle" 
    };
  }
}

export async function assignVehicleToDriverAction(vehicleId: string, driverId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get vehicle and driver to check permissions and validate assignment
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { 
          id: true, 
          organizationId: true, 
          status: true,
          currentDriverId: true,
          make: true,
          model: true,
        },
      }),
      prisma.driver.findUnique({
        where: { id: driverId },
        select: { 
          id: true, 
          organizationId: true,
          firstName: true,
          lastName: true,
        },
      }),
    ]);

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    if (!driver) {
      return { success: false, error: "Driver not found" };
    }

    if (vehicle.organizationId !== driver.organizationId) {
      return { success: false, error: "Vehicle and driver must belong to the same organization" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(
      userId, 
      vehicle.organizationId, 
      "vehicles", 
      "update"
    );
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to assign vehicles" };
    }

    if (vehicle.status === "out_of_service" || vehicle.status === "retired") {
      return { 
        success: false, 
        error: "Cannot assign vehicle that is out of service or retired" 
      };
    }

    // Update vehicle assignment
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentDriverId: driverId,
        status: "assigned",
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditLog({
      userId,
      organizationId: vehicle.organizationId,
      action: "vehicle.assigned",
      resourceType: "vehicle",
      resourceId: vehicleId,
      details: {
        driverId,
        driverName: `${driver.firstName} ${driver.lastName}`,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
        },
        previousDriverId: vehicle.currentDriverId,
      },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles/${vehicleId}`);
    revalidatePath(`/dashboard/${vehicle.organizationId}/drivers/${driverId}`);
    
    return { success: true, data: updatedVehicle };
  } catch (error) {
    console.error("Assign vehicle to driver error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to assign vehicle to driver" 
    };
  }
}

export async function unassignVehicleFromDriverAction(vehicleId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get vehicle to check permissions
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { 
        id: true, 
        organizationId: true,
        currentDriverId: true,
        make: true,
        model: true,
      },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Check permissions
    const canManageVehicles = await hasPermission(
      userId, 
      vehicle.organizationId, 
      "vehicles", 
      "update"
    );
    if (!canManageVehicles) {
      return { success: false, error: "Insufficient permissions to unassign vehicles" };
    }

    if (!vehicle.currentDriverId) {
      return { success: false, error: "Vehicle is not currently assigned to a driver" };
    }

    // Update vehicle assignment
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentDriverId: null,
        status: "available",
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditLog({
      userId,
      organizationId: vehicle.organizationId,
      action: "vehicle.unassigned",
      resourceType: "vehicle",
      resourceId: vehicleId,
      details: {
        previousDriverId: vehicle.currentDriverId,
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
        },
      },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles/${vehicleId}`);
    if (vehicle.currentDriverId) {
      revalidatePath(`/dashboard/${vehicle.organizationId}/drivers/${vehicle.currentDriverId}`);
    }
    
    return { success: true, data: updatedVehicle };
  } catch (error) {
    console.error("Unassign vehicle from driver error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to unassign vehicle from driver" 
    };
  }
}
