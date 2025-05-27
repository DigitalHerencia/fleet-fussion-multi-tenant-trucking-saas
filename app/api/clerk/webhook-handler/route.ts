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

// List of all Clerk events to handle
const HANDLED_EVENTS = [
  'user.created', 'user.updated', 'user.deleted',
  'organization.created', 'organization.updated', 'organization.deleted',
  'organizationMembership.created', 'organizationMembership.updated', 'organizationMembership.deleted',
  'organizationInvitation.created', 'organizationInvitation.accepted', 'organizationInvitation.revoked',
  'email.created',
  'session.created', 'session.ended', 'session.pending', 'session.removed', 'session.revoked',
  'permission.created', 'permission.updated', 'permission.deleted',
  'role.created', 'role.updated', 'role.deleted',
  'organizationDomain.created', 'organizationDomain.updated', 'organizationDomain.deleted'
];

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

export async function POST(req: NextRequest) {
  // Check rate limit first
  const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
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

  // Parse and verify event
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());
  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const event = webhook.verify(payload, headers) as WebhookPayload;
  if (!HANDLED_EVENTS.includes(event.type)) {
    return NextResponse.json({ ok: true, ignored: true, reason: 'Event not handled' });
  }

  // Handle each event type
  switch (event.type) {
    // User Events
    case 'user.created':
    case 'user.updated': {
      const user = event.data as UserWebhookData;
      if (user.public_metadata?.onboardingComplete) {
        // Sync to DB or perform any additional logic as needed
      }
      // Get organization context from membership or metadata
      const orgMembership = user.organization_memberships?.[0];
      const organizationId = user.public_metadata?.organizationId || 
                            orgMembership?.organization?.id || '';
      if (!organizationId) {
        console.warn(`⚠️ Skipping ${event.type} for ${user.id}: organizationId missing in webhook payload.`);
        break;
      }
      // Determine role from membership or default to USER
      const role = orgMembership?.role as UserRole || UserRole.USER;
      const permissions = ROLE_PERMISSIONS[role] || [];
      await DatabaseQueries.upsertUser({
        clerkId: user.id,
        organizationId,
        email: user.email_addresses?.[0]?.email_address || '',
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        profileImage: user.profile_image_url,
        isActive: true,
        onboardingComplete: user.public_metadata?.onboardingComplete || false,
      });
      console.log(`✅ User ${event.type}: ${user.id} in org: ${organizationId}`);
      break;
    }
    
    case 'user.deleted': {
      const user = event.data as UserWebhookData;
      // Look up last known organization for this user
      const dbUser = await DatabaseQueries.getUserByClerkId(user.id);
      if (dbUser && dbUser.organizationId) {
        await DatabaseQueries.upsertUser({
          clerkId: user.id,
          organizationId: dbUser.organizationId,
          email: user.email_addresses?.[0]?.email_address || '',
          isActive: false,
          onboardingComplete: dbUser.onboardingComplete || false
        });
        console.log(`✅ User deactivated: ${user.id}`);
      } else {
        console.warn(`⚠️ Skipping user.deleted for ${user.id}: organizationId not found in DB.`);
      }
      break;
    }

    // Organization Events
    case 'organization.created':
    case 'organization.updated':
    case 'organization.deleted': {
      const orgData = event.data as OrganizationWebhookData;
      
      await DatabaseQueries.upsertOrganization({
        clerkId: orgData.id,
        name: orgData.name,
        slug: orgData.slug || generateSlug(orgData.name)
        // metadata: orgData.public_metadata // removed, not a valid property
      });
      
      console.log(`✅ Organization ${event.type}: ${orgData.id} (${orgData.name})`);
      break;
    }

    // Organization Membership Events
    case 'organizationMembership.created':
    case 'organizationMembership.updated':
    case 'organizationMembership.deleted': {
      const membershipData = event.data as OrganizationMembershipWebhookData;
      
      // Extract user ID from either user_id or public_user_data
      const userId = membershipData.user_id || membershipData.public_user_data?.user_id;
      
      if (!userId) {
        console.error(`❌ No user ID found in membership data for organization: ${membershipData.organization.id}`);
        break;
      }
      
      // Try to get existing user data first for email
      const existingUser = await DatabaseQueries.getUserByClerkId(userId);
      
      // Extract user information from public_user_data if available
      const firstName = membershipData.public_user_data?.first_name;
      const lastName = membershipData.public_user_data?.last_name;
      const profileImage = membershipData.public_user_data?.profile_image_url;
      
      await DatabaseQueries.upsertUser({
        clerkId: userId,
        organizationId: membershipData.organization.id,
        email: existingUser?.email || `user-${userId}@placeholder.com`, // Use existing email or placeholder
        firstName: firstName || existingUser?.firstName,
        lastName: lastName || existingUser?.lastName,
        profileImage: profileImage || existingUser?.profileImage,
        isActive: true,
        onboardingComplete: existingUser?.onboardingComplete || false
      });
      console.log(`✅ Organization membership ${event.type}: ${userId} in org: ${membershipData.organization.id}`);
      break;
    }

    // Session Events
    case 'session.created':
    case 'session.ended':
    case 'session.pending':
    case 'session.removed':
    case 'session.revoked': {
      const session = event.data;
      console.log(`✅ Session event ${event.type}: ${session?.id}`);
      break;
    }

    default: {
      // Log and acknowledge unhandled event types
      console.warn(`⚠️ Unhandled webhook event type: ${event.type}`);
      // Optionally, return 200 OK for unhandled events to avoid retries
      break;
    }
  }
  return NextResponse.json({ ok: true });
} // <-- Add this to close the POST function

function generateSlug(name?: string): string {
  if (!name || typeof name !== 'string') return 'org';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

