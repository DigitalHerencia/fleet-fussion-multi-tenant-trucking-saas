import { Webhook } from "svix";
import { db } from "@/db/db";
import { companies, companyUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ClerkWebhookEvent } from "@/types/clerk-webhook";
import logger from "@/lib/utils/logger";

export async function POST(req: Request) {
  try {
    logger.debug("Webhook: received POST", { url: req.url });

    // Section: Retrieve and Validate Svix Headers
    // Clerk webhooks are signed using Svix. These headers are necessary for verification.
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error("Webhook: missing Svix headers");
      return new Response("Error missing svix headers", { status: 400 });
    }

    // Section: Retrieve Webhook Secret
    // The raw request body is needed for signature verification.
    const body = await req.text();
    // The webhook secret is stored as an environment variable.
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      logger.error("Webhook: missing CLERK_WEBHOOK_SECRET env variable");
      return new Response("Server configuration error", { status: 500 });
    }

    // Section: Verify Webhook Signature
    // Initialize a new Svix Webhook instance with the secret.
    const wh = new Webhook(secret);

    let evt: ClerkWebhookEvent;
    try {
      // Verify the webhook signature using the body and Svix headers.
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as ClerkWebhookEvent;
      logger.info("Webhook: verified event", { type: evt.type });
    } catch (err) {
      logger.error("Webhook: error verifying webhook", err);
      // TODO: integrate alerting service for verification failures
      return new Response("Error verifying webhook", { status: 400 });
    }

    // Section: Validate Event Payload
    // Ensure the event object and its type property are present.
    if (!evt || typeof evt !== "object" || !("type" in evt)) {
      logger.error("Webhook: invalid event payload");
      return new Response("Invalid webhook event", { status: 400 });
    }

    const eventType = evt.type;
    logger.debug("Webhook: processing event", { eventType });

    // Section: Process Organization Events
    if (eventType === "organization.created") {
      // Handles the creation of a new organization in Clerk.
      const orgId = evt.data?.id;
      const name = evt.data?.name;
      try {
        // Insert a new company record into the database.
        await db.insert(companies).values({
          name,
          clerkOrgId: orgId,
        });
        logger.info("Webhook: organization created", { orgId, name });
      } catch (err) {
        logger.error("Webhook: error creating company", err);
        return new Response("Error creating company", { status: 500 });
      }
    } else if (eventType === "organization.updated") {
      // Handles updates to an existing organization in Clerk.
      const orgId = evt.data?.id;
      const name = evt.data?.name;
      try {
        // Update the company name in the database.
        await db
          .update(companies)
          .set({ name })
          .where(eq(companies.clerkOrgId, orgId));
        logger.info("Webhook: organization updated", { orgId, name });
      } catch (err) {
        logger.error("Webhook: error updating company", err);
        return new Response("Error updating company", { status: 500 });
      }
    } else if (eventType === "organization.deleted") {
      // Handles the deletion of an organization in Clerk.
      const orgId = evt.data?.id;
      if (!orgId) {
        logger.error("Webhook: missing organization id for deletion");
        return new Response("Missing organization id", { status: 400 });
      }
      try {
        // Delete the company record from the database.
        await db.delete(companies).where(eq(companies.clerkOrgId, orgId));
        logger.info("Webhook: organization deleted", { orgId });
      } catch (err) {
        logger.error("Webhook: error deleting company", err);
        return new Response("Error deleting company", { status: 500 });
      }
    } 
    // Section: Process Organization Membership Events
    else if (eventType === "organizationMembership.created") {
      // Handles a user being added to an organization in Clerk.
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      const userRole = evt.data?.role;
      try {
        // Find the corresponding company in the database.
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
          // Add the user to the company with their role.
          await db.insert(companyUsers).values({
            userId,
            companyId: company[0].id,
            role: userRole,
          });
          logger.info("Webhook: organization membership created", {
            orgId,
            userId,
            userRole,
          });
        } else {
          logger.error("Webhook: company not found for organization", {
            orgId,
          });
          return new Response("Company not found", { status: 404 });
        }
      } catch (err) {
        logger.error("Webhook: error adding company user", err);
        return new Response("Error adding company user", { status: 500 });
      }
    } else if (eventType === "organizationMembership.updated") {
      // Handles updates to a user's membership in an organization (e.g., role change).
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      const userRole = evt.data?.role;
      try {
        // Find the corresponding company in the database.
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
          // Update the user's role in the company.
          await db
            .update(companyUsers)
            .set({ role: userRole })
            .where(
              and(
                eq(companyUsers.userId, userId),
                eq(companyUsers.companyId, company[0].id)
              )
            );
          logger.info("Webhook: organization membership updated", {
            orgId,
            userId,
            userRole,
          });
        }
      } catch (err) {
        logger.error("Webhook: error updating company user", err);
        return new Response("Error updating company user", { status: 500 });
      }
    } else if (eventType === "organizationMembership.deleted") {
      // Handles a user being removed from an organization in Clerk.
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      try {
        // Find the corresponding company in the database.
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
          // Remove the user from the company.
          await db
            .delete(companyUsers)
            .where(
              and(
                eq(companyUsers.userId, userId),
                eq(companyUsers.companyId, company[0].id)
              )
            );
          logger.info("Webhook: organization membership deleted", {
            orgId,
            userId,
          });
        }
      } catch (err) {
        logger.error("Webhook: error removing company user", err);
        return new Response("Error removing company user", { status: 500 });
      }
    } 
    // Section: Process User Events
    // These events are logged but currently do not trigger database operations
    // unless a separate user synchronization table is implemented.
    else if (eventType === "user.created") {
      // Handles the creation of a new user in Clerk.
      logger.info("Webhook: user created", { userId: evt.data?.id });
      // Optionally, create user in your own users table if needed
      // No-op if not syncing users table
    } else if (eventType === "user.updated") {
      // Handles updates to an existing user in Clerk.
      logger.info("Webhook: user updated", { userId: evt.data?.id });
      // Optionally, update user in your own users table if needed
      // No-op if not syncing users table
    } else if (eventType === "user.deleted") {
      // Handles the deletion of a user in Clerk.
      logger.info("Webhook: user deleted", { userId: evt.data?.id });
      // Optionally, delete user in your own users table if needed
      // No-op if not syncing users table
    }

    // Section: Success Response
    // If all processing is successful, return a 200 OK response.
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    // Section: Error Handling
    // Catch any unexpected errors during webhook processing.
    logger.error("Webhook: unexpected error", err);
    // TODO: integrate alerting service for unhandled exceptions
    return new Response("Internal server error", { status: 500 });
  }
}
