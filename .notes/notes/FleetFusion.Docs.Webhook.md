---
id: mdi1td5jzpbn01js5vo6m4r
title: Webhook
desc: ''
updated: 1748447195771
created: 1748313707885
---

# Webhook Handler for Clerk Authentication

Based on analyzing the authentication and onboarding implementations in your codebase, here's what
the webhook handler should do and contain:

## Purpose of the Webhook Handler

The webhook handler (route.ts) serves as the **synchronization bridge** between Clerk's
authentication system and your Neon PostgreSQL database. It ensures data consistency across your
multi-tenant ABAC system.

## Key Responsibilities

### 1. **User Lifecycle Management**

- **user.created**: Create user record in database with initial metadata
- **user.updated**: Sync profile changes (name, email, metadata updates)
- **user.deleted**: Soft delete or deactivate user records

### 2. **Organization Management**

- **organization.created**: Create organization records during onboarding
- **organization.updated**: Sync organization metadata changes
- **organization.deleted**: Handle organization cleanup

### 3. **Membership & Role Management**

- **organizationMembership.created**: Track user-organization relationships
- **organizationMembership.updated**: Handle role changes within organizations
- **organizationMembership.deleted**: Remove user access when they leave

### 4. **Onboarding Flow Support**

The webhook handler is crucial for the onboarding process because:

```typescript
// From onboarding.ts - Server action creates organization immediately
await client.organizations.createOrganization({
  name: data.orgName,
  slug: data.orgSlug,
  createdBy: data.userId
})

// Webhook receives organization.created event and syncs to database
case 'organization.created': {
  await DatabaseQueries.upsertOrganization({
    clerkId: data.id,
    name: data.name,
    slug: data.slug || generateSlug(data.name)
  });
}
```

## What the Route Should Contain

### 1. **Webhook Verification**

```typescript
import { Webhook } from 'svix';

async function verifyWebhook(request: NextRequest): Promise<WebhookPayload | null> {
  const body = await request.text();
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  return wh.verify(body, {
    'svix-id': svix_id!,
    'svix-timestamp': svix_timestamp!,
    'svix-signature': svix_signature!,
  }) as WebhookPayload;
}
```

### 2. **Complete Event Handling**

Based on your types, handle these events:

```typescript
switch (type) {
  // Core user events
  case 'user.created':
  case 'user.updated':
  case 'user.deleted':

  // Organization management
  case 'organization.created':
  case 'organization.updated':
  case 'organization.deleted':

  // Membership management (critical for ABAC)
  case 'organizationMembership.created':
  case 'organizationMembership.updated':
  case 'organizationMembership.deleted':

  // Session tracking (optional but useful)
  case 'session.created':
  case 'session.ended':

  // Email verification
  case 'email.created':
}
```

### 3. **Onboarding Metadata Sync**

Handle the specific metadata structure from your JWT claims:

```typescript
case 'user.updated': {
  const metadata = data.public_metadata as ClerkUserMetadata

  await DatabaseQueries.upsertUser({
    clerkId: data.id,
    organizationId: metadata.organizationId,
    role: metadata.role || UserRole.USER,
    permissions: metadata.permissions || [],
    isActive: metadata.isActive !== false,
    onboardingCompleted: metadata.onboardingComplete || false,
    // ... other fields
  })
}
```

### 4. **Database Operations**

Your `DatabaseQueries` class should support:

- `upsertUser()` - Create/update user records
- `upsertOrganization()` - Create/update organization records
- `upsertOrganizationMembership()` - Track user-org relationships
- `deleteUser()`, `deleteOrganization()` - Cleanup operations

### 5. **Error Handling & Logging**

```typescript
try {
  // Process webhook
  return NextResponse.json({ success: true });
} catch (error) {
  console.error('Webhook processing failed:', error);

  // Return 200 to prevent Clerk retries for data errors
  // Return 500 only for temporary failures
  return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
}
```

### 6. **Security & Rate Limiting**

```typescript
// Rate limiting (you have this)
const webhookRateLimit = ratelimit({
  interval: '1m',
  limit: 60,
});

// IP-based limiting
const identifier = request.headers.get('x-forwarded-for') || 'anonymous';
const rateLimit = await webhookRateLimit(identifier);
```

## Critical Integration Points

### With Middleware

Your middleware checks `onboardingComplete` from JWT claims:

```typescript
if (!userMetadata?.onboardingComplete) {
  return NextResponse.redirect(new URL('/onboarding', req.url));
}
```

The webhook must sync this flag when users complete onboarding.

### With Onboarding Flow

The `setClerkMetadata` server action immediately updates Clerk, then webhooks ensure database
consistency:

1. User submits onboarding form
2. Server action updates Clerk metadata
3. Webhook syncs changes to database
4. Middleware allows access to protected routes

### With ABAC System

Webhooks maintain the permission system by syncing:

- User roles from organization memberships
- Permission arrays based on roles
- Organization context for tenant isolation

## Conclusion

The webhook handler is the **backbone** of your auth system - it ensures your database stays
synchronized with Clerk's authentication state, enabling proper ABAC enforcement and seamless user
experience.

## Clerk Webhook Subscribed Event

email.created organization.created organization.deleted organization.updated
organizationDomain.created organizationDomain.deleted organizationDomain.updated
organizationInvitation.accepted organizationInvitation.created organizationInvitation.revoked
organizationMembership.created organizationMembership.deleted organizationMembership.updated
permission.created permission.deleted permission.updated role.created role.deleted role.updated
session.created session.ended session.pending session.removed session.revoked user.created
user.deleted user.updated

## Clerk Custom Claims and JWT

#### session claims

{ "org.id": "{{org.id}}", "user.id": "{{user.id}}", "org.name": "{{org.name}}", "org.role":
"{{org.role}}", "publicMetadata": { "onboardingComplete":
"{{user.public_metadata.onboardingComplete}}" }, "user.organizations": "{{user.organizations}}",
"org_membership.permissions": "{{org_membership.permissions}}" }

#### jwt values

{ "org.id": "{{org.id}}", "user.id": "{{user.id}}", "org.name": "{{org.name}}", "org.role":
"{{org.role}}", "publicMetadata": { "onboardingComplete":
"{{user.public_metadata.onboardingComplete}}" }, "user.organizations": "{{user.organizations}}",
"org_membership.permissions": "{{org_membership.permissions}}" }
