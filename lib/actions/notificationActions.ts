'use server';

import type { Notification, NotificationActionResult } from '@/types/notifications';
import { listUnreadNotifications, markNotificationRead } from '@/lib/fetchers/notificationFetchers';
import { getCurrentUser } from '@/lib/auth/auth';
import { belongsToOrganization } from '@/lib/auth/permissions';
import { handleError } from '@/lib/errors/handleError';

export async function fetchNotifications(
  orgId: string
): Promise<NotificationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || !belongsToOrganization(user, orgId)) {
      throw new Error('Unauthorized');
    }

    const notifications = await listUnreadNotifications(orgId);
    return { success: true, data: notifications };
  } catch (error) {
    return handleError(error, 'Fetch Notifications');
  }
}

export async function readNotification(
  id: string,
  orgId: string
): Promise<NotificationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || !belongsToOrganization(user, orgId)) {
      throw new Error('Unauthorized');
    }

    await markNotificationRead(id);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Read Notification');
  }
}
