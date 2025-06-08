'use server';

import { Webhook } from 'svix';
import { NextRequest, NextResponse } from 'next/server';
import type {
  DeletedObjectJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
} from '@clerk/backend';

import { DatabaseQueries, db } from '@/lib/database/db';
// Clerk backend types

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET ?? '';
if (!CLERK_WEBHOOK_SECRET) {
  throw new Error('CLERK_WEBHOOK_SECRET is not set in environment variables.');
}

function getStringField(obj: any, key: string): string | null {
  const val = obj?.[key];
  if (typeof val === 'string') return val;
  return null;
}

function getBooleanField(obj: any, key: string): boolean {
  const val = obj?.[key];
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val === 'true';
  return false;
}

function safeJson(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}

async function handleClerkEvent(eventType: string, data: any) {
  switch (eventType) {
    case 'user.created':
    case 'user.updated': {
      const user = data as UserJSON;
      await DatabaseQueries.upsertUser({
        clerkId: user.id,
        email: user.email_addresses?.[0]?.email_address ?? null,
        firstName: user.first_name ?? null,
        lastName: user.last_name ?? null,
        profileImage: user.image_url ?? null,
        isActive: true,
        onboardingComplete: getBooleanField(user.public_metadata, 'onboardingComplete'),
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
        organizationId: Array.isArray(user.organization_memberships) && user.organization_memberships[0]?.organization?.id
          ? user.organization_memberships[0].organization.id
          : null,
      });
      break;
    }
    case 'user.deleted': {
      const user = data as DeletedObjectJSON;
      if (user.id) await DatabaseQueries.deleteUser(user.id);
      break;
    }
    case 'organization.created':
    case 'organization.updated': {
      const org = data as OrganizationJSON;
      const pm = org.public_metadata ?? {};
      await DatabaseQueries.upsertOrganization({
        clerkId: org.id,
        name: org.name,
        slug: org.slug,
        dotNumber: getStringField(pm, 'dotNumber'),
        mcNumber: getStringField(pm, 'mcNumber'),
        address: getStringField(pm, 'address'),
        city: getStringField(pm, 'city'),
        state: getStringField(pm, 'state'),
        zip: getStringField(pm, 'zip'),
        phone: getStringField(pm, 'phone'),
        email: getStringField(pm, 'email'),
        logoUrl: org.image_url ?? null,
        maxUsers: org.max_allowed_memberships ?? 5,
        billingEmail: getStringField(pm, 'billingEmail'),
        isActive: true,
      });
      break;
    }
    case 'organization.deleted': {
      const org = data as DeletedObjectJSON;
      if (org.id) await DatabaseQueries.deleteOrganization(org.id);
      break;
    }
    case 'organizationMembership.created':
    case 'organizationMembership.updated': {
      const membership = data as OrganizationMembershipJSON;
      const userId = membership.public_user_data?.user_id;
      const orgId = membership.organization?.id;
      if (userId && orgId) {
        await DatabaseQueries.upsertUser({
          clerkId: userId,
          organizationId: orgId,
          email: membership.public_user_data?.identifier ?? null,
          firstName: membership.public_user_data?.first_name ?? null,
          lastName: membership.public_user_data?.last_name ?? null,
          profileImage: membership.public_user_data?.image_url ?? null,
          isActive: true,
          onboardingComplete: true,
        });
        await DatabaseQueries.upsertOrganizationMembership({
          organizationClerkId: orgId,
          userClerkId: userId,
          role: membership.role,
          createdAt: new Date(membership.created_at),
          updatedAt: new Date(membership.updated_at),
        });
      }
      break;
    }
    case 'organizationMembership.deleted': {
      const membership = data as OrganizationMembershipJSON;
      const userId = membership.public_user_data?.user_id;
      const orgId = membership.organization?.id;
      if (userId && orgId) {
        await DatabaseQueries.deleteOrganizationMembership({
          organizationClerkId: orgId,
          userClerkId: userId,
        });
      }
      break;
    }
    default:
      console.log(`[Clerk Webhook] Unhandled event: ${eventType}`);
      break;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body and headers for Svix verification
    const payload = await req.text();
    const svixId = req.headers.get('svix-id') ?? '';
    const svixTimestamp = req.headers.get('svix-timestamp') ?? '';
    const svixSignature = req.headers.get('svix-signature') ?? '';
    console.log('[Clerk Webhook] Headers:', { svixId, svixTimestamp, svixSignature });
    // Verify signature
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    let evt: any;
    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('[Clerk Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`[Clerk Webhook] Processing event: ${eventType} (id: ${id})`);
    await handleClerkEvent(eventType, evt.data);
    // Log the event
    if (typeof id === 'string') {
      await db.webhookEvent.upsert({
        where: { eventId: id },
        update: { eventType, status: 'processed', processedAt: new Date(), payload: JSON.stringify(evt.data) },
        create: {
          eventId: id,
          eventType,
          status: 'processed',
          processedAt: new Date(),
          payload: JSON.stringify(evt.data),
        },
      });
    }
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('[Clerk Webhook] Handler error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 500 });
  }
}