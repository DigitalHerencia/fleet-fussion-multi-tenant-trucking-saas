'use server';

import { auth } from '@clerk/nextjs/server';

import prisma from '@/lib/database/db';
import { type UserRole } from '@/types/auth';

export type UserWithRole = {
  id: string;
  name: string;
  role: UserRole;
};

/**
 * Retrieve all users for an organization along with their assigned roles.
 */
export async function listOrganizationUsers(
  orgId: string
): Promise<UserWithRole[]> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const requestingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true },
  });

  if (!requestingUser || requestingUser.organizationId !== orgId) {
    throw new Error('Access denied');
  }

  const memberships = await prisma.organizationMembership.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map(m => ({
    id: m.user.id,
    name: `${m.user.firstName ?? ''} ${m.user.lastName ?? ''}`.trim(),
    role: m.role as UserRole,
  }));
}
