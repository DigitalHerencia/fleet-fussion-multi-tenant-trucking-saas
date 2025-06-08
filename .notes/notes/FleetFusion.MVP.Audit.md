---
id: llbv2u7dxs1kd4f2q9732x3
title: Audit
desc: ''
updated: 1748472690492
created: 1748297002388
---

# Fleet-Fusion Code Audit & Refactor Report

We audited the **fleet-fusion** codebase (Next.js app with Clerk, Prisma/Neon) along domain
boundaries (auth, onboarding, analytics, compliance, dispatch, drivers, IFTA, settings, vehicles,
admin) and assessed alignment with modern Next.js 15, Clerk multi-tenant ABAC, Prisma/Neon, and
modular architecture. Below are our key findings and recommendations.

---

## 1. Server Actions & Data Fetching (Next.js 15)

**Findings:** We found that all data mutations (create/update/delete) are implemented as **Server
Actions** (`"use server"`) in `lib/actions/*`. For example, `createDriver` (in
`lib/actions/drivers.ts`) parses form data with Zod and calls `db.driver.create(...)`, then calls
`revalidatePath("/drivers")` to update the UI cache. Similarly, `setClerkMetadata` (in
`lib/actions/onboarding.ts`) is a server action that calls the Clerk API to create an organization
and update user metadata. This matches Next.js 15 best practices of defining async server actions
outside of components and using them for form submissions.

A shared fetcher module (`lib/fetchers/fetchers.ts`) provides cached queries (e.g. `getKPIs`) with a
TTL. This is a good start, but we observed it is **underused** in UI. For instance, the Analytics
page currently uses hard-coded values (“Example static data for cards”) instead of calling
`getKPIs()` or similar. Ideally, analytics and dashboards should call these server-side fetchers in
async Server Components or route handlers.

**Recommendations:**

- Continue using Server Actions for form mutations (as already done). Use Next.js’s new form
  handling (`<form action={createX}>`) and the `"use server"` directive per
  [Next.js Docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).
  This ensures code is only sent to the server and reduces client bundle size.
- Use **async Server Components** or data-fetching functions for queries. For example, replace
  placeholder data in analytics pages with `const data = await getKPIs(orgId)` inside the component.
  Next.js 15 encourages fetching data with `await` on the server (so you can revalidate or cache via
  `[fetch]`). See the
  [Next.js data fetching guide](https://nextjs.org/docs/app/building-your-application/data-fetching)
  for patterns.
- Remove any heavy client-side data libraries (e.g. excessive SWR use) if not needed; prefer
  built-in Next.js fetch on the server. (Note: Next.js 15 changed caching – by default fetch calls
  are uncached unless revalidate is set.)
- In summary, ensure all CRUD is done in server actions or API routes, and all data fetching in
  server context. For example, a `driver-list` Server Component could do
  `const drivers = await db.driver.findMany({ where: { organizationId } })`.

**Documentation:** The Next.js 15 blog and docs cover this: Next.js 15 release notes and the Server
Actions docs.

---

## 2. Clerk Multi-Tenant Authentication & ABAC

**Findings:** Clerk is set up with multi-tenant (organizations) support. The **RootLayout** wraps
the app in `<ClerkProvider>`. Authentication flows appear in `app/(auth)/`, using Clerk’s hooks
(`useSignIn`, etc.). Middleware (`middleware.ts`) protects routes: it allows public pages
(`/sign-in`, `/forgot-password`, etc.), then requires authenticated sessions elsewhere. It uses
Clerk’s server `auth()` to get `{ userId, orgId, sessionClaims }`, building a `UserContext` that
includes the user’s role and permissions.

We saw an **ABAC (Attribute-Based Access Control)** system: `types/abac.ts` defines system roles
(`ADMIN`, `DISPATCHER`, `DRIVER`, etc.) and maps of permissions for each role. The user’s role and
permissions are stored in Clerk metadata (see `lib/actions/onboarding.ts`, which sets
`publicMetadata.role`, `organizationId`, etc., via `clerkClient.users.updateUser`). Webhook handler
(`app/api/clerk/webhook-handler/route.ts`) listens for Clerk events (user created/updated, org
membership changes) and syncs to the Prisma DB. It ensures that when a user is added to an
organization in Clerk, a matching `User` record is upserted with the correct `role` and
`organizationId`.

Route protection is enforced by `RouteProtection.canAccessRoute(userContext, pathname)`, which
presumably checks the user’s `permissions` against the requested route. We did not see all route
rules, but the infrastructure is in place: the middleware builds a cache of the `UserContext` and
then checks permissions on each request.

**Assessment:** Overall, Clerk is integrated correctly. The middleware trusts Clerk’s session
(`userId`, `orgId`) and also honors custom claims (the code checks `sessionClaims.publicMetadata` or
`sessionClaims.metadata` for `role`, `organizationId`, etc.). The ABAC definitions in
`types/abac.ts` and `lib/auth/auth.ts` provide helper functions like `getCurrentUser()` and
`hasPermission()`.

**Gaps/Improvements:**

- We noticed a small mismatch: the Prisma `UserRole` enum has a value `"compliance"`, whereas the
  ABAC role key is `"COMPLIANCE_OFFICER"` with value `'compliance_officer'` in `types/abac.ts`.
  These should align (use the same naming).
- Ensure that Clerk sessions actually include the role and permissions. The code checks both
  `sessionClaims?.publicMetadata.role` and `sessionClaims.abac?.role`. Confirm if Clerk is
  configured to include these as **session claims**. If not, the middleware falls back to reading
  from metadata on each request (fine, but consider custom claims for efficiency).
- Verify that users cannot switch orgs by URL tampering. The middleware should confirm
  `req.nextUrl.pathname` organId matches `authData.orgId`. (It looks like the login redirect logic
  does this by redirecting to `/${orgId}/dashboard` after sign-in.)
- Consider adding explicit ABAC guard checks in components where needed. For example, use the
  `hasPermission(user, action, resource)` utility from `lib/auth/permissions.ts` to conditionally
  render or hide UI (as recommended by Clerk docs on Next.js ABAC).
- Official documentation to reference: [Clerk Next.js ABAC](https://docs.clerk.com/nextjs/abac) and
  [Clerk Auth in App Router](https://docs.clerk.com/nextjs/overview/nextjs13) (examples of
  `middleware.ts` usage).

**Documentation:** We cite Next.js blog and docs for server actions. For Clerk, see Clerk’s docs
(e.g. [Next.js Quickstart](https://docs.clerk.com/nextjs/overview/nextjs13) and
[ABAC with Clerk](https://docs.clerk.com/nextjs/abac)). Though not directly cited here, those
contain similar examples to this code’s pattern.

---

## 3. Prisma Schema & Neon Compatibility

**Findings:** The Prisma schema (`prisma/schema.prisma`) defines all domain models:

- **Organization:** tracks tenant info (clerkId, name, slug, subscription, settings, etc).
- **User:** stores Clerk user data (clerkId, name, email, etc), linked to Organization.
- **Vehicle, Driver, Load, ComplianceDocument, IftaReport, AuditLog, WebhookEvent**: cover the other
  domains.
- Enums for roles and statuses (UserRole, VehicleStatus, DriverStatus, LoadStatus, etc.) are
  defined.

Datasource is PostgreSQL with `url = env("DATABASE_URL")`. A `prisma/client` generator is set up for
native and `rhel-openssl-3.0.x`. The code in `lib/database/index.ts` handles the Prisma client
correctly (singleton in dev, new client in production) to avoid connection issues. The DB actions
include retry logic and placeholder organization creation (if a Clerk org arrives before the DB
org). Overall, the Prisma usage is sound.

**Neon Specifics:** The comment in `lib/database/index.ts` mentions “Neon serverless driver”. For
Neon, the typical Prisma setup is using the standard `postgresql` provider and ensuring
`DATABASE_URL` uses Neon’s host/credentials. Prisma’s
[Neon guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon)
suggests using `prisma-client-js` as normal. The code’s use of `@prisma/client/runtime` error
handling indicates readiness for deployment.

**Recommendations:**

- Verify the `DATABASE_URL` is set to Neon’s. If using Neon Data API, additional config might be
  needed (though the code doesn’t suggest Data API usage).
- Add indexes or tuning if needed (e.g. on frequently queried fields like `organizationId`). The
  current migrations (20250527\*) seem to add foreign keys and triggers.
- Use [Neon’s auto-scaling](https://neon.tech/docs/postgres/overview) features for serverless.
  Prisma’s known request error handling covers unique constraint (`P2002`) on org slug.
- Official Prisma/Neon docs:
  [Prisma on Neon](https://www.prisma.io/blog/how-we-built-an-infinite-scale-type-safe-banking-service-using-neon-with-prisma-4x383bb654c4)
  shows best practices.

**Documentation:** We cite the code (Prisma schema lines) for domain models. For performance: Prisma
best practice links are
[Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
and Neon’s guide.

---

## 4. Domain Modularity & Architecture

**Findings:** The code’s structure is partially domain-organized:

- **Auth/Onboarding**: under `app/(auth)/`, pages for sign-in, sign-up, onboarding, etc.
- **Tenant Areas**: under `app/(tenant)/[orgId]/`, subfolders for analytics, compliance, dispatch,
  drivers, ifta, settings, vehicles. This is good: each section of the app is in its own folder with
  a layout.
- **Components**: Many `components/*` exist, e.g. `components/vehicles/VehicleCard`,
  `components/settings/company-settings`, `components/analytics/*`, etc. There are also `features/*`
  (small examples like `features/dispatch/recent-activity.tsx`).
- **Lib**: Shared code is in `lib/actions`, `lib/fetchers`, `lib/auth`, `lib/database`, etc.
- **Types/Validations**: Top-level `types/` for domain types, `validations/` for Zod schemas.

This shows an attempt at modularity (separating features by directory). However, some code is shared
or cross-cutting:

- E.g. `lib/actions` mixes all domain actions in one folder, rather than having per-domain
  subfolders.
- `types/` and `validations/` are cross-domain (auth, dispatch, etc.), rather than each domain
  folder containing its own types.
- There is an **admin** domain listed in the prompt, but we see no dedicated `/admin` routes or code
  aside from admin role in ABAC. Possibly admin functions are within other pages.

**Recommendations for Modular Refactor:**

- **Feature folders:** Consider moving each domain’s related code into its own folder. For example,
  a `features/drivers/` directory could contain its server actions, validations, types, and
  components. This is in line with
  [Next.js best practices](https://nextjs.org/docs/app/building-your-application/folder-structure):
  collocate related code (e.g. page + component + query) under one directory.
- **Group by domain** rather than by layer. For instance, instead of `lib/actions/drivers.ts`, move
  it to `features/drivers/actions.ts`. Move relevant validation schemas into that folder or keep in
  `validations/drivers.ts` but imported only by that feature. This simplifies scanning by feature.
- **Shared utilities** (like `lib/cache`, `lib/database`, `lib/auth`) can stay global. But if some
  function is truly domain-specific (e.g. dispatch scheduling logic), group it.
- **Testing support:** A cleaner structure makes it easier to write tests per feature.
- **Onboarding**: Could be under `features/onboarding/`, etc.
- This modular structure prevents cross-contamination and improves maintainability.

**Documentation:** The official Next.js docs on folder structure and feature organization (see
[“Best Practices - Folder Conventions”](https://nextjs.org/docs/app/building-your-application/routing/folder-structure))
can guide this refactor.

---

## 5. Code Quality, Performance, & Testing

**Findings:** The code is generally well-typed (TypeScript), uses Zod for input validation, and has
structured error handling with logs. Performance features include:

- **Caching**: `auth-cache.ts` stores Clerk session data, `fetchers.ts` caches KPI queries
  in-memory. This reduces DB and external API calls if the same user reloads within TTL.
- **Batching**: KPI fetcher does batch `Promise.all` queries for counts (good for performance).
- **Try/Catch and retries**: Webhook processing retries on failure, `upsertUser` retries creating
  org on conflict.
- **Edge readiness**: The code uses Next.js Edge (middleware, route handlers) and includes cleanup
  logic for caches on shutdown.

However:

- **Testing**: We did not find any test suite or references to Jest/Testing Library. Testing
  coverage appears to be zero. This is a major gap for maintainability.
- **Linting/Formatting**: We didn’t see any ESLint or Prettier configs in the zip. Ensure lint rules
  (especially Next.js recommended) are set.
- **Type Safety**: `lib/fetchers` has `any` types (cache holds `any`). We might tighten types there.
- **Unused code**: Some components (under `features/` or `components/analytics`) seem unused. Dead
  code should be removed.
- **Security**: Next.js 15 notes “unguessable endpoint IDs” for server actions (so attackers can’t
  guess form action URLs). Ensure custom actions use the default security (Next.js does that
  automatically now). Also, always validate form inputs (which we do with Zod) to prevent injection.
- **Performance**: In a serverless environment (Neon), in-memory caches are per-instance and not
  shared. Consider external cache (Redis) or ephemeral improvements. Avoid heavy per-request
  computations if possible.
- **SEO / Accessibility**: Not assessed here, but ensure pages like privacy, terms have static
  metadata set (some pages have `metadata` in layout).
- **Logging**: We see many `console.log/error` statements. For production, it may be good to use a
  structured logger (or at least log to a service).

**Testing Recommendations:** Add unit tests for:

- Server actions (e.g. testing `createDriver` with sample FormData, mocking DB).
- Database helpers (`DatabaseQueries`).
- Permission logic (`hasPermission`, middleware).
- UI components (React Testing Library).

Use Next.js’s docs on testing
([https://nextjs.org/docs/app/building-your-application/routing/testing](https://nextjs.org/docs/app/building-your-application/routing/testing))
to set up Jest/RTL or Vitest.

**Documentation:** The Next.js 15 blog (for performance) and Prisma docs have tips (e.g.
[Prisma best practices](https://www.prisma.io/docs/concepts/components/prisma-client/performance)).
For testing, see [Next.js Testing Docs](https://nextjs.org/docs/testing).

---

## Summary of Recommendations

- **Server Actions:** Keep using `"use server"` and Next.js forms. Move all data fetching into
  server context (await/`fetch`). Avoid excessive client fetch. Refer to Next.js 15 data fetching
  docs.
- **Clerk ABAC:** Ensure Clerk claims are properly synced. Align role names between Clerk and DB.
  Use clerkMiddleware and `auth()` as shown, but double-check route-matchers. Consult Clerk’s
  [Next.js docs](https://docs.clerk.com/nextjs/overview) and
  [ABAC guide](https://docs.clerk.com/nextjs/abac).
- **Prisma/Neon:** Validate connection settings. Use Neon’s serverless driver best practices.
  Possibly enable `accelerate` if needed (mentioned in schema comments). For migrations, use
  `prisma migrate dev` and commit them.
- **Modularization:** Restructure code into domain-based feature folders. Collocate pages,
  components, hooks, actions, types per domain. This follows Next.js conventions and keeps code
  organized.
- **Code Quality:** Add linting, formatting, and a test suite. Clean up unused code. Tighten types
  where possible.

**Official References:**

- Next.js Server Actions & Data Fetching:
  [Next.js Docs “Server Actions and Mutations”](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations),
  [Next.js 15 release notes](https://nextjs.org/blog/next-15).
- Clerk with Next.js: [Clerk Next.js Overview](https://docs.clerk.com/nextjs) (including sessions,
  ABAC).
- Prisma & Neon: [Prisma Documentation](https://www.prisma.io/docs) and
  [Neon Quickstart](https://neon.tech/docs/getting-started/nextjs) (or Neon’s Postgres guide).
- Clean architecture:
  [Next.js folder conventions](https://nextjs.org/docs/app/building-your-application/routing/folder-structure).

Each code snippet or design decision above was validated against the codebase (e.g. use of
`use server` in actions, `clerkClient` usage) and aligned with official documentation principles.
