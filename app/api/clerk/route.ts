import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/db';
import { companies, companyUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = ( await headerPayload ).get('svix-id');
  const svix_timestamp = ( await headerPayload ).get('svix-timestamp');
  const svix_signature = ( await headerPayload ).get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'organization.created') {
    // Create a new company when an organization is created
    const { id, name, slug } = evt.data;

    try {
      await db.insert(companies).values({
        name: name,
        clerkOrgId: id,
      });
    } catch (err) {
      console.error('Error creating company:', err);
      return new Response('Error creating company', { status: 500 });
    }
  } else if (eventType === 'organizationMembership.created') {
    // Add user to company when they are added to an organization
    const { organization, public_user_data } = evt.data;
    
    try {
      // Find the company with the clerk org id
      const company = await db.query.companies.findFirst({
        where: eq(companies.clerkOrgId, organization.id),
      });

      if (!company) {
        console.error('Company not found for organization:', organization.id);
        return new Response('Company not found', { status: 404 });
      }

      // Add the user to the company
      await db.insert(companyUsers).values({
        userId: public_user_data.user_id,
        companyId: company.id,
        role: 'viewer', // Default role for new members
      });
    } catch (err) {
      console.error('Error adding user to company:', err);
      return new Response('Error adding user to company', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}
