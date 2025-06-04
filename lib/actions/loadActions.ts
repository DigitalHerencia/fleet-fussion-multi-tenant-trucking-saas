
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/database/db';
import { revalidatePath } from 'next/cache';
import {
  updateLoadSchema,
  loadAssignmentSchema,
  type UpdateLoadInput,
  type LoadAssignmentInput,
} from '@/schemas/dispatch';



export async function updateLoadAction(id: string, data: UpdateLoadInput) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updateLoadSchema.parse({ ...data, id });

    const { rate, customer, origin, destination, driver, vehicle, trailer, ...rest } = validated;

    const updateData: any = {
      ...rest,
      updatedAt: new Date(),
    };

    if (typeof rate !== 'undefined') updateData.rate = rate;

    if (customer && typeof customer === 'object') {
      updateData.customerName = customer.name ?? null;
      updateData.customerContact = customer.contactName ?? null;
      updateData.customerPhone = customer.phone ?? null;
      updateData.customerEmail = customer.email ?? null;
    }

    if (origin && typeof origin === 'object') {
      updateData.originAddress = origin.address ?? null;
      updateData.originCity = origin.city ?? null;
      updateData.originState = origin.state ?? null;
      updateData.originZip = origin.zip ?? null;
      updateData.originLat = origin.latitude ?? null;
      updateData.originLng = origin.longitude ?? null;
    }

    if (destination && typeof destination === 'object') {
      updateData.destinationAddress = destination.address ?? null;
      updateData.destinationCity = destination.city ?? null;
      updateData.destinationState = destination.state ?? null;
      updateData.destinationZip = destination.zip ?? null;
      updateData.destinationLat = destination.latitude ?? null;
      updateData.destinationLng = destination.longitude ?? null;
    }

    if (driver && typeof driver === 'object' && driver.id) updateData.driverId = driver.id;
    if (vehicle && typeof vehicle === 'object' && vehicle.id) updateData.vehicleId = vehicle.id;
    if (trailer && typeof trailer === 'object' && trailer.id) updateData.trailerId = trailer.id;

    const load = await db.load.update({
      where: {
        id,
        organizationId: orgId,
      },
      data: updateData,
    });

    revalidatePath('/[orgId]/dispatch', 'page');
    revalidatePath(`/[orgId]/dispatch/${id}`, 'page');
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

export async function assignLoadAction(data: LoadAssignmentInput) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = loadAssignmentSchema.parse(data);

    const load = await db.load.update({
      where: {
        id: validated.loadId,
        organizationId: orgId,
      },
      data: {
        driverId: validated.driverId,
        vehicleId: validated.vehicleId,
        trailerId: validated.trailerId ?? null,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/[orgId]/dispatch', 'page');
    return { success: true, data: load };
  } catch (error) {
    console.error('Error assigning load:', error);
    return { success: false, error: 'Failed to assign load' };
  }
}
