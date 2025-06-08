// --- IMPORTANT ENUM SYNC ---
// When updating VehicleStatus or VehicleType:
// - Update enums in: types/vehicles.ts, schemas/vehicles.ts, prisma/schema.prisma
// - Keep all mappings in this file in sync with those enums.
// ---------------------------
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { VehicleStatus as PrismaVehicleStatus } from '@prisma/client';

import { db } from '@/lib/database/db';
import { hasPermission } from '@/lib/auth/permissions';
import {
  VehicleFormSchema,
  VehicleUpdateStatusSchema,
  VehicleMaintenanceSchema,
} from '@/schemas/vehicles';
import type {
  VehicleFormData,
  VehicleUpdateStatusData,
  VehicleMaintenanceData,
} from '@/schemas/vehicles';
import type {
  Vehicle,
  VehicleActionResult,
  VehicleStatus,
  VehicleType,
} from '@/types/vehicles';

// Helper: Map app VehicleStatus to Prisma enum
function toPrismaVehicleStatus(status: VehicleStatus): PrismaVehicleStatus {
  switch (status) {
    case 'available':
    case 'assigned':
      return PrismaVehicleStatus.active;
    case 'in_maintenance':
      return PrismaVehicleStatus.maintenance;
    case 'out_of_service':
      return PrismaVehicleStatus.inactive;
    case 'retired':
      return PrismaVehicleStatus.decommissioned;
    default:
      return PrismaVehicleStatus.active;
  }
}

// Helper: Map Prisma Vehicle to public Vehicle type
function toPublicVehicle(prismaVehicle: any): Vehicle {
  // Map Prisma status to app VehicleStatus
  let status: VehicleStatus;
  switch (prismaVehicle.status) {
    case 'active':
      status = 'available';
      break;
    case 'maintenance':
      status = 'in_maintenance';
      break;
    case 'inactive':
      status = 'out_of_service';
      break;
    case 'decommissioned':
      status = 'retired';
      break;
    case 'assigned':
      status = 'assigned';
      break;
    default:
      status = 'available';
  }

  // Map Prisma type to VehicleType (ensure fallback)
  const type: VehicleType = [
    'tractor',
    'trailer',
    'straight_truck',
    'other',
  ].includes(prismaVehicle.type)
    ? prismaVehicle.type
    : 'other';

  return {
    id: prismaVehicle.id,
    organizationId: prismaVehicle.organizationId,
    type,
    status,
    make: typeof prismaVehicle.make === 'string' ? prismaVehicle.make : '',
    model: typeof prismaVehicle.model === 'string' ? prismaVehicle.model : '',
    year: typeof prismaVehicle.year === 'number' ? prismaVehicle.year : 0,
    vin: typeof prismaVehicle.vin === 'string' ? prismaVehicle.vin : '',
    licensePlate:
      typeof prismaVehicle.licensePlate === 'string'
        ? prismaVehicle.licensePlate
        : undefined,
    unitNumber:
      typeof prismaVehicle.unitNumber === 'string'
        ? prismaVehicle.unitNumber
        : undefined,
    grossVehicleWeight:
      typeof prismaVehicle.grossVehicleWeight === 'number'
        ? prismaVehicle.grossVehicleWeight
        : undefined,
    maxPayload:
      typeof prismaVehicle.maxPayload === 'number'
        ? prismaVehicle.maxPayload
        : undefined,
    fuelType:
      typeof prismaVehicle.fuelType === 'string'
        ? prismaVehicle.fuelType
        : undefined,
    engineType:
      typeof prismaVehicle.engineType === 'string'
        ? prismaVehicle.engineType
        : undefined,
    registrationNumber:
      typeof prismaVehicle.registrationNumber === 'string'
        ? prismaVehicle.registrationNumber
        : undefined,
    registrationExpiry:
      prismaVehicle.registrationExpiration instanceof Date
        ? prismaVehicle.registrationExpiration
        : undefined,
    insuranceProvider:
      typeof prismaVehicle.insuranceProvider === 'string'
        ? prismaVehicle.insuranceProvider
        : undefined,
    insurancePolicyNumber:
      typeof prismaVehicle.insurancePolicyNumber === 'string'
        ? prismaVehicle.insurancePolicyNumber
        : undefined,
    insuranceExpiry:
      prismaVehicle.insuranceExpiration instanceof Date
        ? prismaVehicle.insuranceExpiration
        : undefined,
    currentDriverId:
      typeof prismaVehicle.currentDriverId === 'string'
        ? prismaVehicle.currentDriverId
        : undefined,
    currentLoadId:
      typeof prismaVehicle.currentLoadId === 'string'
        ? prismaVehicle.currentLoadId
        : undefined,
    currentLocation:
      typeof prismaVehicle.currentLocation === 'string'
        ? prismaVehicle.currentLocation
        : undefined,
    totalMileage:
      typeof prismaVehicle.currentOdometer === 'number'
        ? prismaVehicle.currentOdometer
        : undefined,
    lastMaintenanceMileage:
      typeof prismaVehicle.lastMaintenanceMileage === 'number'
        ? prismaVehicle.lastMaintenanceMileage
        : undefined,
    nextMaintenanceDate:
      prismaVehicle.nextMaintenanceDate instanceof Date
        ? prismaVehicle.nextMaintenanceDate
        : undefined,
    nextMaintenanceMileage:
      typeof prismaVehicle.nextMaintenanceMileage === 'number'
        ? prismaVehicle.nextMaintenanceMileage
        : undefined,
    createdAt:
      prismaVehicle.createdAt instanceof Date
        ? prismaVehicle.createdAt
        : new Date(),
    updatedAt:
      prismaVehicle.updatedAt instanceof Date
        ? prismaVehicle.updatedAt
        : new Date(),
    // Relations (optional, set to undefined if not present)
    driver: undefined,
    organization: undefined,
  };
}

export async function createVehicleAction(
  organizationId: string,
  data: VehicleFormData
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
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
      return {
        success: false,
        error: 'A vehicle with this VIN already exists',
      };
    }

    // Map status/type to Prisma
    const vehicleData = {
      ...validatedData,
      organizationId,
      status: toPrismaVehicleStatus('available'),
      type: validatedData.type,
      unitNumber: validatedData.unitNumber ?? '', // ensure string
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
    console.error('Create vehicle error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create vehicle',
    };
  }
}

export async function updateVehicleAction(
  vehicleId: string,
  data: VehicleFormData
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get existing vehicle to check permissions
    const existingVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, organizationId: true, vin: true },
    });

    if (!existingVehicle) {
      return { success: false, error: 'Vehicle not found' };
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
        return {
          success: false,
          error: 'A vehicle with this VIN already exists',
        };
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
    revalidatePath(
      `/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`
    );
    return { success: true, data: toPublicVehicle(vehicle) };
  } catch (error) {
    console.error('Update vehicle error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update vehicle',
    };
  }
}

export async function updateVehicleStatusAction(
  vehicleId: string,
  data: VehicleUpdateStatusData
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
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
        vin: true,
      },
    });

    if (!existingVehicle) {
      return { success: false, error: 'Vehicle not found' };
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
    revalidatePath(
      `/dashboard/${existingVehicle.organizationId}/vehicles/${vehicleId}`
    );
    return { success: true, data: toPublicVehicle(updatedVehicle) };
  } catch (error) {
    console.error('Update vehicle status error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update vehicle status',
    };
  }
}

export async function deleteVehicleAction(
  vehicleId: string
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get vehicle to get organizationId for revalidation
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found' };
    }

    await db.vehicle.delete({
      where: { id: vehicleId },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    return { success: true };
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete vehicle',
    };
  }
}

export async function assignVehicleToDriverAction(
  vehicleId: string,
  driverId: string
): Promise<VehicleActionResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Find an active load for this vehicle, or create a new one for assignment
    // (This is a simplified example; real logic may need to check for existing assignments, statuses, etc.)
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      select: { organizationId: true },
    });

    if (!vehicle) {
      return { success: false, error: 'Vehicle not found' };
    }

    // Create a new load assignment (minimal fields)
    const newLoad = await db.load.create({
      data: {
        organizationId: vehicle.organizationId,
        driverId,
        vehicleId,
        loadNumber: `ASSIGN-${Date.now()}`,
        status: 'assigned',
        originAddress: 'Assignment',
        originCity: '',
        originState: '',
        originZip: '',
        destinationAddress: '',
        destinationCity: '',
        destinationState: '',
        destinationZip: '',
      },
    });

    revalidatePath(`/dashboard/${vehicle.organizationId}/vehicles`);
    revalidatePath(
      `/dashboard/${vehicle.organizationId}/vehicles/${vehicleId}`
    );

    // Return the vehicle (not the load)
    const updatedVehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
    });
    return {
      success: true,
      data: updatedVehicle ? toPublicVehicle(updatedVehicle) : undefined,
    };
  } catch (error) {
    console.error('Assign vehicle to driver error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to assign vehicle to driver',
    };
  }
}
