
'use server';

import { auth , clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

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
    console.error('Error creating organization invitation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create invitation' 
    };
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
    console.error('Error getting organization invitations:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get invitations' 
    };
  }




  

}
