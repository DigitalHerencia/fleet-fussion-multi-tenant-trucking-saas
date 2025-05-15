import { Webhook } from "svix";
import { db } from "@/db/db";
import { companies, companyUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ClerkWebhookEvent } from "@/types/clerk-webhook";
import logger from "@/lib/utils/logger";

export async function POST(req: Request) {
  try {
    logger.debug("Webhook: received POST", { url: req.url });

    // Retrieve Svix signature headers
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      logger.error("Webhook: missing Svix headers");
      return new Response("Error missing svix headers", { status: 400 });
    }

    // Use raw body for signature verification
    const body = await req.text();
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      logger.error("Webhook: missing CLERK_WEBHOOK_SECRET env variable");
      // TODO: integrate alerting service for critical environment issues
      return new Response("Server configuration error", { status: 500 });
    }

    const wh = new Webhook(secret);

    let evt: ClerkWebhookEvent;
    try {
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

    if (!evt || typeof evt !== "object" || !("type" in evt)) {
      logger.error("Webhook: invalid event payload");
      return new Response("Invalid webhook event", { status: 400 });
    }

    const eventType = evt.type;
    logger.debug("Webhook: processing event", { eventType });

    if (eventType === "organization.created") {
      const orgId = evt.data?.id;
      const name = evt.data?.name;
      try {
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
      const orgId = evt.data?.id;
      const name = evt.data?.name;
      try {
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
      const orgId = evt.data?.id;
      if (!orgId) {
        logger.error("Webhook: missing organization id for deletion");
        return new Response("Missing organization id", { status: 400 });
      }
      try {
        await db.delete(companies).where(eq(companies.clerkOrgId, orgId));
        logger.info("Webhook: organization deleted", { orgId });
      } catch (err) {
        logger.error("Webhook: error deleting company", err);
        return new Response("Error deleting company", { status: 500 });
      }
    } else if (eventType === "organizationMembership.created") {
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      const userRole = evt.data?.role;
      try {
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
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
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      const userRole = evt.data?.role;
      try {
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
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
      const orgId = evt.data?.organization?.id;
      const userId = evt.data?.publicUserData?.userId;
      try {
        const company = await db
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clerkOrgId, orgId));
        if (company.length) {
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
    } else if (eventType === "user.created") {
      logger.info("Webhook: user created", { userId: evt.data?.id });
      // Optionally, create user in your own users table if needed
      // No-op if not syncing users table
    } else if (eventType === "user.updated") {
      logger.info("Webhook: user updated", { userId: evt.data?.id });
      // Optionally, update user in your own users table if needed
      // No-op if not syncing users table
    } else if (eventType === "user.deleted") {
      logger.info("Webhook: user deleted", { userId: evt.data?.id });
      // Optionally, delete user in your own users table if needed
      // No-op if not syncing users table
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    logger.error("Webhook: unexpected error", err);
    // TODO: integrate alerting service for unhandled exceptions
    return new Response("Internal server error", { status: 500 });
  }
}
