import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// External auth service integration
async function syncUserWithExternalAuth(
    userId: string,
    eventType: string,
    payload: Record<string, unknown>
) {
    try {
        // Define endpoints based on event type
        const endpoints = {
            "user.created": process.env.EXTERNAL_AUTH_USER_CREATE_URL,
            "user.updated": process.env.EXTERNAL_AUTH_USER_UPDATE_URL,
            "user.deleted": process.env.EXTERNAL_AUTH_USER_DELETE_URL,
            "organization.created": process.env.EXTERNAL_AUTH_ORG_CREATE_URL,
            "organization.updated": process.env.EXTERNAL_AUTH_ORG_UPDATE_URL,
            "organization.deleted": process.env.EXTERNAL_AUTH_ORG_DELETE_URL
        }

        const endpoint = endpoints[eventType as keyof typeof endpoints]
        if (!endpoint) {
            console.log(`No endpoint configured for event type: ${eventType}`)
            return
        }

        // Add auth service API key from environment variable
        const externalAuthApiKey = process.env.EXTERNAL_AUTH_API_KEY
        if (!externalAuthApiKey) {
            throw new Error("Missing EXTERNAL_AUTH_API_KEY environment variable")
        }

        // Forward event data to external auth service
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${externalAuthApiKey}`
            },
            body: JSON.stringify({
                userId,
                eventType,
                payload
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `External auth sync failed with status ${response.status}: ${errorText}`
            )
        }

        return await response.json()
    } catch (error) {
        console.error("External auth sync error:", error)
        throw error
    }
}

export async function POST(req: Request) {
    try {
        // Get the webhook signature from the headers
        const headerPayload = await headers()
        const svix_id = headerPayload.get("svix-id")
        const svix_timestamp = headerPayload.get("svix-timestamp")
        const svix_signature = headerPayload.get("svix-signature")

        // If there's no signature, return error
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 })
        }

        // Get the webhook secret from environment variable
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
            return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
        }

        // Create a new Webhook instance with the secret
        const wh = new Webhook(webhookSecret)

        // Get the body of the request
        const payload = await req.json()

        // Verify the webhook payload with the signature
        const evt = wh.verify(JSON.stringify(payload), {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent

        // Get the event type and data
        const eventType = evt.type
        const data = evt.data

        // Handle different webhook event types
        if (!eventType.startsWith("user") && !eventType.startsWith("organization")) {
            // Skip events we don't care about
            return NextResponse.json({ success: true })
        }

        // Get the user ID or organization ID based on the event type
        const id = eventType.startsWith("user") ? (data.id as string) : (data.id as string)

        if (!id) {
            return NextResponse.json({ error: "No ID found in webhook payload" }, { status: 400 })
        }

        // Sync the user/organization with external auth service
        await syncUserWithExternalAuth(id, eventType, data as unknown as Record<string, unknown>)

        return NextResponse.json({ success: true, eventType })
    } catch (error) {
        console.error("Webhook error:", error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
}
