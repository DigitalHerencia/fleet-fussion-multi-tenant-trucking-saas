---
id: urluip2n30guj1dvh7wjyte
title: RelevantFiles
desc: ''
updated: 1748448293618
created: 1748313676004
---

# ABAC Multi-Tenant Architecture: Clerk Onboarding and Neon Integration

---

Here is all the code in your workspace relevant to the Clerk webhook handler, event types,
onboarding, ABAC, JWT claims, and database sync:

---

**1. Webhook Handler Implementation**

- `app/api/clerk/webhook-handler/route.ts`
  - Contains the main webhook handler, event switch, verification with Svix, rate limiting, and all
    event processing logic.
  - Handles Clerk data sync and ABAC fields.
  - Subscribed Events: `user.created`, `user.updated`, `user.deleted`, `organization.created`,
    `organization.updated`, `organization.deleted`, `organizationMembership.created`,
    `organizationMembership.updated`, `organizationMembership.deleted`, and more.
  - Uses `DatabaseQueries` for upsert/delete operations.
  - Verifies webhooks using Svix and `CLERK_WEBHOOK_SECRET`.

**2. Webhook Event Types and Payloads**

- `types/webhooks.ts`

  - Defines all webhook event types, payload structures for user/org/membership, and verification
    result types.
  - Types: `WebhookEventType`, `UserWebhookData`, `OrganizationWebhookData`,
    `OrganizationMembershipWebhookData`, etc.

- `types/auth.ts`
  - Defines `ClerkUserMetadata`, `ClerkOrganizationMetadata`, `UserRole`, `ROLE_PERMISSIONS`, and
    JWT claim structure.
  - Includes onboarding and ABAC-related fields.

**3. Database Synchronization Logic**

- `lib/database/index.ts`

  - `DatabaseQueries` class with:
    - `upsertUser`
    - `upsertOrganization`
    - `deleteUser`
    - `deleteOrganization`
    - (No explicit `upsertOrganizationMembership`, but membership is handled via user/org upserts.)
  - All methods used by the webhook handler for syncing Clerk data to Neon PostgreSQL.

- `lib/database/schema.ts`
  - Schema for `users` and `organizations` tables, including ABAC fields, onboarding, and metadata.

**4. Onboarding and Metadata Sync**

- `lib/actions/onboarding.ts`

  - `setClerkMetadata` server action: updates Clerk metadata and creates org/user records for
    instant UX, webhooks ensure DB consistency.
  - Handles onboarding flow, sets `onboardingComplete`, and triggers Clerk org creation.

- `app/(auth)/onboarding/page.tsx`
  - Client onboarding flow, calls `setClerkMetadata`, and updates Clerk metadata.

**5. Validation and Types**

- `validations/auth.ts`
  - Zod schemas for webhook payloads, onboarding, and metadata.

**6. Documentation and Developer Notes**

- `doc/Developer-Documentation.md`
  - Explains Clerk integration, onboarding, ABAC, JWT claims, and webhook responsibilities.

---

**Key Code Excerpts Directly Supporting the Notes File:**

- **Webhook Verification with Svix:**  
  `app/api/clerk/webhook-handler/route.ts` (see `verifyWebhook` function)
- **Event Switch Handling:**  
  `app/api/clerk/webhook-handler/route.ts` (see `switch (type) { ... }`)
- **Onboarding Metadata Sync:**  
  `lib/actions/onboarding.ts`, `app/(auth)/onboarding/page.tsx`
- **Database Upserts:**  
  `lib/database/index.ts` (`DatabaseQueries`)
- **ABAC/JWT Claims:**  
  `types/auth.ts`, `types/webhooks.ts`
- **Rate Limiting:**  
  `app/api/clerk/webhook-handler/route.ts` (see `webhookRateLimit`)
- **Error Handling:**  
  `app/api/clerk/webhook-handler/route.ts` (try/catch, logging, response codes)
- **Event Types and Payloads:**  
  `types/webhooks.ts`, `types/auth.ts`
- **Clerk Custom Claims/JWT Structure:**  
  `types/auth.ts`, `doc/Developer-Documentation.md`

---

**Summary:**  
All the information in `.notes\notes\FleetFusion.Webhook.md` is directly supported by the code in
the above files. The webhook handler, event types, onboarding flow, ABAC/JWT claims, and database
sync logic are all implemented as described. The event types listed match Clerk's documentation and
your code's event switch. The onboarding and ABAC flows, as well as Clerk metadata and JWT claims,
are handled as described in both code and documentation.
