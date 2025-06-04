
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database/db';
import { revalidatePath } from 'next/cache';
import type { CreateLoadInput, UpdateLoadInput } from '@/schemas/dispatch';

/**
 * Flatten nested load input into Prisma update fields
 */
function mapUpdateInput(data: UpdateLoadInput) {
  const updateData: any = { updatedAt: new Date() };

  if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber;
  if (data.status !== undefined) updateData.status = data.status as any;
  if (data.priority !== undefined) updateData.priority = data.priority as any;
  if (data.pickupDate !== undefined) updateData.scheduledPickupDate = new Date(data.pickupDate);
  if (data.deliveryDate !== undefined) updateData.scheduledDeliveryDate = new Date(data.deliveryDate);
  if (data.estimatedPickupTime !== undefined) updateData.estimatedPickupTime = data.estimatedPickupTime;
  if (data.estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = data.estimatedDeliveryTime;
  if (data.actualPickupTime !== undefined) updateData.actualPickupTime = data.actualPickupTime;
  if (data.actualDeliveryTime !== undefined) updateData.actualDeliveryTime = data.actualDeliveryTime;

  if (data.customer) {
    updateData.customerName = data.customer.name ?? null;
    updateData.customerContact = data.customer.contactName ?? null;
    updateData.customerPhone = data.customer.phone ?? null;
    updateData.customerEmail = data.customer.email ?? null;
  }

  if (data.origin) {
    updateData.originAddress = data.origin.address ?? null;
    updateData.originCity = data.origin.city ?? null;
    updateData.originState = data.origin.state ?? null;
    updateData.originZip = data.origin.zip ?? null;
    updateData.originLat = data.origin.latitude ?? null;
    updateData.originLng = data.origin.longitude ?? null;
  }

  if (data.destination) {
    updateData.destinationAddress = data.destination.address ?? null;
    updateData.destinationCity = data.destination.city ?? null;
    updateData.destinationState = data.destination.state ?? null;
    updateData.destinationZip = data.destination.zip ?? null;
    updateData.destinationLat = data.destination.latitude ?? null;
    updateData.destinationLng = data.destination.longitude ?? null;
  }

  if (data.driver?.id) updateData.driverId = data.driver.id;
  if (data.vehicle?.id) updateData.vehicleId = data.vehicle.id;
  if (data.trailer?.id) updateData.trailerId = data.trailer.id;

  if (data.miles !== undefined) updateData.estimatedMiles = data.miles;
  if (data.fuelCost !== undefined) updateData.fuelCost = data.fuelCost;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
  if (data.specialInstructions !== undefined) updateData.instructions = data.specialInstructions;

  return updateData;
}



export async function updateLoadAction(id: string, data: UpdateLoadInput) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const load = await db.load.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: mapUpdateInput(data),
    });

    revalidatePath('/[orgId]/dispatch', 'page');
    return { success: true, data: load };
  } catch (error) {
    console.error('Error updating load:', error);
    return { success: false, error: 'Failed to update load' };
  }
}

export async function updateLoadStatus(id: string, status: string) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const load = await db.load.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/[orgId]/dispatch', 'page');
    return { success: true, data: load };
  } catch (error) {
    console.error('Error updating load status:', error);
    return { success: false, error: 'Failed to update load status' };
  }
}

export async function deleteLoadAction(id: string) {
  try {
    const { userId, orgId } = await auth();
    
    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.load.delete({
      where: { 
        id,
        organizationId: orgId,
      },
    });

    revalidatePath('/[orgId]/dispatch', 'page');
    return { success: true };
  } catch (error) {
    console.error('Error deleting load:', error);
    return { success: false, error: 'Failed to delete load' };
  }
}
