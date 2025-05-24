/**
 * Clerk Webhook Handlers
 * 
 * Handles synchronization between Clerk authentication events
 * and our Neon PostgreSQL database for multi-tenant ABAC
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type { Webhook } from 'svix';
import { Webhook as SvixWebhook } from 'svix';
import { DatabaseQueries } from '@/lib/database'
import { 
  UserWebhookPayload, 
  OrganizationWebhookPayload,
  ClerkUserMetadata,
  ClerkOrganizationMetadata,
  ROLE_PERMISSIONS 
} from '@/types/auth'

// Webhook secret from environment
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET as string

if (!WEBHOOK_SECRET) {
  throw new Error('CLERK_WEBHOOK_SECRET environment variable is required')
}

/**
 * Verify webhook signature and parse payload
 */
export async function verifyWebhook(request: NextRequest) {
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error('Missing webhook headers')
  }

  const payload = await request.text()
  const body = JSON.parse(payload)

  // Verify the webhook signature
  const wh = new SvixWebhook(WEBHOOK_SECRET)
  
  try {
    const evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
    
    return evt
  } catch (error) {
    console.error('Webhook verification failed:', error)
    throw new Error('Webhook verification failed')
  }
}

/**
 * Handle user webhook events
 */
export class UserWebhookHandler {
  /**
   * Handle user.created event
   */
  static async handleUserCreated(payload: UserWebhookPayload) {
    try {
      console.log('Processing user.created webhook:', payload.data.id)
      
      const userData = payload.data
      const primaryEmail = userData.email_addresses?.[0]?.email_address
      
      if (!primaryEmail) {
        throw new Error('User must have an email address')
      }
      
      // Get the user's organization membership
      const orgMembership = userData.organization_memberships?.[0]
      if (!orgMembership) {
        console.log('User created without organization membership, skipping database sync')
        return
      }
      
      // Extract organization info
      const organization = orgMembership.organization
      const orgMetadata = organization.public_metadata as ClerkOrganizationMetadata
      
      // Ensure organization exists in database
      await DatabaseQueries.upsertOrganization({
        clerkId: organization.id,
        name: organization.name,
        slug: organization.slug,
        metadata: orgMetadata
      })
      
      // Get the organization from database to get internal ID
      const dbOrg = await DatabaseQueries.getOrganizationByClerkId(organization.id)
      if (!dbOrg) {
        throw new Error('Failed to create/find organization in database')
      }
      
      // Extract user metadata
      const userMetadata = orgMembership.public_metadata as ClerkUserMetadata
      const role = userMetadata?.role || 'viewer'
      const permissions = userMetadata?.permissions || ROLE_PERMISSIONS[role] || []
      
      // Create user in database
      await DatabaseQueries.upsertUser({
        clerkId: userData.id,
        organizationId: dbOrg.id,
        email: primaryEmail,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profileImage: userData.profile_image_url,
        role,
        permissions,
        isActive: userMetadata?.isActive ?? true,
        onboardingCompleted: userMetadata?.onboardingCompleted ?? false
      })
      
      console.log('Successfully created user in database:', userData.id)
    } catch (error) {
      console.error('Error handling user.created webhook:', error)
      throw error
    }
  }
  
  /**
   * Handle user.updated event
   */
  static async handleUserUpdated(payload: UserWebhookPayload) {
    try {
      console.log('Processing user.updated webhook:', payload.data.id)
      
      const userData = payload.data
      const primaryEmail = userData.email_addresses?.[0]?.email_address
      
      if (!primaryEmail) {
        throw new Error('User must have an email address')
      }
      
      // Get the user's organization membership
      const orgMembership = userData.organization_memberships?.[0]
      if (!orgMembership) {
        console.log('User updated without organization membership, skipping database sync')
        return
      }
      
      // Get the organization from database
      const dbOrg = await DatabaseQueries.getOrganizationByClerkId(orgMembership.organization.id)
      if (!dbOrg) {
        throw new Error('Organization not found in database')
      }
      
      // Extract user metadata
      const userMetadata = orgMembership.public_metadata as ClerkUserMetadata
      const role = userMetadata?.role || 'viewer'
      const permissions = userMetadata?.permissions || ROLE_PERMISSIONS[role] || []
      
      // Update user in database
      await DatabaseQueries.upsertUser({
        clerkId: userData.id,
        organizationId: dbOrg.id,
        email: primaryEmail,
        firstName: userData.first_name,
        lastName: userData.last_name,
        profileImage: userData.profile_image_url,
        role,
        permissions,
        isActive: userMetadata?.isActive ?? true,
        onboardingCompleted: userMetadata?.onboardingCompleted ?? false
      })
      
      console.log('Successfully updated user in database:', userData.id)
    } catch (error) {
      console.error('Error handling user.updated webhook:', error)
      throw error
    }
  }
  
  /**
   * Handle user.deleted event
   */
  static async handleUserDeleted(payload: UserWebhookPayload) {
    try {
      console.log('Processing user.deleted webhook:', payload.data.id)
      
      await DatabaseQueries.deleteUser(payload.data.id)
      
      console.log('Successfully deleted user from database:', payload.data.id)
    } catch (error) {
      console.error('Error handling user.deleted webhook:', error)
      throw error
    }
  }
}

/**
 * Handle organization webhook events
 */
export class OrganizationWebhookHandler {
  /**
   * Handle organization.created event
   */
  static async handleOrganizationCreated(payload: OrganizationWebhookPayload) {
    try {
      console.log('Processing organization.created webhook:', payload.data.id)
      
      const orgData = payload.data
      const metadata = orgData.public_metadata as ClerkOrganizationMetadata
      
      await DatabaseQueries.upsertOrganization({
        clerkId: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        metadata
      })
      
      console.log('Successfully created organization in database:', orgData.id)
    } catch (error) {
      console.error('Error handling organization.created webhook:', error)
      throw error
    }
  }
  
  /**
   * Handle organization.updated event
   */
  static async handleOrganizationUpdated(payload: OrganizationWebhookPayload) {
    try {
      console.log('Processing organization.updated webhook:', payload.data.id)
      
      const orgData = payload.data
      const metadata = orgData.public_metadata as ClerkOrganizationMetadata
      
      await DatabaseQueries.upsertOrganization({
        clerkId: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        metadata
      })
      
      console.log('Successfully updated organization in database:', orgData.id)
    } catch (error) {
      console.error('Error handling organization.updated webhook:', error)
      throw error
    }
  }
  
  /**
   * Handle organization.deleted event
   */
  static async handleOrganizationDeleted(payload: OrganizationWebhookPayload) {
    try {
      console.log('Processing organization.deleted webhook:', payload.data.id)
      
      await DatabaseQueries.deleteOrganization(payload.data.id)
      
      console.log('Successfully deleted organization from database:', payload.data.id)
    } catch (error) {
      console.error('Error handling organization.deleted webhook:', error)
      throw error
    }
  }
}

/**
 * Main webhook router
 */
export async function handleWebhook(request: NextRequest) {
  try {
    // Verify webhook and get event
    const evt = await verifyWebhook(request)
    
    // Route to appropriate handler based on event type
    const event = evt as any; // Cast to any to access .type
    switch (event.type) {
      // User events
      case 'user.created':
        await UserWebhookHandler.handleUserCreated(event as UserWebhookPayload)
        break
        
      case 'user.updated':
        await UserWebhookHandler.handleUserUpdated(event as UserWebhookPayload)
        break
        
      case 'user.deleted':
        await UserWebhookHandler.handleUserDeleted(event as UserWebhookPayload)
        break
        
      // Organization events
      case 'organization.created':
        await OrganizationWebhookHandler.handleOrganizationCreated(event as OrganizationWebhookPayload)
        break
        
      case 'organization.updated':
        await OrganizationWebhookHandler.handleOrganizationUpdated(event as OrganizationWebhookPayload)
        break
        
      case 'organization.deleted':
        await OrganizationWebhookHandler.handleOrganizationDeleted(event as OrganizationWebhookPayload)
        break
        
      default:
        console.log('Unhandled webhook event type:', event.type);
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Webhook handling error:', error)
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    )
  }
}
