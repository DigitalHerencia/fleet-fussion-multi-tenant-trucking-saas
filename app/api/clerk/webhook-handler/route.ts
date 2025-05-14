import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db/db";
import { companies, companyUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ClerkWebhookEvent } from "@/types/clerk-webhook";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  // Create a new Svix instance with your webhook secret
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  
  // Ensure webhook secret is present
  if (!secret) {
    console.error("Missing CLERK_WEBHOOK_SECRET env variable");
    return new Response("Server configuration error", { status: 500 });
  }
  
  const wh = new Webhook(secret);

  let evt: ClerkWebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  if (!evt || typeof evt !== "object" || !("type" in evt)) {
    return new Response("Invalid webhook event", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "organization.created") {
    const orgId = evt.data?.id;
    const name = evt.data?.name;
    try {
      await db.insert(companies).values({
        name,
        clerkOrgId: orgId
      });
    } catch (err) {
      console.error("Error creating company:", err);
      return new Response("Error creating company", { status: 500 });
    }
  } else if (eventType === "organization.updated") {
    const orgId = evt.data?.id;
    const name = evt.data?.name;
    try {
      await db.update(companies)
        .set({ name })
        .where(eq(companies.clerkOrgId, orgId));
    } catch (err) {
      console.error("Error updating company:", err);
      return new Response("Error updating company", { status: 500 });
    }
  } else if (eventType === "organization.deleted") {
    const orgId = evt.data?.id;
    if (!orgId) {
      return new Response("Missing organization id", { status: 400 });
    }
    try {
      await db.delete(companies).where(eq(companies.clerkOrgId, orgId));
    } catch (err) {
      console.error("Error deleting company:", err);
      return new Response("Error deleting company", { status: 500 });
    }
  } else if (eventType === "organizationMembership.created") {
    // Support both Clerk v4 and v5 payloads
    const orgId = evt.data?.organization?.id 
    const userId = evt.data?.publicUserData?.userId 
    const userRole = evt.data?.role 
    try {
      const company = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.clerkOrgId, orgId));
      if (company.length) {
        await db.insert(companyUsers).values({
          userId,
          companyId: company[0].id,
          role: userRole
        });
      } else {
        console.error("Company not found for organization:", orgId);
        return new Response("Company not found", { status: 404 });
      }
    } catch (err) {
      console.error("Error adding company user:", err);
      return new Response("Error adding company user", { status: 500 });
    }
  } else if (eventType === "organizationMembership.updated") {
    const orgId = evt.data?.organization?.id 
    const userId = evt.data?.publicUserData?.userId 
    const userRole = evt.data?.role;
    try {
      const company = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.clerkOrgId, orgId));
      if (company.length) {
        await db.update(companyUsers)
          .set({ role: userRole })
          .where(
            and(
              eq(companyUsers.userId, userId),
              eq(companyUsers.companyId, company[0].id)
            )
          );
      }
    } catch (err) {
      console.error("Error updating company user:", err);
      return new Response("Error updating company user", { status: 500 });
    }
  } else if (eventType === "organizationMembership.deleted") {
    const orgId = evt.data?.organization?.id 
    const userId = evt.data?.publicUserData?.userId 
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
    } catch (err) {
      console.error("Error removing company user:", err);
      return new Response("Error removing company user", { status: 500 });
    }
  } else if (eventType === "user.created") {
    // Optionally, create user in your own users table if needed
    // No-op if not syncing users table
  } else if (eventType === "user.updated") {
    // Optionally, update user in your own users table if needed
    // No-op if not syncing users table
  } else if (eventType === "user.deleted") {
    // Optionally, delete user in your own users table if needed
    // No-op if not syncing users table
  }

  return new Response("Webhook received", { status: 200 });
}
