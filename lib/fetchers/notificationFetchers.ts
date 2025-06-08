'use server';

import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/database/db';
import type { Notification } from '@/types/notifications';

/**
 * List unread notifications for the current user within an organization.
 */
export async function listUnreadNotifications(orgId: string): Promise<Notification[]> {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.notification.findMany({
    where: {
      organizationId: orgId,
      OR: [{ userId }, { userId: null }],
      readAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

/**
 * Mark a notification as read by id.
 */
export async function markNotificationRead(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}
