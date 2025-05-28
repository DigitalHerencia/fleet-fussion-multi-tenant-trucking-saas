import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db, DatabaseQueries, handleDatabaseError } from '@/lib/database';
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

export async function POST(req: Request) {
  const svix = new Webhook(CLERK_WEBHOOK_SECRET!);
  const payload = await req.text();
  const headerPayload = Object.fromEntries( ( await headers() ).entries() );

  let event: any;
  let eventId = '';
  let eventType: WebhookEventType = 'user.created';
  let logId: string | null = null;

  try {
    event = svix.verify(payload, headerPayload);
    eventId = event.id || '';
    eventType = event.type;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Log the event as pending
  try {
    const log = await db.webhookEvent.create({
      data: {
        eventType,
        eventId,
        payload: JSON.parse(payload),
        status: 'pending',
      },
    });
    logId = log.id;
  } catch (err) {
    // Continue, but log error
    console.error('Failed to log webhook event:', err);
  }

  let status: 'processed' | 'failed' = 'processed';
  let processingError: string | null = null;

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        const data = event.data as UserWebhookPayload;
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) throw new Error('Missing user email');
        const orgMembership = data.organization_memberships?.[0];
        const orgId = orgMembership?.organization?.id;
        if (!orgId) throw new Error('Missing organization ID');
        await DatabaseQueries.upsertUser({
          clerkId: data.id,
          organizationId: orgId,
          email,
          firstName: data.first_name || null,
          lastName: data.last_name || null,
          profileImage: data.profile_image_url || null,
          isActive: data.public_metadata?.isActive ?? true,
          onboardingComplete: data.public_metadata?.onboardingComplete ?? false,
          lastLogin: undefined,
        });
        break;
      }
      case 'user.deleted': {
        const data = event.data as UserWebhookPayload;
        await DatabaseQueries.deleteUser(data.id);
        break;
      }
      case 'organization.created':
      case 'organization.updated': {
        const data = event.data as OrganizationWebhookPayload;
        await DatabaseQueries.upsertOrganization({
          clerkId: data.id,
          name: data.name,
          slug: data.slug,
          dotNumber: data.public_metadata?.dotNumber || null,
          mcNumber: data.public_metadata?.mcNumber || null,
          address: data.public_metadata?.address || null,
          city: data.public_metadata?.city || null,
          state: data.public_metadata?.state || null,
          zip: data.public_metadata?.zip || null,
          phone: data.public_metadata?.phone || null,
          email: data.public_metadata?.billingEmail || null,
          logoUrl: data.public_metadata?.logoUrl || null,
          maxUsers: data.public_metadata?.maxUsers,
          billingEmail: data.public_metadata?.billingEmail || null,
          isActive: data.public_metadata?.isActive ?? true,
        });
        break;
      }
      case 'organization.deleted': {
        const data = event.data as OrganizationWebhookPayload;
        await DatabaseQueries.deleteOrganization(data.id);
        break;
      }
      // Membership events can be handled here if needed
      case 'organizationMembership.created':
      case 'organizationMembership.updated': {
        const data = event.data as OrganizationMembershipWebhookPayload;
        // Upsert organization membership
        await DatabaseQueries.upsertOrganizationMembership({
          clerkId: data.id,
          organizationId: data.organization.id,
          userId: data.public_user_data.user_id,
          role: data.role,
          createdAt: data.created_at ? new Date(data.created_at) : undefined,
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        });
        break;
      }
      case 'organizationMembership.deleted': {
        const data = event.data as OrganizationMembershipWebhookPayload;
        // Delete organization membership
        await DatabaseQueries.deleteOrganizationMembership(data.id);
        break;
      }
      default:
        // Ignore unhandled events
        break;
    }
  } catch (err: any) {
    status = 'failed';
    processingError = err?.message || 'Unknown error';
    if (logId) {
      await db.webhookEvent.update({
        where: { id: logId },
        data: { status, processingError },
      });
    }
    handleDatabaseError(err);
    return NextResponse.json({ error: processingError }, { status: 500 });
  }

  // Update log as processed
  if (logId) {
    await db.webhookEvent.update({
      where: { id: logId },
      data: { status, processedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
