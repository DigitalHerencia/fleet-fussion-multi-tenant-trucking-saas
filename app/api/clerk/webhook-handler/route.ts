import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db/index";
import { companies } from "@/db/schema";
import { ClerkWebhookEvent } from "@/types/clerk-webhook";

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
    // Create a new company when an organization is created
    const { name } = evt.data as { name: string };
    try {
      await db.insert(companies).values({
        name: name,
        // ...other fields as needed
      });
    } catch {
      return new Response("Error creating company", { status: 500 });
    }
  }

  // Add more event handling as needed

  return new Response("Webhook received", { status: 200 });
}
