
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { CreateLoadInput, UpdateLoadInput } from '@/schemas/dispatch';



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
      data: {
        
        updatedAt: new Date(),
      },
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
