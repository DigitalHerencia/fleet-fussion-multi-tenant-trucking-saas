import { db } from "@/db/db";
import { notifications } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";
import type { ApiResult } from "@/types/api";

export const notificationInputSchema = z.object({
  userId: z.string().min(1),
  companyId: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.any().optional(),
  channel: z.enum(["in-app", "email", "push", "sms"]).default("in-app"),
});

export type NotificationInput = z.infer<typeof notificationInputSchema>;

export async function createNotification(
  input: NotificationInput,
): Promise<ApiResult<unknown>> {
  const parsed = notificationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid notification input",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const [notification] = await db
      .insert(notifications)
      .values(parsed.data)
      .returning();
    return { success: true, data: notification };
  } catch (error) {
    console.error("[NotificationActions] createNotification error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create notification",
      errors: { form: ["Failed to create notification"] },
    };
  }
}

export async function getUserNotifications(
  userId: string,
  companyId: string,
  limit = 20,
) {
  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.companyId, companyId),
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(
  notificationId: string,
): Promise<ApiResult<undefined>> {
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
    return { success: true, data: undefined };
  } catch (error) {
    console.error("[NotificationActions] markNotificationRead error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
      errors: { form: ["Failed to mark notification as read"] },
    };
  }
}

export async function markAllNotificationsRead(
  userId: string,
  companyId: string,
): Promise<ApiResult<undefined>> {
  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.companyId, companyId),
        ),
      );
    return { success: true, data: undefined };
  } catch (error) {
    console.error(
      "[NotificationActions] markAllNotificationsRead error:",
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark all notifications as read",
      errors: { form: ["Failed to mark all notifications as read"] },
    };
  }
}

export async function getUnreadNotificationCount(
  userId: string,
  companyId: string,
) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.companyId, companyId),
        eq(notifications.read, false),
      ),
    );
  return result[0]?.count || 0;
}
