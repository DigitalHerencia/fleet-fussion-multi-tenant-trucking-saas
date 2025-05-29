"use server"

import { clerkClient } from '@clerk/nextjs/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { SystemRoles, type SystemRole } from '@/types/abac';
import { hasResourcePermission } from '@/lib/auth/permissions';

export interface InvitationData {
  emailAddress: string;
  role: SystemRole;
  organizationId: string;
  redirectUrl?: string;
  bypassOnboarding?: boolean;
}

export interface InvitationResult {
  success: boolean;
  invitationId?: string;
  error?: string;
}

/**
 * Create an organization invitation with role-based metadata
 * Admins can invite users and assign roles that bypass the onboarding flow
 */
export async function createOrganizationInvitation(data: InvitationData): Promise<InvitationResult> {
  try {
    // Verify the current user has permission to invite users
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    // Check if user has permission to manage other users
    if (!hasResourcePermission(currentUser, 'manage', 'user')) {
      return { success: false, error: 'Insufficient permissions to invite users' };
    }

    // Verify the user belongs to the organization they're inviting to
    if (currentUser.organizationId !== data.organizationId) {
      return { success: false, error: 'Cannot invite users to a different organization' };
    }

    // Validate role
    if (!Object.values(SystemRoles).includes(data.role)) {
      return { success: false, error: 'Invalid role specified' };
    }

    const client = await clerkClient();

    // Create invitation with metadata for role-based onboarding bypass
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: data.organizationId,
      emailAddress: data.emailAddress,
      role: data.role,
      redirectUrl: data.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation`,
      publicMetadata: {
        // Role metadata for the invited user
        role: data.role,
        bypassOnboarding: data.bypassOnboarding ?? true,
        invitedBy: currentUser.userId,
        invitedAt: new Date().toISOString(),
        organizationId: data.organizationId,
      }
    });

    return {
      success: true,
      invitationId: invitation.id,
    };

  } catch (error: any) {
    console.error('Error creating organization invitation:', error);
    return {
      success: false,
      error: error.message || 'Failed to create invitation'
    };
  }
}

/**
 * Revoke an organization invitation
 */
export async function revokeOrganizationInvitation(
  organizationId: string, 
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the current user has permission
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    if (!hasResourcePermission(currentUser, 'manage', 'user')) {
      return { success: false, error: 'Insufficient permissions to revoke invitations' };
    }

    if (currentUser.organizationId !== organizationId) {
      return { success: false, error: 'Cannot revoke invitations for a different organization' };
    }

    const client = await clerkClient();
    
    await client.organizations.revokeOrganizationInvitation({
      organizationId,
      invitationId,
      requestingUserId: currentUser.userId,
    });

    return { success: true };

  } catch (error: any) {
    console.error('Error revoking organization invitation:', error);
    return {
      success: false,
      error: error.message || 'Failed to revoke invitation'
    };
  }
}

/**
 * Get pending invitations for an organization
 */
export async function getOrganizationInvitations(organizationId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    if (!hasResourcePermission(currentUser, 'read', 'user')) {
      throw new Error('Insufficient permissions to view invitations');
    }

    if (currentUser.organizationId !== organizationId) {
      throw new Error('Cannot view invitations for a different organization');
    }

    const client = await clerkClient();
    
    // Note: This is a placeholder - Clerk doesn't have a direct API to list invitations
    // In practice, you might need to track invitations separately or use webhooks
    // For now, return empty array
    return [];

  } catch (error: any) {
    console.error('Error fetching organization invitations:', error);
    throw error;
  }
}
