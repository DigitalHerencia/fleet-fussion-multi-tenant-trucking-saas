/**
 * Clerk Webhook Handler API Route
 * 
 * Handles Clerk authentication events and organization creation
 * Synchronizes with Neon PostgreSQL database for multi-tenant ABAC system
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Webhook } from 'svix';
// import { db, DatabaseQueries } from '@/lib/database';
import { DatabaseQueries } from '@/lib/database';
import type { WebhookPayload, UserWebhookData, OrganizationWebhookData, OrganizationMembershipWebhookData } from '@/types/webhooks';
// import type { WebhookEventType, WebhookPayload, UserWebhookData, OrganizationWebhookData, OrganizationMembershipWebhookData } from '@/types/webhooks';
import { ratelimit } from '@/lib/rate-limit';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';

// Environment variables check
if (!process.env.CLERK_WEBHOOK_SECRET) {
  throw new Error('CLERK_WEBHOOK_SECRET environment variable is required');
}

// Rate limiting configuration for webhook endpoint
const webhookRateLimit = ratelimit({
  interval: '1m',    // 1 minute window
  limit: 60          // 60 requests per minute max
});

async function verifyWebhook(request: NextRequest): Promise<WebhookPayload | null> {
  try {
    const body = await request.text();
    const svix_id = request.headers.get('svix-id');
    const svix_timestamp = request.headers.get('svix-timestamp');
    const svix_signature = request.headers.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing required Svix headers");
      return null;
    }

    // Use Svix webhook for proper signature verification
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    const evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookPayload;

    return evt;
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Check rate limit first
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimit = await webhookRateLimit(identifier);
  
  if (!rateLimit.success) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.reset.toString()
      }
    });
  }

  const evt = await verifyWebhook(request);
  
  if (!evt) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { type, data } = evt;
    console.log(`📨 Processing webhook: ${type} for ID: ${data.id}`);

    switch (type) {
      // User Events
      case 'user.created': {
        const userData = data as UserWebhookData;
        // Get organization context from membership or metadata
        const orgMembership = userData.organization_memberships?.[0];
        const organizationId = userData.public_metadata?.organizationId || 
                              orgMembership?.organization?.id || '';
        if (!organizationId) {
          console.warn(`⚠️ Skipping user.created for ${userData.id}: organizationId missing in webhook payload.`);
          break;
        }
        // Determine role from membership or default to USER
        const role = orgMembership?.role as UserRole || UserRole.USER;
        const permissions = ROLE_PERMISSIONS[role] || [];
        await DatabaseQueries.upsertUser({
          clerkId: userData.id,
          organizationId,
          email: userData.email_addresses?.[0]?.email_address || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          profileImage: userData.profile_image_url,
          isActive: true,
          onboardingCompleted: userData.public_metadata?.onboardingComplete || false,
        });
        console.log(`✅ User created: ${userData.id} in org: ${organizationId}`);
        break;
      }
      
      case 'user.updated': {
        const userData = data as UserWebhookData;
        // Get updated organization context
        const orgMembership = userData.organization_memberships?.[0];
        const organizationId = userData.public_metadata?.organizationId || 
                              orgMembership?.organization?.id || '';
        if (!organizationId) {
          console.warn(`⚠️ Skipping user.updated for ${userData.id}: organizationId missing in webhook payload.`);
          break;
        }
        // Update role if it changed
        const role = orgMembership?.role as UserRole;
        const permissions = role ? ROLE_PERMISSIONS[role] : undefined;
        await DatabaseQueries.upsertUser({
          clerkId: userData.id,
          organizationId,
          email: userData.email_addresses?.[0]?.email_address || '',
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          profileImage: userData.profile_image_url,
          ...(role && { role }),
          ...(permissions && { permissions }),
          isActive: userData.public_metadata?.isActive !== false,
          ...(userData.public_metadata?.onboardingComplete !== undefined && {
            onboardingCompleted: userData.public_metadata.onboardingComplete
          })
        });
        console.log(`✅ User updated: ${userData.id}`);
        break;
      }

      case 'user.deleted': {
        const userData = data as UserWebhookData;
        // Look up last known organization for this user
        const dbUser = await DatabaseQueries.getUserByClerkId(userData.id);
        if (dbUser && dbUser.organizationId) {
          await DatabaseQueries.upsertUser({
            clerkId: userData.id,
            organizationId: dbUser.organizationId,
            email: userData.email_addresses?.[0]?.email_address || '',
            isActive: false
          });
          console.log(`✅ User deactivated: ${userData.id}`);
        } else {
          console.warn(`⚠️ Skipping user.deleted for ${userData.id}: organizationId not found in DB.`);
        }
        break;
      }

      // Organization Events
      case 'organization.created': {
        const orgData = data as OrganizationWebhookData;
        
        await DatabaseQueries.upsertOrganization({
          clerkId: orgData.id,
          name: orgData.name,
          slug: orgData.slug || generateSlug(orgData.name)
          // metadata: orgData.public_metadata // removed, not a valid property
        });
        
        console.log(`✅ Organization created: ${orgData.id} (${orgData.name})`);
        break;
      }

      case 'organization.updated': {
        const orgData = data as OrganizationWebhookData;
        
        await DatabaseQueries.upsertOrganization({
          clerkId: orgData.id,
          name: orgData.name,
          slug: orgData.slug || generateSlug(orgData.name)
          // metadata: orgData.public_metadata // removed, not a valid property
        });
        
        console.log(`✅ Organization updated: ${orgData.id}`);
        break;
      }

      case 'organization.deleted': {
        const orgData = data as OrganizationWebhookData;
        
        await DatabaseQueries.deleteOrganization(orgData.id);
        
        console.log(`✅ Organization deleted: ${orgData.id}`);
        break;
      }

      // Organization Membership Events
      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        const membershipData = data as OrganizationMembershipWebhookData;
        await DatabaseQueries.upsertUser({
          clerkId: membershipData.user_id!,
          organizationId: membershipData.organization.id,
          email: '', // Email not available in membership event
          isActive: true,
          onboardingCompleted: true
        });
        break;
      }
      case 'organizationMembership.deleted': {
        const membershipData = data as OrganizationMembershipWebhookData;
        await DatabaseQueries.upsertUser({
          clerkId: membershipData.user_id!,
          organizationId: membershipData.organization.id,
          email: '', // Email not available in membership event
          isActive: false
        });
        break;
      }

      // Session Events
      case 'session.created': {
        // Optionally handle session.created event (e.g., analytics, session sync)
        console.log(`✅ Session created: ${data.id}`);
        break;
      }

      default: {
        // Log and acknowledge unhandled event types
        console.warn(`⚠️ Unhandled webhook event type: ${type}`);
        // Optionally, return 200 OK for unhandled events to avoid retries
        break;
      }
    }
    return new NextResponse('OK', { status: 200 }); // Optionally respond OK after processing
  } catch (err) {
    console.error('❌ Error processing webhook:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} // <-- Add this to close the POST function

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

