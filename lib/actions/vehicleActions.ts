"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { VehicleStatus as PrismaVehicleStatus } from "@prisma/client";

import { db } from "@/lib/database/db";
import { hasPermission } from "@/lib/auth/permissions";
import { VehicleFormSchema, VehicleUpdateStatusSchema, VehicleMaintenanceSchema } from "@/schemas/vehicles";
import type { VehicleFormData, VehicleUpdateStatusData, VehicleMaintenanceData } from "@/schemas/vehicles";
import type { Vehicle, VehicleActionResult, VehicleStatus, VehicleType } from "@/types/vehicles";

// Helper: Map app VehicleStatus to Prisma enum
function toPrismaVehicleStatus(status: VehicleStatus): PrismaVehicleStatus {
  switch (status) {
    case "available":
    case "assigned":
      return PrismaVehicleStatus.active;
    case "in_maintenance":
      return PrismaVehicleStatus.maintenance;
    case "out_of_service":
      return PrismaVehicleStatus.inactive;
    case "retired":
      return PrismaVehicleStatus.decommissioned;
    default:
      return PrismaVehicleStatus.active;
  }
}

// Helper: Map Prisma Vehicle to public Vehicle type
function toPublicVehicle(prismaVehicle: any): Vehicle {
  return {
    id: prismaVehicle.id,
    organizationId: prismaVehicle.organizationId,
    type: prismaVehicle.type as VehicleType,
    status: (() => {
      switch (prismaVehicle.status) {
        case "active": return "available";
        case "maintenance": return "in_maintenance";
        case "inactive": return "out_of_service";
        case "decommissioned": return "retired";
        default: return "available";
      }
    })(),
    make: prismaVehicle.make ?? "",
    model: prismaVehicle.model ?? "",
    year: prismaVehicle.year ?? 0,
    vin: prismaVehicle.vin ?? "",
    licensePlate: prismaVehicle.licensePlate ?? undefined,
    unitNumber: prismaVehicle.unitNumber ?? undefined,
    grossVehicleWeight: undefined,
    maxPayload: undefined,
    fuelType: prismaVehicle.fuelType ?? undefined,
    engineType: undefined,
    registrationNumber: undefined,
    registrationExpiry: prismaVehicle.registrationExpiration ?? undefined,
    insuranceProvider: undefined,
    insurancePolicyNumber: undefined,
    insuranceExpiry: prismaVehicle.insuranceExpiration ?? undefined,
    currentDriverId: prismaVehicle.currentDriverId ?? undefined,
    currentLoadId: undefined,
    currentLocation: undefined,
    totalMileage: undefined,
    lastMaintenanceMileage: undefined,
    nextMaintenanceDate: prismaVehicle.nextMaintenanceDate ?? undefined,
    nextMaintenanceMileage: undefined,
    createdAt: prismaVehicle.createdAt,
    updatedAt: prismaVehicle.updatedAt,
  };
}

export async function createVehicleAction(organizationId: string, data: VehicleFormData): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validatedData = VehicleFormSchema.parse(data);

    // Check if VIN already exists in the organization
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        vin: validatedData.vin,
        organizationId,
      },
    });

    if (existingVehicle) {
      return { success: false, error: "A vehicle with this VIN already exists" };
    }

    // Map status/type to Prisma
    const vehicleData = {
      ...validatedData,
      organizationId,
      status: toPrismaVehicleStatus("available"),
      type: validatedData.type,
      unitNumber: validatedData.unitNumber ?? "", // ensure string
      registrationExpiration: validatedData.registrationExpiry 
        ? new Date(validatedData.registrationExpiry) 
        : null,
      insuranceExpiration: validatedData.insuranceExpiry 
        ? new Date(validatedData.insuranceExpiry) 
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate 
        ? new Date(validatedData.nextMaintenanceDate) 
        : null,
    };
    const vehicle = await db.vehicle.create({ data: vehicleData });

    revalidatePath(`/dashboard/${organizationId}/vehicles`);
    return { success: true, data: toPublicVehicle(vehicle) };
  } catch (error) {
    console.error("Create vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create vehicle" 
    };
  }
}

export async function updateVehicleAction(vehicleId: string, data: VehicleFormData): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, organizationId: true, vin: true },
    });

    if (!existingVehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Validate input
    const validatedData = VehicleFormSchema.parse(data);

    // Check if VIN change conflicts with existing vehicle
    if (validatedData.vin !== existingVehicle.vin) {
      const vinConflict = await db.vehicle.findFirst({
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

    // Map type to Prisma
    const updateData = {
      ...validatedData,
      type: validatedData.type,
      registrationExpiration: validatedData.registrationExpiry 
        ? new Date(validatedData.registrationExpiry) 
        : null,
      insuranceExpiration: validatedData.insuranceExpiry 
        ? new Date(validatedData.insuranceExpiry) 
        : null,
      nextMaintenanceDate: validatedData.nextMaintenanceDate 
        ? new Date(validatedData.nextMaintenanceDate) 
        : null,
    };

    const vehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    });

    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`);
    return { success: true, data: toPublicVehicle(vehicle) };
  } catch (error) {
    console.error("Update vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update vehicle" 
    };
  }
}

export async function updateVehicleStatusAction(vehicleId: string, data: VehicleUpdateStatusData): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await db.vehicle.findUnique({
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

    // Validate input
    const validatedData = VehicleUpdateStatusSchema.parse(data);

    // Update status and notes
    const updatedVehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: toPrismaVehicleStatus(validatedData.status),
        notes: validatedData.notes,
      },
    });

    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`);
    return { success: true, data: toPublicVehicle(updatedVehicle) };
  } catch (error) {
    console.error("Update vehicle status error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update vehicle status" 
    };
  }
}

export async function deleteVehicleAction(vehicleId: string): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get vehicle to get organizationId for revalidation
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    await db.vehicle.delete({
      where: { id: vehicleId },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    return { success: true };
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete vehicle" 
    };
  }
}

export async function assignVehicleToDriverAction(vehicleId: string, driverId: string): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Find an active load for this vehicle, or create a new one for assignment
    // (This is a simplified example; real logic may need to check for existing assignments, statuses, etc.)
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    });

    if (!vehicle) {
      return { success: false, error: "Vehicle not found" };
    }

    // Create a new load assignment (minimal fields)
    const newLoad = await db.load.create({
      data: {
        organizationId: vehicle.organizationId,
        driverId,
        vehicleId,
        loadNumber: `ASSIGN-${Date.now()}`,
        status: "assigned",
        originAddress: "Assignment",
        originCity: "",
        originState: "",
        originZip: "",
        destinationAddress: "",
        destinationCity: "",
        destinationState: "",
        destinationZip: "",
      },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles/${vehicleId}`);

    // Return the vehicle (not the load)
    const updatedVehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    return { success: true, data: updatedVehicle ? toPublicVehicle(updatedVehicle) : undefined };
  } catch (error) {
    console.error("Assign vehicle to driver error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to assign vehicle to driver" 
    };
  }
}



