'use server';

import { auth } from '@clerk/nextjs/server';
import db from '@/lib/database/db';
import type { Notification } from '@/types/notifications';

/**
 * List unread notifications for the current user within an organization.
 */
export async function listUnreadNotifications(orgId: string): Promise<Notification[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const notifications = await db.notification.findMany({
    where: {
      organizationId: orgId,
      OR: [
        { userId },
        { userId: null } // Global notifications
      ],
      readAt: null,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Convert Date fields to string for Notification type compatibility
  return notifications.map(n => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
    readAt: n.readAt ? n.readAt.toISOString() : null,
  }));
}

/**
 * Mark a notification as read by id.
 */
export async function markNotificationRead(id: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
}
