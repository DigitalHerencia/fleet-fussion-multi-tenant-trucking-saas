// NOTE: All ABAC/auth types (UserRole, Permission, ResourceType, etc.)
// are now defined in types/auth.ts or types/abac.ts. Do not define or export them here.
//
// IMPORTANT: If you need UserRole, Permission, ResourceType, etc., import them from '@/types/auth' or '@/types/abac'.

'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/database/db';
import { handleError } from '@/lib/errors/handleError';
import { SystemRoles } from '@/types/abac';
import type { AdminActionResult } from '@/types/actions';
import type { DatabaseUser } from '@/types/auth';
import type { AuditLogEntry, OrganizationStats } from '@/types/admin';

async function verifyAdminAccess(userId: string, orgId: string) {
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true, role: true },
  });
  return (
    user?.organizationId === orgId && user.role === SystemRoles.ADMIN
  );
}

/**
 * Get all users in an organization (Admin only)
 */
type OrgUser =
  Pick<DatabaseUser, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'isActive' | 'createdAt' | 'lastLogin'> &
  { clerkId: string };

export async function getOrganizationUsersAction(
  orgId: string
): Promise<AdminActionResult<OrgUser[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get users from database with their roles
    const users = await prisma.user.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: users };
  } catch (error) {
    return handleError(error, 'Get Organization Users');
  }
}

/**
 * Update user role (Admin only)
 */
export async function updateUserRoleAction(
  orgId: string,
  targetUserId: string,
  newRole: string
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate role
    if (!Object.values(SystemRoles).includes(newRole as any)) {
      return { success: false, error: 'Invalid role' };
    }

    // Update in Clerk
    const client = await clerkClient();
    await client.users.updateUser(targetUserId, {
      publicMetadata: { role: newRole },
    });

    revalidatePath(`/dashboard/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Update User Role');
  }
}

/**
 * Deactivate user (Admin only)
 */
export async function deactivateUserAction(
  orgId: string,
  targetUserId: string
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update in database
    await prisma.user.update({
      where: {
        id: targetUserId,
        organizationId: orgId,
      },
      data: { isActive: false },
    });

    revalidatePath(`/dashboard/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Deactivate User');
  }
}

/**
 * Get system audit logs (Admin only)
 */
export async function getAuditLogsAction(
  orgId: string
): Promise<AdminActionResult<AuditLogEntry[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get audit logs for the organization
    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: auditLogs };
  } catch (error) {
    return handleError(error, 'Get Audit Logs');
  }
}

/**
 * Get organization statistics (Admin only)
 */
export async function getOrganizationStatsAction(
  orgId: string
): Promise<AdminActionResult<OrganizationStats>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get various counts and statistics
    const [userCount, activeUserCount, vehicleCount, driverCount, loadCount] =
      await Promise.all([
        prisma.user.count({ where: { organizationId: orgId } }),
        prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
        prisma.vehicle.count({ where: { organizationId: orgId } }),
        prisma.user.count({
          where: { organizationId: orgId, role: SystemRoles.DRIVER },
        }),
        prisma.load.count({ where: { organizationId: orgId } }),
      ]);

    const stats = {
      userCount,
      activeUserCount,
      vehicleCount,
      driverCount,
      loadCount,
    };

    return { success: true, data: stats };
  } catch (error) {
    return handleError(error, 'Get Organization Stats');
  }
}

/**
 * Bulk invite users (placeholder implementation)
 */
export async function inviteUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Implementation would send invitations via Clerk or email provider
    console.log('Inviting users for org', orgId);
    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Invite Users');
  }
}

export async function activateUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }
    await prisma.user.updateMany({
      where: { organizationId: orgId },
      data: { isActive: true },
    });
    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Activate Users');
  }
}

export async function deactivateUsersAction(
  orgId: string,
  formData: FormData
): Promise<AdminActionResult<void>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }
    const isAdmin = await verifyAdminAccess(userId, orgId);
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }
    await prisma.user.updateMany({
      where: { organizationId: orgId },
      data: { isActive: false },
    });
    revalidatePath(`/${orgId}/admin`);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Deactivate Users');
  }
}
