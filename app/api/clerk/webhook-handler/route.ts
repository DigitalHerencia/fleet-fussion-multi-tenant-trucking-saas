import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db/index";
import { companies, companyUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { type ClerkWebhookEvent } from "@/types/clerk-webhook";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Type guard to ensure evt is a WebhookEvent
  if (!evt || typeof evt !== "object" || !("type" in evt)) {
    return new Response("Invalid webhook event", { status: 400 });
  }

  // Handle the webhook
  const eventType = (evt as ClerkWebhookEvent).type;

  if (eventType === "organization.created") {
    const { id: orgId, name } = evt.data as { id: string; name: string };
    try {
      await db.insert(companies).values({
        name,
        clerkOrgId: orgId,
      });
    } catch {
      return new Response("Error creating company", { status: 500 });
    }
  } else if (eventType === "organization.updated") {
    const { id: orgId, name } = evt.data as { id: string; name: string };
    try {
      await db.update(companies)
        .set({ name })
        .where(eq(companies.clerkOrgId, orgId));
    } catch {
      return new Response("Error updating company", { status: 500 });
    }
  } else if (eventType === "organizationMembership.created") {
    const { organization: { id: orgId }, publicUserData: { userId }, role } = evt.data as any;
    try {
      const company = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.clerkOrgId, orgId));
      if (company.length) {
        await db.insert(companyUsers).values({
          userId,
          companyId: company[0].id,
          role,
        });
      }
    } catch {
      return new Response("Error adding company user", { status: 500 });
    }
  } else if (eventType === "organizationMembership.updated") {
    const { organization: { id: orgId }, publicUserData: { userId }, role } = evt.data as any;
    try {
      const company = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.clerkOrgId, orgId));
      if (company.length) {
        await db.update(companyUsers)
          .set({ role })
          .where(
            and(
              eq(companyUsers.userId, userId),
              eq(companyUsers.companyId, company[0].id)
            )
          );
      }
    } catch {
      return new Response("Error updating company user", { status: 500 });
    }
  } else if (eventType === "organizationMembership.deleted") {
    const { organization: { id: orgId }, publicUserData: { userId } } = evt.data as any;
    try {
      const company = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.clerkOrgId, orgId));
      if (company.length) {
        await db.delete(companyUsers)
          .where(
            and(
              eq(companyUsers.userId, userId),
              eq(companyUsers.companyId, company[0].id)
            )
          );
      }
    } catch {
      return new Response("Error removing company user", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
