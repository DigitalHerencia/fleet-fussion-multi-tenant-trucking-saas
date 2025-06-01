"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import  prisma  from "@/lib/database/db";
import { VehicleFormSchema, VehicleUpdateStatusSchema, VehicleMaintenanceSchema } from "@/schemas/vehicles";
import type { VehicleFormData, VehicleUpdateStatusData, VehicleMaintenanceData } from "@/schemas/vehicles";
import { hasPermission } from "@/lib/auth/permissions";

export async function createVehicleAction(organizationId: string, data: VehicleFormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
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

  



    revalidatePath(`/dashboard/${organizationId}/vehicles`);
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






    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles`);
    revalidatePath(`/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`);
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



    
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

  

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


  




  } catch (error) {
    console.error("Assign vehicle to driver error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to assign vehicle to driver" 
    };
  }
}


    
