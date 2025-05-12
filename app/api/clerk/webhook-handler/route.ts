import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { db, getCompanyIdFromClerkOrgId } from "@/db"
import { companies, companyUsers } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// Clerk will POST events to this endpoint. Handle user/org events here.
export async function POST(req: NextRequest) {
    try {
        // Clerk signature validation
        const svixId = req.headers.get("svix-id")
        const svixTimestamp = req.headers.get("svix-timestamp")
        const svixSignature = req.headers.get("svix-signature")
        if (!svixId || !svixTimestamp || !svixSignature) {
            return NextResponse.json({ error: "Missing Clerk webhook headers" }, { status: 400 })
        }
        const body = await req.text()
        let event: any
        try {
            const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")
            event = wh.verify(body, {
                "svix-id": svixId,
                "svix-timestamp": svixTimestamp,
                "svix-signature": svixSignature
            }) as any // Type assertion to avoid 'unknown' errors
        } catch (err) {
            console.error("[ClerkWebhook] Invalid signature", err)
            return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
        }

        switch (event.type) {
            case "user.created": {
                // Optionally: create user in your DB or sync metadata
                break
            }
            case "user.updated": {
                // Optionally: update user info in your DB
                break
            }
            case "user.deleted": {
                // Remove user from all company memberships
                await db.delete(companyUsers).where(eq(companyUsers.userId, event.data.id))
                break
            }
            case "organization.created": {
                // Create company record for new Clerk org
                await db.insert(companies).values({
                    name: event.data.name,
                    clerkOrgId: event.data.id,
                    isActive: true
                })
                break
            }
            case "organization.updated": {
                // Update company info
                await db
                    .update(companies)
                    .set({ name: event.data.name, updatedAt: new Date() })
                    .where(eq(companies.clerkOrgId, event.data.id))
                break
            }
            case "organization.deleted": {
                // Remove company and all memberships
                await db.delete(companies).where(eq(companies.clerkOrgId, event.data.id))
                break
            }
            case "organizationMembership.created": {
                // Add user to companyUsers
                const companyId = await getCompanyIdFromClerkOrgId(event.data.organization.id)
                if (companyId) {
                    await db.insert(companyUsers).values({
                        userId: event.data.publicUserData.userId,
                        companyId,
                        role: event.data.role,
                        isActive: true
                    })
                }
                break
            }
            case "organizationMembership.updated": {
                // Update user role in companyUsers
                const companyId = await getCompanyIdFromClerkOrgId(event.data.organization.id)
                if (companyId) {
                    await db
                        .update(companyUsers)
                        .set({ role: event.data.role, updatedAt: new Date() })
                        .where(
                            and(
                                eq(companyUsers.userId, event.data.publicUserData.userId),
                                eq(companyUsers.companyId, companyId)
                            )
                        )
                }
                break
            }
            case "organizationMembership.deleted": {
                // Remove user from companyUsers
                const companyId = await getCompanyIdFromClerkOrgId(event.data.organization.id)
                if (companyId) {
                    await db
                        .delete(companyUsers)
                        .where(
                            and(
                                eq(companyUsers.userId, event.data.publicUserData.userId),
                                eq(companyUsers.companyId, companyId)
                            )
                        )
                }
                break
            }
            // Add more event types as needed
            default:
                break
        }
        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("[ClerkWebhook] Handler error:", error)
        const message = error instanceof Error ? error.message : "Unknown error"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
