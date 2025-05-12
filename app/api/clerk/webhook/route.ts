import { NextRequest, NextResponse } from "next/server";
import { createClerkWebhook } from "@/lib/clerk-webhook";

// POST /api/clerk/webhook
export async function POST(req: NextRequest) {
  try {
    const { url, events }: { url: string; events: string[] } = await req.json();
    if (!url || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Missing url or events" },
        { status: 400 },
      );
    }
    const webhook = await createClerkWebhook({ url, events });
    return NextResponse.json({ webhook });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
