'use server';

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db, DatabaseQueries } from '@/lib/database/db';
import { authCache } from '@/lib/cache/auth-cache';
import type { WebhookEventType, UserWebhookPayload, OrganizationWebhookPayload, OrganizationMembershipWebhookPayload } from '@/types/webhooks';

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
if (!CLERK_WEBHOOK_SECRET) throw new Error('CLERK_WEBHOOK_SECRET is not set');

// --- Utility: Extractors ---
function getOrgId(data: any, type: WebhookEventType): string | null {
  if (['organization.created', 'organization.updated', 'organization.deleted'].includes(type)) return data.id || null;
  if (['organizationMembership.created', 'organizationMembership.updated', 'organizationMembership.deleted'].includes(type)) return data.organization?.id || null;
  if (['user.created', 'user.updated'].includes(type)) return data.organization_memberships?.[0]?.organization?.id || null;
  return null;
}
function getUserId(data: any, type: WebhookEventType): string | null {
  if (['user.created', 'user.updated', 'user.deleted'].includes(type)) return data.id || null;
  if (['organizationMembership.created', 'organizationMembership.updated', 'organizationMembership.deleted'].includes(type)) return data.public_user_data?.user_id || null;
  return null;
}
function getUserEmail(data: any, type: WebhookEventType): string | null {
  if (['user.created', 'user.updated', 'user.deleted'].includes(type)) return data?.email_addresses?.[0]?.email_address || null;
  if (['organizationMembership.created', 'organizationMembership.updated', 'organizationMembership.deleted'].includes(type)) return data?.public_user_data?.identifier || null;
  return null;
}

// --- Main Event Processor ---
async function handleClerkEvent(eventType: WebhookEventType, data: any) {
  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const user: UserWebhookPayload = data;
      const email = getUserEmail(user, eventType);
      if (!email) throw new Error('Missing user email');
      // Use first org if present, else empty string
      const orgId = user.organization_memberships?.[0]?.organization?.id || '';
      await DatabaseQueries.upsertUser({
        clerkId: user.id,
        organizationId: orgId,
        email,
        firstName: user.first_name || null,
        lastName: user.last_name || null,
        profileImage: user.profile_image_url || null,
        isActive: user.public_metadata?.isActive ?? true,
        onboardingComplete: user.public_metadata?.onboardingComplete ?? false,
        lastLogin: undefined,
      });
      authCache.invalidateUser(user.id);
      break;
    }
    case 'user.deleted': {
      const user: UserWebhookPayload = data;
      console.log('[Webhook] user.deleted event received:', { clerkId: user.id });
      const result = await DatabaseQueries.deleteUser(user.id);
      console.log('[Webhook] user.deleted DB result:', result);
      authCache.invalidateUser(user.id);
      break;
    }
    case 'organization.created':
    case 'organization.updated': {
      const org: OrganizationWebhookPayload = data;
      await DatabaseQueries.upsertOrganization({
        clerkId: org.id,
        name: org.name,
        slug: org.slug,
        dotNumber: org.public_metadata?.dotNumber || null,
        mcNumber: org.public_metadata?.mcNumber || null,
        address: org.public_metadata?.address || null,
        city: org.public_metadata?.city || null,
        state: org.public_metadata?.state || null,
        zip: org.public_metadata?.zip || null,
        phone: org.public_metadata?.phone || null,
        email: org.public_metadata?.billingEmail || null,
        logoUrl: org.logo_url || org.public_metadata?.logoUrl || null,
        maxUsers: org.max_allowed_memberships || org.public_metadata?.maxUsers,
        billingEmail: org.public_metadata?.billingEmail || null,
        isActive: org.public_metadata?.isActive ?? true,
      });
      authCache.invalidateOrganization(org.id);
      break;
    }
    case 'organization.deleted': {
      const org: OrganizationWebhookPayload = data;
      console.log('[Webhook] organization.deleted event received:', { clerkId: org.id });
      const result = await DatabaseQueries.deleteOrganization(org.id);
      console.log('[Webhook] organization.deleted DB result:', result);
      authCache.invalidateOrganization(org.id);
      break;
    }
    case 'organizationMembership.created':
    case 'organizationMembership.updated': {
      const membership: OrganizationMembershipWebhookPayload = data;
      const userId = membership.public_user_data?.user_id;
      const orgId = membership.organization?.id;
      const email = getUserEmail(membership, eventType);
      if (!userId || !orgId || !email) throw new Error('Membership event missing user/org/email');
      // Upsert user (ensure user exists)
      await DatabaseQueries.upsertUser({
        clerkId: userId,
        organizationId: orgId,
        email,
        firstName: membership.public_user_data?.first_name || null,
        lastName: membership.public_user_data?.last_name || null,
        profileImage: membership.public_user_data?.profile_image_url || null,
        isActive: true,
        onboardingComplete: true,
      });
      // Upsert organization membership (join table)
      await DatabaseQueries.upsertOrganizationMembership({
        organizationClerkId: orgId,
        userClerkId: userId,
        role: membership.role,
        createdAt: membership.created_at ? new Date(membership.created_at) : undefined,
        updatedAt: membership.updated_at ? new Date(membership.updated_at) : undefined,
      });
      authCache.invalidateUser(userId);
      break;
    }
    case 'organizationMembership.deleted': {
      const membership: OrganizationMembershipWebhookPayload = data;
      const userId = membership.public_user_data?.user_id;
      const orgId = membership.organization?.id;
      if (userId && orgId) {
        // Remove organization membership (do NOT delete user)
        await DatabaseQueries.deleteOrganizationMembership({
          organizationClerkId: orgId,
          userClerkId: userId,
        });
        authCache.invalidateUser(userId);
      }
      break;
    }
    default:
      // Ignore unhandled events
      break;
  }
}

export async function POST(req: Request) {
  const start = Date.now();
  const svix = new Webhook(CLERK_WEBHOOK_SECRET!);
  const payload = await req.text();
  const headerPayload = Object.fromEntries((await headers()).entries());

  let event: any;
  let eventId: string | null = null;
  let eventType: WebhookEventType = 'user.created';
  let result: { success: boolean; error: string | null } = { success: true, error: null };

  // --- Verify signature ---
  try {
    event = svix.verify(payload, headerPayload);
    eventId = event.id || event.data?.id || event.data?.user_id || null;
    eventType = event.type;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // --- Deduplication ---
  if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
    return NextResponse.json({ error: 'Missing or invalid eventId' }, { status: 400 });
  }
  try {
    const existing = await db.webhookEvent.findUnique({ where: { eventId } });
    if (existing && existing.status === 'processed') {
      return NextResponse.json({ message: 'Event already processed' }, { status: 200 });
    }
  } catch {}

  // --- Validate required fields ---
  if ((eventType === 'user.created' || eventType === 'user.updated') && !getUserEmail(event.data, eventType)) {
    return NextResponse.json({ error: 'Missing user email' }, { status: 400 });
  }

  // --- Process event ---
  try {
    await handleClerkEvent(eventType, event.data);
  } catch (error) {
    result = { success: false, error: (error as Error).message || null };
  }

  // --- Log event ---
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
        organizationId: getOrgId(event.data, eventType),
        userId: getUserId(event.data, eventType),
        payload: event,
        status: result.success ? 'processed' : 'failed',
        processedAt: new Date(),
        processingError: result.success ? null : result.error,
      },
    });
  } catch {}

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}