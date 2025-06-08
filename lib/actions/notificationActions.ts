'use server';

import type { Notification } from '@/types/notifications';
import { listUnreadNotifications, markNotificationRead } from '@/lib/fetchers/notificationFetchers';

export async function fetchNotifications(orgId: string): Promise<Notification[]> {
  return listUnreadNotifications(orgId);
}

export async function readNotification(id: string): Promise<void> {
  await markNotificationRead(id);
}
