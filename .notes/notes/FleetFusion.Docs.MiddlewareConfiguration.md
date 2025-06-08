---
id: tj3izo8mhx2daypszxkklxt
title: MiddlewareConfiguration
desc: 'Clerk + FleetFusion RBAC Middleware & Neon Table Reference'
updated: 1748447752988
created: 1748296874560
---

# Middleware Documentation (`middleware.ts`)

> **Optimized for:**
>
> - React 19 Server Actions
> - Next.js 15 App Router
> - Neon Serverless Postgres
> - Clerk Organizations (multi-tenant)
> - Attribute-Based Access Control (ABAC)
> - TMS SaaS (multi-tenant, organization-aware)

This document details the `middleware.ts` file, responsible for authentication, authorization, and
routing logic in a modern, multi-tenant SaaS using Next.js 15, React 19 Server Actions, Neon
serverless Postgres, and Clerk orgs.

## 1. Purpose

- Integrate with Clerk for authentication and multi-tenant org context.
- Protect routes using RBAC/ABAC, enriching requests with user/org context.
- Support React 19 Server Actions and Next.js 15 App Router conventions.
- Optimize for serverless (Neon) and edge runtime.
- Efficiently handle organization-specific routing and context.
- Use in-memory or distributed cache for user context (consider serverless constraints).

## 2. Key Imports

- `clerkMiddleware`, `createRouteMatcher` from `@clerk/nextjs/server`
- `NextResponse`, `NextRequest` from `next/server`
- `UserContext`, `ClerkUserMetadata`, `ClerkOrganizationMetadata` from `@/types/auth`
- `SystemRoles`, `getPermissionsForRole`, `SystemRole` from `@/types/abac`
- `authCache` from `@/lib/cache/auth-cache` (consider distributed cache for serverless)
- **React 19/Next.js 15**: Ensure all context is available for Server Actions and App Router
  layouts/pages.

## 3. Route Definitions

- **Public Routes**: Patterns for unauthenticated access (landing, auth, info, Clerk webhooks).
- **isPublicRoute**: Efficient matcher for public routes, compatible with App Router.

## 4. Session Caching

- Use a cache (in-memory or distributed, e.g., Redis for Neon/serverless) for user context.
- TTL should be short (e.g., 30s) due to serverless statelessness.
- Functions: `getCachedUserContext`, `setCachedUserContext`.

## 5. Regular Expressions

- `orgPathRegex`: Efficiently extract orgId from paths (e.g., `/orgId/dashboard`).
- Pre-compile regex for performance (important for serverless cold starts).

## 6. Helper Functions

- **handlePublicRoute**: Handles public route logic, including Clerk webhooks and onboarding
  redirects.
- **buildUserContext**: Constructs enriched user/org context for ABAC, compatible with Server
  Actions and App Router.
- **createResponseWithHeaders**: Injects user/org context into headers for downstream Server Actions
  and API routes.
- **forbiddenOrRedirect**: Handles unauthorized access for both API and page requests.

## 7. Main Middleware Logic (`clerkMiddleware`)

1.  **Public Route Check**: Use `isPublicRoute` for fast matching.
2.  **Protected Route Handling**: Enforce authentication, build/cached user context.
3.  **User Context**: Always provide enriched context for Server Actions and App Router
    layouts/pages.
4.  **Onboarding Checks**: Redirect as needed.
5.  **Organization Tenant Handling**: Validate orgId in path vs. user context; redirect if
    mismatched.
6.  **Response Creation**: Always inject user/org context headers for downstream use.

> **React 19/Next.js 15 Note:**  
> All context must be available for Server Actions and App Router layouts/pages. Use headers or
> cookies for context propagation.

## 8. Middleware Configuration (`config`)

- `matcher`: Broadly matches all app and API routes, excluding static assets and Next.js internals.
- Compatible with Next.js 15 App Router and React 19 conventions.

---

**Best Practices for Modern SaaS:**

- Use distributed cache for user context in serverless (Neon).
- Always propagate org/user context for Server Actions.
- Use ABAC for fine-grained multi-tenant authorization.
- Prefer edge runtime for lowest latency.
- Ensure all redirects and context logic are compatible with App Router and Server Actions.
