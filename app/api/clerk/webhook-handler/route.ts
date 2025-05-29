import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import { db, DatabaseQueries, handleDatabaseError } from '@/lib/database';
import { authCache } from '@/lib/cache/auth-cache';
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

// Webhook processing with retry mechanism
async function processWebhookWithRetry(
  eventType: WebhookEventType,
  eventData: any,
  logId: string | null,
  maxRetries = 3
): Promise<{ success: boolean; error?: string }> {
  let attempts = 0;
  let lastError: string | null = null;

  while (attempts < maxRetries) {
    try {
      await processWebhookEvent(eventType, eventData);
      return { success: true };
    } catch (error: any) {
      attempts++;
      lastError = error?.message || 'Unknown error';
      
      console.error(`Webhook processing attempt ${attempts} failed:`, {
        eventType,
        eventId: eventData.id,
        error: lastError,
      });

      // Update log with retry info
      if (logId) {
        await db.webhookEvent.update({
          where: { id: logId },
          data: { 
            retryCount: attempts,
            processingError: `Attempt ${attempts}: ${lastError}`,
          },
        }).catch(console.error);
      }

      // Don't retry for certain types of errors
      if (error?.code === 'P2002' && attempts === 1) {
        // Unique constraint on first attempt might be race condition
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }
      
      if (attempts < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
      }
    }
  }

  return { success: false, error: lastError || 'Max retries exceeded' };
}

async function processWebhookEvent(eventType: WebhookEventType, data: any): Promise<void> {
  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const userData = data as UserWebhookPayload;
      const email = userData.email_addresses?.[0]?.email_address;
      if (!email) throw new Error('Missing user email');
      const orgMembership = userData.organization_memberships?.[0];
      const orgId = orgMembership?.organization?.id;
      // Only upsert user if orgId is present
      if (orgId) {
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
        // Invalidate cache for user changes
        authCache.invalidateUser(userData.id);
      } else {
        // No org assigned yet, skip DB user creation for now
        console.log(`User ${userData.id} created without organization. Skipping DB user creation until org assignment.`);
      }
      break;
    }
    case 'user.deleted': {
      const userData = data as UserWebhookPayload;
      await DatabaseQueries.deleteUser(userData.id);
      authCache.invalidateUser(userData.id);
      break;
    }
    case 'organization.created':
    case 'organization.updated': {
      const orgData = data as OrganizationWebhookPayload;
      await DatabaseQueries.upsertOrganization({
        clerkId: orgData.id,
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
      
      // Invalidate cache for organization changes
      authCache.invalidateOrganization(orgData.id);
      break;
    }
    case 'organization.deleted': {
      const orgData = data as OrganizationWebhookPayload;
      await DatabaseQueries.deleteOrganization(orgData.id);
      authCache.invalidateOrganization(orgData.id);
      break;
    }
    case 'organizationMembership.created':
    case 'organizationMembership.updated': {
      const membershipData = data as OrganizationMembershipWebhookPayload;
      
      // Update user's role and organization association
      // since organization membership is handled through the User model
      const userData = {
        clerkId: membershipData.public_user_data.user_id,
        organizationId: membershipData.organization.id,
        email: '', // Will be populated by upsertUser if needed
        role: membershipData.role,
        isActive: true,
        onboardingComplete: true,
      };
      
      try {
        // Get the user's email from Clerk
        const user = await (await clerkClient()).users.getUser(membershipData.public_user_data.user_id);
        userData.email = user.emailAddresses[0]?.emailAddress || '';
        
        await DatabaseQueries.upsertUser(userData);
        
        // Invalidate user cache since membership changed
        authCache.invalidateUser(membershipData.public_user_data.user_id);
      } catch (error) {
        console.error('Error processing organization membership webhook:', error);
        throw error;
      }
      break;
    }
    case 'organizationMembership.deleted': {
      const membershipData = data as OrganizationMembershipWebhookPayload;
      
      // Remove user or deactivate them
      await DatabaseQueries.deleteUser(membershipData.public_user_data.user_id);
      authCache.invalidateUser(membershipData.public_user_data.user_id);
      break;
    }
    default:
      // Ignore unhandled events
      break;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const svix = new Webhook(CLERK_WEBHOOK_SECRET!);
  const payload = await req.text();
  const headerPayload = Object.fromEntries((await headers()).entries());

  let event: any;
  let eventId = '';
  let eventType: WebhookEventType = 'user.created';
  let logId: string | null = null;

  try {
    event = svix.verify(payload, headerPayload);
    eventId = event.id || '';
    eventType = event.type;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Check for duplicate events
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

  // Log the event as pending
  try {
    const log = await db.webhookEvent.create({
      data: {
        eventType,
        eventId,
        organizationId: extractOrganizationId(event.data, eventType),
        userId: extractUserId(event.data, eventType),
        payload: JSON.parse(payload),
        status: 'pending',
      },
    });
    logId = log.id;
  } catch (err) {
    // Continue, but log error
    console.error('Failed to log webhook event:', err);
  }

  // Process webhook with retry mechanism
  const result = await processWebhookWithRetry(eventType, event.data, logId);
  const processingTime = Date.now() - startTime;

  // Update log with final status
  if (logId) {
    try {
      await db.webhookEvent.update({
        where: { id: logId },
        data: {
          status: result.success ? 'processed' : 'failed',
          processingError: result.error || null,
          processedAt: new Date(),
        },
      });
    } catch (err) {
      console.error('Failed to update webhook log:', err);
    }
  }

  // Log performance metrics
  console.log(`Webhook processed: ${eventType} in ${processingTime}ms`, {
    eventId,
    success: result.success,
    processingTime,
  });

  if (!result.success) {
    console.error(`Webhook processing failed for ${eventId}:`, result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
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
