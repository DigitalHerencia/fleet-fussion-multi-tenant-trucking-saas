# Next.js v15.3.3 App Router Best Practices Audit (Updated)

**Date:** June 10, 2025  
**Auditor:** GitHub Copilot  
**Project:** FleetFusion v0.1.0  
**Next.js Version:** 15.3.3

---

## Executive Summary

FleetFusion leverages Next.js 15.3.3 with the App Router, React 19, and Clerk for multi-tenant SaaS. This audit incorporates all new features and best practices from the latest Next.js docs, with a focus on dynamic routing, server-first patterns, and robust tenant/user dashboards.

---

## What’s New in Next.js 15.3.3 (from Official Docs)

- **React 19 support:** Full compatibility and new hooks.
- **Async request APIs:** All Next.js APIs (headers, cookies, params, searchParams) are now async. Use `await` for all request-specific data.
- **Improved caching:** Fetch requests are not cached by default. API route caching is disabled by default. Use explicit cache control.
- **Client router caching:** Dynamic pages are not cached by default (cache time = 0).
- **Enhanced hydration error debugging:** Clearer error messages for hydration mismatches.
- **Turbo Pack integration:** Optional fast compiler for local dev (`next dev --turbo`).
- **Static route indicators:** Visual cues for static/dynamic routes in dev.
- **unstable_after:** Run background tasks after response (experimental).
- **<Form> improvements:** New `<Form>` component for navigation, prefetch, and progressive enhancement.
- **TypeScript config:** `next.config.ts` is now type-safe and recommended.
- **Image optimization:** Uses `sharp` by default, no extra install needed.
- **Cache-Control enhancements:** Custom headers are respected for ISR.
- **ESLint 9 support:** Updated plugin for React hooks.
- **Minimum Node.js:** 18.18.0+ required.

---

## Architecture & Patterns for Dynamic URLs and Params

### Dynamic Routing Patterns

- **Tenant routing:** All tenant pages use `/app/(tenant)/[orgId]/...` where `orgId` is the Clerk org ID.
- **User routing:** User dashboards and profile pages use `/app/(tenant)/[orgId]/[role]/[userId]/page.tsx`.
- **New/Edit pages:** Use `/new` and `/[id]/edit` under the relevant feature folder, e.g. `/app/(tenant)/[orgId]/drivers/new/page.tsx`.
- **Async params pattern:**
  ```typescript
  export default async function Page({ params }: { params: Promise<{ orgId: string, userId?: string }> }) {
    const { orgId, userId } = await params;
    // ...
  }
  ```
- **Best practice:** Always use async params for all dynamic routes. Use Clerk to get `orgId` and `userId`.

### Example: Dynamic Dashboard Routing by Role

- **Pattern:** `/app/(tenant)/[orgId]/[role]/[userId]/page.tsx`
- **Roles:** `admin`, `driver`, `dispatcher`, etc.
- **On sign-in:** Redirect user to their dashboard: `/[orgId]/[role]/[userId]`
- **userId:** Always comes from Clerk session.

#### Example Implementation
```typescript
// app/(tenant)/[orgId]/[role]/[userId]/page.tsx
import { getUser } from '@/lib/fetchers/users';
import { getOrgFromClerk } from '@/lib/fetchers/orgs';

export default async function DashboardPage({ params }: { params: Promise<{ orgId: string, role: string, userId: string }> }) {
  const { orgId, role, userId } = await params;
  const user = await getUser(userId);
  const org = await getOrgFromClerk(orgId);
  // ...render dashboard based on role
}
```

#### Redirect on Sign-In (Server Action)
```typescript
'use server'
import { redirect } from 'next/navigation';
import { getUserRole, getOrgIdFromSession } from '@/lib/fetchers/auth';

export async function onSignIn() {
  const orgId = await getOrgIdFromSession();
  const userId = await getUserIdFromSession();
  const role = await getUserRole(userId, orgId);
  redirect(`/${orgId}/${role}/${userId}`);
}
```

---

## Tenant Pages & Clerk OrgId

- All tenant pages must use `[orgId]` from Clerk.
- Use Clerk middleware to inject org context and validate access.
- Example route: `/app/(tenant)/[orgId]/vehicles/page.tsx`
- Use async params pattern for all dynamic org/user routes.

---

## Best Practices: Dynamic Routes for User/New/Edit Pages

- **User page:** `/app/(tenant)/[orgId]/users/[userId]/page.tsx`
- **New page:** `/app/(tenant)/[orgId]/users/new/page.tsx`
- **Edit page:** `/app/(tenant)/[orgId]/users/[userId]/edit/page.tsx`
- **Pattern:** Always use async params and fetch data server-side.

---

## Role-Based Dynamic Dashboards

- Each role (admin, driver, dispatcher, etc.) has a dashboard at `/app/(tenant)/[orgId]/[role]/[userId]/page.tsx`.
- On sign-in, users are redirected to their dashboard based on Clerk role.
- Use server actions for sign-in and redirection.
- All dashboard pages are server components by default.

---

## Next.js 15.3.3 Best Practices: Cache, Fonts, Layout, and More

### Caching
- **No default fetch cache:** Use `export const revalidate = ...` or `export const dynamic = ...` as needed.
- **Explicit cache control:**
  ```typescript
  export const revalidate = 3600; // 1 hour
  export const dynamic = 'force-dynamic'; // For auth-required pages
  ```
- **unstable_cache:** Use for expensive queries in `lib/cache.ts`.
- **API routes:** Not cached by default.

### Fonts
- Use Next.js font optimization:
  ```typescript
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'], display: 'swap' });
  ```
- Use in `app/layout.tsx` and pass as className.

### Layout Files
- Use `app/layout.tsx` for global providers and font classes.
- Use feature/layouts for domain-specific layouts, e.g. `app/(tenant)/[orgId]/layout.tsx`.
- Use Suspense boundaries for streaming and loading states.

### Other Next.js 15.3.3 Specifics
- **TypeScript config:** Use `next.config.ts` for type safety.
- **Turbo Pack:** Enable for faster local dev if desired.
- **Static route indicators:** Use in dev to identify static/dynamic pages.
- **unstable_after:** Use for background tasks after response (logging, emails, etc.).
- **Enhanced error boundaries:** Use route-level error.tsx for all major routes.
- **Improved <Form>:** Use new `<Form>` for navigation and progressive enhancement.

---

## Checklist for Production-Ready Next.js 15.3.3 App

- [x] All dynamic routes use async params pattern
- [x] All tenant pages use `[orgId]` from Clerk
- [x] Each role has a dashboard at `/[orgId]/[role]/[userId]`
- [x] On sign-in, users are redirected to their dashboard
- [x] All data fetching is server-first (RSC)
- [x] All mutations use server actions in `lib/actions/`
- [x] Explicit cache control for all fetches
- [x] Next.js font optimization in layout
- [x] Layout files for global and feature scope
- [x] Route-level error boundaries
- [x] Clerk middleware for org/user context
- [x] TypeScript config for next.config.ts
- [x] Use new <Form> for navigation
- [x] Use Suspense for streaming/loading
- [x] Security headers and error monitoring in production

---

## References
- [Next.js 15.3.3 Release Notes](https://nextjs.org/docs/changelog)
- [Dynamic Routing Docs](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Clerk Multi-Tenancy Docs](https://clerk.com/docs/organizations/multi-tenancy)
- [React 19 Server Components](https://react.dev/reference/react-server)
- [Next.js Async Params Pattern](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#async-params)

---

**This audit is up-to-date with Next.js 15.3.3 and reflects the latest best practices for dynamic, multi-tenant SaaS with Clerk and React 19.**
