import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db/index";
import { companies, companyUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "organization.created") {
    // Create a new company when an organization is created
    const { id, name } = evt.data;

    try {
      await db.insert(companies).values({
        name: name,
        clerkOrgId: id,
      });
    } catch (err) {
      console.error("Error creating company:", err);
      return new Response("Error creating company", { status: 500 });
    }
  } else if (eventType === "organization.updated") {
    // Update company when organization is updated
    const { id, name } = evt.data;
    try {
      await db
        .update(companies)
        .set({ name })
        .where(eq(companies.clerkOrgId, id));
    } catch (err) {
      console.error("Error updating company:", err);
      return new Response("Error updating company", { status: 500 });
    }
  } else if (eventType === "organization.deleted") {
    // Delete company when organization is deleted
    const { id } = evt.data;
    if (!id) {
      return new Response("Missing organization id", { status: 400 });
    }
    try {
      await db.delete(companies).where(eq(companies.clerkOrgId, id));
    } catch (err) {
      console.error("Error deleting company:", err);
      return new Response("Error deleting company", { status: 500 });
    }
  } else if (eventType === "organizationMembership.created") {
    // Add user to company when they are added to an organization
    const { organization, public_user_data } = evt.data;

    try {
      // Find the company with the clerk org id
      const company = await db.query.companies.findFirst({
        where: eq(companies.clerkOrgId, organization.id),
      });

      if (!company) {
        console.error("Company not found for organization:", organization.id);
        return new Response("Company not found", { status: 404 });
      }

      // Add the user to the company
      await db.insert(companyUsers).values({
        userId: public_user_data.user_id,
        companyId: company.id,
        role: "viewer", // Default role for new members
      });
    } catch (err) {
      console.error("Error adding user to company:", err);
      return new Response("Error adding user to company", { status: 500 });
    }
  } else if (eventType === "organizationMembership.deleted") {
    // Remove user from company when org membership is deleted
    const { organization, public_user_data } = evt.data;
    try {
      const company = await db.query.companies.findFirst({
        where: eq(companies.clerkOrgId, organization.id),
      });
      if (!company) {
        console.error("Company not found for organization:", organization.id);
        return new Response("Company not found", { status: 404 });
      }
      await db
        .delete(companyUsers)
        .where(
          and(
            eq(companyUsers.userId, public_user_data.user_id),
            eq(companyUsers.companyId, company.id),
          ),
        );
    } catch (err) {
      console.error("Error removing user from company:", err);
      return new Response("Error removing user from company", { status: 500 });
    }
  } else if (eventType === "user.created") {
    // Optionally, create user in your own users table if needed
    // Example: await db.insert(users).values({ ... })
    // No-op if not syncing users table
  } else if (eventType === "user.updated") {
    // Optionally, update user in your own users table if needed
    // Example: await db.update(users).set({ ... }).where(...)
    // No-op if not syncing users table
  } else if (eventType === "user.deleted") {
    // Optionally, delete user in your own users table if needed
    // Example: await db.delete(users).where(...)
    // No-op if not syncing users table
  }

  return new Response("Webhook received", { status: 200 });
}
