// Utility to create a Clerk webhook via Clerk API
// Usage: call createClerkWebhook with your webhook URL and desired events

const CLERK_API_KEY = process.env.CLERK_API_KEY;
const CLERK_API_URL = "https://api.clerk.com/v1/webhooks";

type CreateClerkWebhookParams = {
  url: string;
  events: string[];
};

export async function createClerkWebhook({
  url,
  events,
}: CreateClerkWebhookParams) {
  if (!CLERK_API_KEY) throw new Error("CLERK_API_KEY is not set");
  const res = await fetch(CLERK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLERK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      events,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create webhook: ${error}`);
  }
  return res.json();
}
