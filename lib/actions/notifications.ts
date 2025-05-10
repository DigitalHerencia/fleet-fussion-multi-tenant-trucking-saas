import { db } from "@/db"
import { notifications } from "@/db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import { z } from "zod"

export const notificationInputSchema = z.object({
    userId: z.string().min(1),
    companyId: z.string().uuid(),
    type: z.string().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.any().optional(),
    channel: z.enum(["in-app", "email", "push", "sms"]).default("in-app")
})

export type NotificationInput = z.infer<typeof notificationInputSchema>

export async function createNotification(input: NotificationInput) {
    const parsed = notificationInputSchema.safeParse(input)
    if (!parsed.success) {
        throw new Error("Invalid notification input")
    }
    const [notification] = await db
        .insert(notifications)
        .values(
            parsed.data // Corrected: use the full parsed.data object
        )
        .returning()
    return notification
}

export async function getUserNotifications(userId: string, companyId: string, limit = 20) {
    return db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.companyId, companyId)))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
}

export async function markNotificationRead(notificationId: string) {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId))
}

export async function markAllNotificationsRead(userId: string, companyId: string) {
    await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.companyId, companyId)))
}

export async function getUnreadNotificationCount(userId: string, companyId: string) {
    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.companyId, companyId),
                eq(notifications.read, false)
            )
        )
    return result[0]?.count || 0
}
