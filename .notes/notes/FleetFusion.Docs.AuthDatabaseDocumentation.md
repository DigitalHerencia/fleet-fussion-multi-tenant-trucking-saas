---
id: s72mf7gl21125h8b84qidw7
title: AuthDatabaseDocumentation
desc: ''
updated: 1748448731413
created: 1748418652771
---

# FleetFusion Authentication & Database Integration Documentation

This documentation describes a Next.js 15, React 19, Neon, and Clerk org-based multi-tenant architecture with robust, webhook-driven data consistency and ABAC security.

## Component Interaction Table (Optimized)

| **Component**                | **Type**             | **Clerk Interaction**                                                                                                                              | **Neon Database Operations**                                                                                                                   | **Data Flow**                                                                                                       | **Redirects/Navigation**                                                                                                                         | **Dependencies**                                                              | **Error Handling**                                                                            |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **middleware.ts**            | Route Protection     | - `clerkMiddleware()` wraps all requests<br/>- `auth()` extracts user/org session<br/>- Reads `sessionClaims` metadata<br/>- Validates org context | - No direct DB calls<br/>- Relies on Clerk metadata for org/user context                                                                       | **IN:** Next.js request → Clerk session<br/>**OUT:** User/org context headers, redirects                            | - `/sign-in` if not authenticated<br/>- `/onboarding` if incomplete<br/>- `/{orgId}/dashboard/{userId}` if complete<br/>- Block cross-org access | - Clerk session validity<br/>- Route matcher patterns<br/>- ABAC permissions  | - Fallback to sign-in<br/>- Org mismatch redirects<br/>- Permission-based access control      |
| **sign-up/page.tsx**         | Auth Component       | - `useSignUp()` hook<br/>- `signUp.create()`<br/>- `setActive()` on success                                                                        | - No direct DB interaction<br/>- User creation handled by webhook                                                                              | **IN:** User form data<br/>**PROCESS:** Clerk user creation<br/>**OUT:** Session activation                         | - Redirect to `/onboarding` on success<br/>- Stay on page for errors                                                                             | - Clerk SDK<br/>- CAPTCHA<br/>- Network connectivity                          | - Clerk error mapping<br/>- Password/email validation<br/>- Email verification handling       |
| **sign-in/page.tsx**         | Auth Component       | - `useSignIn()` hook<br/>- `signIn.create()`<br/>- Session validation                                                                              | - No direct DB interaction<br/>- User verification via Clerk                                                                                   | **IN:** User credentials<br/>**PROCESS:** Clerk authentication<br/>**OUT:** Active session                          | - Middleware handles post-auth routing<br/>- Fallback to `/dashboard`                                                                            | - Clerk SDK<br/>- CAPTCHA<br/>- Valid credentials                             | - Wrong password/email<br/>- Account verification<br/>- Session conflict handling             |
| **sign-out/page.tsx**        | Auth Component       | - `useClerk().signOut()`<br/>- Session termination<br/>- Cookie cleanup                                                                            | - No DB operations                                                                                                                             | **IN:** Sign out request<br/>**PROCESS:** Session destruction<br/>**OUT:** Redirect to home                         | - Immediate redirect to `/`                                                                                                                      | - Active Clerk session                                                        | - Error logging<br/>- Fallback home link                                                      |
| **forgot-password/page.tsx** | Auth Component       | - `useSignIn()` hook<br/>- `signIn.create()` with reset<br/>- Email code verification                                                              | - No DB operations                                                                                                                             | **IN:** Email → Reset code → New password<br/>**PROCESS:** Clerk password reset<br/>**OUT:** Session reactivation   | - Return to sign-in on completion                                                                                                                | - Clerk SDK<br/>- Email delivery service                                      | - Invalid email<br/>- Code expiration<br/>- Reset failure recovery                            |
| **onboarding/page.tsx**      | Onboarding Form      | - `useUser()` hook<br/>- Calls `setClerkMetadata()` server action (React 19)                                                                       | - Org/user creation via server action<br/>- DB sync via webhook                                                                                | **IN:** Business form data<br/>**PROCESS:** Server action → Clerk org creation<br/>**OUT:** Complete user/org setup | - Redirect to org dashboard on success<br/>- Stay for validation errors                                                                          | - Valid user session<br/>- Complete form<br/>- Server action availability     | - Form validation<br/>- Server action failure<br/>- Rollback on partial success               |
| **setClerkMetadata**         | Server Action        | - `clerkClient.organizations.createOrganization()`<br/>- `createOrganizationMembership()`<br/>- User/org metadata updates                          | - `DatabaseQueries.upsertOrganization()`<br/>- `DatabaseQueries.upsertUser()`<br/>- Immediate DB sync (optional)<br/>- Webhook for consistency | **IN:** OnboardingData<br/>**PROCESS:** Clerk org creation → DB sync<br/>**OUT:** Org & membership IDs              | - No direct redirects<br/>- Returns success/error status                                                                                         | - Clerk API<br/>- DB connection<br/>- Unique slug generation                  | - Exponential backoff<br/>- Race condition handling<br/>- Rollback logic                      |
| **webhook-handler/route.ts** | Webhook Processor    | - Receives Clerk webhook events<br/>- Processes org/user/membership events<br/>- Validates webhook signatures                                      | - `DatabaseQueries.upsertOrganization()`<br/>- `DatabaseQueries.upsertUser()`<br/>- Membership status updates                                  | **IN:** Clerk webhook events<br/>**PROCESS:** Event validation → DB sync<br/>**OUT:** DB state consistency          | - No redirects (API endpoint)<br/>- Returns HTTP status codes                                                                                    | - Valid webhook signature<br/>- DB availability<br/>- Event payload structure | - Event type validation<br/>- DB operation retries<br/>- Idempotent processing                |
| **auth/context.tsx**         | Auth Provider        | - `useUser()` and `useOrganization()` hooks<br/>- Clerk metadata extraction<br/>- ABAC permission mapping                                          | - No direct DB calls<br/>- Uses Clerk metadata as source of truth                                                                              | **IN:** Clerk session data<br/>**PROCESS:** Context hydration<br/>**OUT:** App-wide auth state                      | - No navigation (context only)<br/>- Provides auth state to components                                                                           | - Clerk hooks<br/>- Session metadata structure                                | - Loading states<br/>- Default permission fallbacks<br/>- Context error boundaries            |
| **auth/auth.ts**             | Server Auth Utils    | - `auth()` and `currentUser()` from Clerk<br/>- Org context extraction                                                                             | - `DatabaseQueries.getUserByClerkId()`<br/>- DB user lookup for extended data                                                                  | **IN:** Server request context<br/>**PROCESS:** Clerk + DB data merge<br/>**OUT:** Complete user context            | - `redirect()` for auth failures<br/>- Role-based route protection                                                                               | - Clerk session<br/>- DB connectivity<br/>- User exists in DB                 | - Auth enforcement<br/>- Role validation<br/>- DB lookup errors                               |
| **user-nav.tsx**             | Navigation Component | - Uses auth context<br/>- `useAuth()` hook for user data                                                                                           | - No direct DB operations<br/>- Displays cached user info                                                                                      | **IN:** Auth context data<br/>**PROCESS:** UI state management<br/>**OUT:** User menu interface                     | - Logout redirects via router<br/>- Profile navigation options                                                                                   | - Auth context<br/>- User session validity                                    | - User data loading<br/>- Menu state management<br/>- Navigation error recovery               |
| **DatabaseQueries**          | Database Layer       | - Stores Clerk IDs as foreign keys<br/>- Syncs org/user metadata                                                                                   | - All CRUD for users/orgs<br/>- Data consistency<br/>- Handles race conditions                                                                 | **IN:** Clerk webhook/server actions<br/>**PROCESS:** DB ops with validation<br/>**OUT:** Persistent user/org data  | - No navigation (data layer only)<br/>- Supports app routing decisions                                                                           | - DB connection health<br/>- Valid Clerk ID refs<br/>- Transaction handling   | - Unique constraint conflicts<br/>- Orphaned record cleanup<br/>- Connection failure recovery |

## Data Flow Diagrams (Optimized)

### User Registration Flow
```
User Form → sign-up/page.tsx → Clerk.signUp.create() → Clerk Session → middleware.ts → /onboarding
    ↓
onboarding/page.tsx → setClerkMetadata() [React 19 Server Action] → Clerk.createOrganization() + (optional: DB.upsertOrganization())
    ↓
Clerk Webhook → webhook-handler/route.ts (App Router API route) → DB.upsertUser()/upsertOrganization() [Neon]
    ↓
middleware.ts → /{orgId}/dashboard/{userId}
```

### Authentication Flow
```
User Credentials → sign-in/page.tsx → Clerk.signIn.create() → Active Session
    ↓
middleware.ts (App Router) → Reads sessionClaims → Validates org context → Route Decision
    ↓
If onboardingComplete: /{orgId}/dashboard/{userId}
If incomplete: /onboarding
If no auth: /sign-in
```

### Organization Creation Flow
```
Business Data → setClerkMetadata() [Server Action] → Clerk.createOrganization() → Organization ID
    ↓                                        ↓
DB.upsertOrganization() ←→ Race Condition Handling (via webhook)
    ↓
Clerk.createOrganizationMembership() → Membership Created
    ↓
DB.upsertUser() → Complete Setup
    ↓
Webhook Validation → DB Consistency Check
```

### Webhook Synchronization Flow
```
Clerk Event → webhook-handler/route.ts (App Router API) → Signature Validation → Event Processing
    ↓
organization.created → DB.upsertOrganization() [Neon]
user.created → DB.upsertUser() [Neon]
organizationMembership.* → DB.upsertUser() [Neon]
    ↓
Database State = Clerk State (Eventually Consistent)
```

## Key Patterns for Next.js 15, React 19, Neon, Clerk

1. **App Router & Server Actions**
   - Use `app/api/webhook-handler/route.ts` for Clerk webhooks (edge-ready)
   - Use React 19 server actions for onboarding and org creation (async/await, direct Neon calls)
   - Route protection via `middleware.ts` (App Router matcher)

2. **Neon Serverless PostgreSQL**
   - Use connection pooling (Neon driver)
   - All DB writes via idempotent upserts (webhook-driven)
   - Minimize DB calls in hot paths (prefer Clerk session metadata)

3. **Clerk Org-based ABAC Multi-Tenancy**
   - All session claims include `orgId`, `role`, and ABAC permissions
   - Middleware enforces org context isolation
   - All DB records reference Clerk org/user IDs

4. **Webhook-driven Sync**
   - All user/org/membership changes flow from Clerk → webhook → Neon
   - Webhook handler validates signature, processes events, upserts data
   - Server actions may optimistically update DB, but webhook is source of truth

5. **Error Handling & Observability**
   - All server actions and webhook handlers log errors and retries
   - Use idempotent DB operations to handle race conditions
   - Exponential backoff for transient Neon/Clerk errors

## Monitoring & Health

- **Logging:** Auth events, DB ops, webhook status, errors
- **Metrics:** Registration completion, auth errors, DB latency, webhook delays
- **Health Checks:** Neon connectivity, Clerk API, webhook endpoint, session validation

---

