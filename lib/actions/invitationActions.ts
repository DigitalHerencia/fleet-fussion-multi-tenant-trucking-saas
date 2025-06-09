'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { handleError } from '@/lib/errors/handleError';

export interface InvitationData {
  emailAddress: string;
  role: string;
  redirectUrl?: string;
}

export async function createOrganizationInvitation(data: InvitationData) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    revalidatePath('/[orgId]/settings', 'page');
  } catch (error) {
    return handleError(error, 'Create Organization Invitation');
  }
}

export async function getOrganizationInvitations(organizationId?: string) {
  try {
    const { userId, orgId } = await auth();
    const targetOrgId = organizationId || orgId;

    if (!userId || !targetOrgId) {
      return { success: false, error: 'Unauthorized' };
    }
  } catch (error) {
    return handleError(error, 'Get Organization Invitations');
  }
}
