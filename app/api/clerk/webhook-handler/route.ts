import { authCache } from "@/lib/cache/auth-cache";
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db, DatabaseQueries, handleDatabaseError } from '@/lib/database/db';
import type {
  WebhookEventType,
  UserWebhookPayload,
  OrganizationWebhookPayload,
  OrganizationMembershipWebhookPayload,
} from '@/types/webhooks';


const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!CLERK_WEBHOOK_SECRET) {
  throw new Error('CLERK_WEBHOOK_SECRET is not set in environment variables');
}

// Helper functions to extract IDs for logging
function extractOrganizationId(data: any, eventType: WebhookEventType): string | null {
  switch (eventType) {
    case 'organization.created':
    case 'organization.updated':
    case 'organization.deleted':
      return data.id || null;
    case 'organizationMembership.created':
    case 'organizationMembership.updated':
    case 'organizationMembership.deleted':
      return data.organization?.id || null;
    case 'user.created':
    case 'user.updated':
      return data.organization_memberships?.[0]?.organization?.id || null;
    default:
      return null;
  }
}

function extractUserId(data: any, eventType: WebhookEventType): string | null {
  switch (eventType) {
    case 'user.created':
    case 'user.updated':
    case 'user.deleted':
      return data.id || null;
    case 'organizationMembership.created':
    case 'organizationMembership.updated':
    case 'organizationMembership.deleted':
      return data.public_user_data?.user_id || null;
    default:
      return null;
  }
}

async function processWebhookEvent(eventType: WebhookEventType, data: any): Promise<void> {
  // Use extractOrganizationId and extractUserId to get relevant IDs
  const organizationId = extractOrganizationId(data, eventType);
  const userId = extractUserId(data, eventType);

  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const userData = data as UserWebhookPayload;
      const email =
        userData.email_addresses?.[0]?.email_address ||
        userData.emailAddresses?.[0]?.emailAddress;
      if (!email) throw new Error('Missing user email');
      const orgMembership = userData.organization_memberships?.[0];
      let orgId = extractOrganizationId(data, eventType) || orgMembership?.organization?.id;
      // If no orgId, skip upsert and log
      if (!orgId || orgId.startsWith('org_pending_')) {
        console.warn(`No valid organization for user ${userData.id}, skipping user upsert.`);
        return;
      }
      await DatabaseQueries.upsertUser({
        clerkId: userData.id,
        organizationId: orgId,
        email,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        profileImage: userData.profile_image_url || null,
        isActive: userData.public_metadata?.isActive ?? true,
        onboardingComplete: userData.public_metadata?.onboardingComplete ?? false,
        lastLogin: undefined,
      });
      authCache.invalidateUser(userData.id);
      break;
    }
    case 'user.deleted': {
      const userData = data as UserWebhookPayload;
      await DatabaseQueries.deleteUser(userId || userData.id);
      authCache.invalidateUser(userId || userData.id);
      break;
    }
    case 'organization.created':
    case 'organization.updated': {
      const orgData = data as OrganizationWebhookPayload;
      await DatabaseQueries.upsertOrganization({
        clerkId: organizationId || orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        dotNumber: orgData.public_metadata?.dotNumber || null,
        mcNumber: orgData.public_metadata?.mcNumber || null,
        address: orgData.public_metadata?.address || null,
        city: orgData.public_metadata?.city || null,
        state: orgData.public_metadata?.state || null,
        zip: orgData.public_metadata?.zip || null,
        phone: orgData.public_metadata?.phone || null,
        email: orgData.public_metadata?.billingEmail || null,
        logoUrl: orgData.public_metadata?.logoUrl || null,
        maxUsers: orgData.public_metadata?.maxUsers,
        billingEmail: orgData.public_metadata?.billingEmail || null,
        isActive: orgData.public_metadata?.isActive ?? true,
      });
      authCache.invalidateOrganization(organizationId || orgData.id);
      break;
    }
    case 'organization.deleted': {
      const orgData = data as OrganizationWebhookPayload;
      await DatabaseQueries.deleteOrganization(organizationId || orgData.id);
      authCache.invalidateOrganization(organizationId || orgData.id);
      break;
    }
    case 'organizationMembership.created':
    case 'organizationMembership.updated': {
      const membershipData = data as OrganizationMembershipWebhookPayload;
      const userIdFinal = userId || membershipData.public_user_data.user_id;
      const orgIdFinal = organizationId || membershipData.organization.id;
      await DatabaseQueries.upsertUser({
        clerkId: userIdFinal,
        organizationId: orgIdFinal,
        email: membershipData.public_user_data.email || null,
        isActive: true,
        onboardingComplete: true,
      });
      authCache.invalidateUser(userIdFinal);
      break;
    }
    case 'organizationMembership.deleted': {
      const membershipData = data as OrganizationMembershipWebhookPayload;
      const userIdFinal = userId || membershipData.public_user_data.user_id;
      await DatabaseQueries.deleteUser(userIdFinal);
      authCache.invalidateUser(userIdFinal);
      break;
    }
    default:
      break;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const svix = new Webhook(CLERK_WEBHOOK_SECRET!);
  const payload = await req.text();
  const headerPayload = Object.fromEntries((await headers()).entries());

  let event: any;
  let eventId: string | null = null; 
  let eventType: WebhookEventType = 'user.created';
  let logId: string | null = null;
  let result: { success: boolean; error: string | null } = { success: true, error: null };

  try {
    event = svix.verify(payload, headerPayload);
    eventId = event.id || event.data?.id || event.data?.user_id || null;
    eventType = event.type;
    // Use extractOrganizationId and extractUserId for logging
    logId = `org:${extractOrganizationId(event.data, eventType)}|user:${extractUserId(event.data, eventType)}`;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Validate eventId
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    console.error('Missing or invalid eventId in webhook payload.');
    return NextResponse.json({ error: 'Missing or invalid eventId in webhook payload.' }, { status: 400 });
  }

  // Check for duplicate events using Prisma's unique constraint and upsert pattern
  try {
    const existingEvent = await db.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existingEvent && existingEvent.status === 'processed') {
      console.log(`Duplicate webhook event ignored: ${eventId}`);
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
    }
  } catch (err) {
    console.error('Failed to check for duplicate event:', err);
  }

  // Validate required fields for user events
  if ((eventType === 'user.created' || eventType === 'user.updated') &&
      !(
        event.data?.email_addresses?.[0]?.email_address ||
        event.data?.emailAddresses?.[0]?.emailAddress
      )) {
    return NextResponse.json({ error: 'Missing user email in webhook payload.' }, { status: 400 });
  }

  try {
    await processWebhookEvent(eventType, event.data);
  } catch (error) {
    result = { success: false, error: (error as Error).message || null };
  }

  // Always log the event in webhook_events
  try {
    await db.webhookEvent.upsert({
      where: { eventId },
      update: {
        status: result.success ? 'processed' : 'failed',
        processedAt: new Date(),
        processingError: result.success ? null : result.error,
      },
      create: {
        eventId,
        eventType,
        organizationId: extractOrganizationId(event.data, eventType),
        userId: extractUserId(event.data, eventType),
        payload: event,
        status: result.success ? 'processed' : 'failed',
        processedAt: new Date(),
        processingError: result.success ? null : result.error,
      },
    });
  } catch (err) {
    console.error('Failed to log webhook event:', err);
  }
  const processingTime = Date.now() - startTime;
  console.log(`Webhook processed: ${eventType} in ${processingTime}ms`, {
    eventId,
    logId,
    success: result.success,
    processingTime,
  });

  if (!result.success) {
    console.error(`Webhook processing failed for ${eventId}:`, result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}