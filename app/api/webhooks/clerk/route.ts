/**
 * Clerk Webhook API Route
 * 
 * Handles Clerk authentication events and synchronizes them with our Neon PostgreSQL database
 * for multi-tenant ABAC system.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhook, UserWebhookHandler, OrganizationWebhookHandler } from '@/lib/webhooks/clerk'
import { 
  UserWebhookPayload, 
  OrganizationWebhookPayload,
  WebhookEventType 
} from '@/types/auth'

/**
 * Handle POST requests from Clerk webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature and get payload
    const { eventType, payload } = await verifyWebhook(request)
    
    console.log(`Processing webhook event: ${eventType}`)
    
    // Route to appropriate handler based on event type
    switch (eventType) {
      // User events
      case 'user.created':
        await UserWebhookHandler.handleUserCreated(payload as UserWebhookPayload)
        break
        
      case 'user.updated':
        await UserWebhookHandler.handleUserUpdated(payload as UserWebhookPayload)
        break
        
      case 'user.deleted':
        await UserWebhookHandler.handleUserDeleted(payload as UserWebhookPayload)
        break
        
      // Organization events
      case 'organization.created':
        await OrganizationWebhookHandler.handleOrganizationCreated(payload as OrganizationWebhookPayload)
        break
        
      case 'organization.updated':
        await OrganizationWebhookHandler.handleOrganizationUpdated(payload as OrganizationWebhookPayload)
        break
        
      case 'organization.deleted':
        await OrganizationWebhookHandler.handleOrganizationDeleted(payload as OrganizationWebhookPayload)
        break
        
      // Organization membership events
      case 'organizationMembership.created':
      case 'organizationMembership.updated':
      case 'organizationMembership.deleted':
        // These events are handled through user events for simplicity
        console.log(`Organization membership event ${eventType} - handled via user events`)
        break
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Invalid signature')) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' }, 
          { status: 401 }
        )
      }
      
      if (error.message.includes('Invalid payload')) {
        return NextResponse.json(
          { error: 'Invalid webhook payload' }, 
          { status: 400 }
        )
      }
    }
    
    // Internal server error for unexpected errors
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

/**
 * Handle GET requests (for webhook endpoint verification)
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Clerk webhook endpoint is active' }, 
    { status: 200 }
  )
}
