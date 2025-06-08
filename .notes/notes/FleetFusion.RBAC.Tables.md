---
id: hl3jy8uiryjz4jzn6b0s75k
title: Tables
desc: ''
updated: 1748931075247
created: 1748914795938
---

# FleetFusion RBAC Tables

This document provides a detailed overview of the RBAC (Role-Based Access Control) implementation in your FleetFusion application, specifically focusing on the tenant pages and their access control mechanisms.

## RBAC Implementation in the Codebase

### **1. Centralized Role/Permission Logic:**
- All RBAC logic is centralized in permissions.ts.
- Roles and permissions are imported from abac.ts and auth.ts.

### **2. Route Protection:**
- The `RouteProtection` class defines a `PROTECTED_ROUTES` map, matching real route patterns (e.g. `/tenant/:orgId/dashboard/:userId`).
- Each route pattern is mapped to an array of allowed roles (e.g. `SystemRoles.ADMIN`, `SystemRoles.DRIVER`).
- The static method `canAccessRoute(user, path)` checks if a user’s role matches the allowed roles for a given route.

### **3. Permission Checks:**
- `hasPermission(user, action, resource)` checks if a user has a specific permission.
- `hasRole(user, role)` checks if a user has a specific role.
- `PermissionChecks` provides resource-specific permission helpers (e.g. `canViewVehicles`, `canCreateDrivers`).
- `ResourcePermissions` provides context-aware checks (e.g. a driver can only access their own data).

### **4. Usage:**
- In middleware.ts, `RouteProtection.canAccessRoute` is called to enforce route-level RBAC.
- If a user is not allowed, they are redirected or denied.

### **5. Session Claims:**
- Clerk session claims and JWTs include role and permission info, which is used to build the `UserContext` for RBAC checks.

---

## File Summaries

**auth.ts**  
Server-side helpers for extracting user/org context, checking roles, and requiring authentication.

**utils.ts**  
Server-side utilities for extracting org/user IDs from Clerk session.

**middleware.ts**  
Next.js middleware for RBAC route protection, session extraction, and redirect logic.

**abac.ts**  
Defines system roles, permissions, and ABAC logic.

**permissions.ts**  
Helpers for permission checks, role checks, and resource-specific permission utilities.

**context.tsx**  
React context provider for user/org/role/permissions, with hooks for RBAC-aware UI.

**protected-route.tsx**  
Client-side component to guard routes, redirecting unauthenticated users.

**onboardingActions.ts**  
Server actions for onboarding steps, Clerk org/user metadata setup, and completion logic.

**onboardingFetchers.ts**  
Fetch onboarding status/progress from DB.

**onboarding.ts**  
Zod schemas for onboarding steps.

**page.tsx**  
Onboarding UI page for company/org setup.

**layout.tsx**  
Layout for onboarding, redirects if onboarding is complete.

**userFetchers.ts**  
Fetch users and roles for an organization.

**userActions.ts**  
Server actions to invite users and update roles.

**UserTable.tsx**  
Admin UI table for listing users/roles.

**RoleAssignmentModal.tsx**  
Modal for assigning roles.

**InviteUserForm.tsx**  
Form for inviting new users.

**route.ts**  
Handles Clerk webhooks, syncs user/org/membership changes to Neon PostgreSQL.

**auth.ts**, **onboarding.ts**, **webhooks.ts**, **api.ts**, **globals.d.ts**  
Strong typing for all auth, RBAC, onboarding, and webhook flows.

**auth.ts**  
Zod schemas for sign-in, sign-up, onboarding, role assignment, and webhook payloads.

**rate-limit.ts**  
In-memory rate limiting utility for API endpoints.

**layout.tsx**, **layout.tsx**, etc.  
Layouts and pages for all major auth flows.

---

## Routes

Here are the route paths for all the files in your app directory, following Next.js 15 conventions:

---

### **(auth) Routes**
- `/accept-invitation`
- `/forgot-password`
- `/onboarding`  
  - `/onboarding`
- `/sign-in`  
  - `/sign-in`  
  - `/sign-in/*` 
- `/sign-up`  
  - `/sign-up`  
  - `/sign-up/*` 
- `/sign-out`
- `/error`
- `/loading` 

---

### **(funnel) Public/Marketing Routes**
- `/about`
- `/contact`
- `/features`
- `/pricing`
- `/privacy`
- `/refund`
- `/services`
- `/terms`
- `/error` 
- `/loading` 

---

### **(tenant) Multi-tenant Org Routes**
- `/[orgId]/analytics`
- `/[orgId]/compliance`
- `/[orgId]/compliance/[userId]`
- `/[orgId]/compliance/[userId]/hos-logs`
- `/[orgId]/dashboard/[userId]`
- `/[orgId]/dispatch/[userId]`
- `/[orgId]/dispatch/[userId]/edit`
- `/[orgId]/dispatch/[userId]/new`
- `/[orgId]/drivers/[userId]`
- `/[orgId]/ifta`
- `/[orgId]/settings`
- `/[orgId]/vehicles`
- `/[orgId]/error` 
- `/[orgId]/loading` 

---

### **API Route**
- `/api/clerk/webhook-handler`

---

### **Root App Routes**
- `/` (root landing page)
- `/layout` (root layout)

---

**Notes:**
- Dynamic segments: `[orgId]`, `[userId]` are replaced by actual IDs at runtime.
- Catch-all routes: `/sign-in/*`, `/sign-up/*` match any subpath.
- Layout, error, and loading files are used by Next.js for their respective boundaries and do not create direct routes.

---

## RBAC Table for Tenant Routes

| Page Route                                      | RBAC Steps Followed?                                                                                          | Notes                                                                                                 |
|-------------------------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `/[orgId]/analytics`                            | ✅ Middleware handles user/org/role checks. No explicit RBAC in page.                                         | Pure UI; access enforced by middleware.                                                              |
| `/[orgId]/compliance`                           | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Pure UI; access enforced by middleware.                                                              |
| `/[orgId]/compliance/[userId]`                  | ✅ Explicit RBAC: checks user and role in page.                                                               | Page-level check for compliance officer role.                                                        |
| `/[orgId]/compliance/[userId]/hos-logs`         | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Simple component render; relies on middleware.                                                       |
| `/[orgId]/dashboard/[userId]`                   | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Pure UI; access enforced by middleware.                                                              |
| `/[orgId]/dispatch/[userId]`                    | ✅ Middleware handles RBAC. May check user/org in page.                                                       | Page may check user/org, but role-based access enforced by middleware.                               |
| `/[orgId]/dispatch/[userId]/edit`               | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Edit form; access enforced by middleware.                                                            |
| `/[orgId]/dispatch/[userId]/new`                | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | New dispatch form; access enforced by middleware.                                                    |
| `/[orgId]/drivers/[userId]`                     | ✅ Explicit RBAC: checks user and role in page.                                                               | Page-level check for driver role.                                                                    |
| `/[orgId]/ifta`                                 | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Pure UI; access enforced by middleware.                                                              |
| `/[orgId]/settings`                             | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Pure UI; access enforced by middleware.                                                              |
| `/[orgId]/vehicles`                             | ✅ Middleware handles RBAC. No explicit RBAC in page.                                                         | Client component; access enforced by middleware.                                                     |

---

## RBAC Gap Analysis

Here’s a summary of the RBAC implementation in your tenant routes, focusing on gaps and areas for improvement:

---

### **RBAC Process Table**

| Step                      | File(s) Involved              | Logic/Responsibility                                       |
| ------------------------- | ----------------------------- | ---------------------------------------------------------- |
| Intercept request         | middleware.ts                 | All requests pass through here                             |
| Check user authentication | middleware.ts                 | Clerk `auth()`, redirect if not signed in                  |
| Check org context         | middleware.ts                 | Compare session orgId to route orgId, redirect if mismatch |
| Build user context        | middleware.ts                 | `buildUserContext` from session claims                     |
| Check route permissions   | middleware.ts, permissions.ts | `RouteProtection.canAccessRoute` for RBAC                  |
| Render or redirect        | middleware.ts                 | Allow or redirect based on checks                          |
| Render page               | `app/(tenant)/[orgId]/...`    | Next.js renders the page if allowed                        |

---

### Flow Steps

Here’s the step-by-step flow for what should happen when a tenant route (e.g. `/tenant/[orgId]/dashboard/[userId]`) is accessed, and which file is responsible for each step in the codebase:

---

#### 1. **Request Intercepted by Middleware**
- **File:** middleware.ts
- **Logic:** All requests are intercepted before reaching the app. The middleware is responsible for authentication and authorization checks.

---

#### 2. **Check User Authentication (User ID)**
- **File:** middleware.ts
- **Logic:** The middleware calls Clerk’s `auth()` to get the current session. If `userId` is missing, the user is redirected to `/sign-in`.

---

#### 3. **Check Organization Context (Org ID)**
- **File:** middleware.ts
- **Logic:** The middleware extracts `orgId` from the session and the route. If the user’s organization does not match the route’s org, redirect to the correct org dashboard.

---

#### 4. **Build User Context (Roles & Permissions)**
- **File:** middleware.ts (function: `buildUserContext`)
- **Logic:** The middleware builds a `UserContext` object from session claims, including role, permissions, and org info.

---

#### 5. **Check Route Permissions (RBAC)**
- **File:** middleware.ts (calls into permissions.ts)
- **Logic:** The middleware uses `RouteProtection.canAccessRoute(userContext, req.nextUrl.pathname)` to check if the user’s role is allowed for the route, based on the patterns and roles in permissions.ts.

---

#### 6. **Render or Redirect**
- **File:** middleware.ts
- **Logic:** 
  - If the user is allowed, the request proceeds (`NextResponse.next()`).
  - If not, the user is redirected (e.g., to `/sign-in` or their allowed dashboard).

---

#### 7. **App Renders Page**
- **File:** `app/(tenant)/[orgId]/...`
- **Logic:** If the request passes all checks, the appropriate page is rendered by the Next.js app router.

---

### Rubric Table: Required vs. Provided

| Area                       | Required Files/Logic                                                               | Provided File(s)                                                                           | Status / Gaps                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Clerk Auth Integration** | Clerk SDK setup, session utils, context, middleware                                | auth.ts, utils.ts, middleware.ts                                                           | **Mostly present.** Clerk SDK setup is implied but not shown. Ensure Clerk client is initialized in auth. |
| **RBAC Logic**             | Role/permission types, permission checks, ABAC utilities                           | abac.ts, permissions.ts                                                                    | **Present.** ABAC types and permission helpers are defined.                                               |
| **User Context/Provider**  | Auth context provider, hooks for user/org/role/permission                          | context.tsx                                                                                | **Present.** Memoized context and hooks for RBAC-aware UI.                                                |
| **Protected Routes**       | HOC/component for protected routes                                                 | protected-route.tsx                                                                        | **Present.** Client-side route protection.                                                                |
| **Onboarding Flow**        | Actions, fetchers, schemas, onboarding page/layout                                 | onboardingActions.ts, onboardingFetchers.ts, onboarding.ts, page.tsx, layout.tsx           | **Present.** Covers onboarding logic, validation, and UI.                                                 |
| **User/Org Management**    | User/role fetchers, actions, admin UI components                                   | userFetchers.ts, userActions.ts, `components/admin/users/*`                                | **Present.** User listing, invite, and role update logic and UI.                                          |
| **Clerk Webhook Handler**  | API route for Clerk webhooks, DB sync logic                                        | route.ts                                                                                   | **Present.** Handles Clerk webhooks for user/org sync.                                                    |
| **Types & Schemas**        | Types for auth, onboarding, webhooks, ABAC, API, global claims, Zod schemas        | auth.ts, onboarding.ts, webhooks.ts, abac.ts, api.ts, globals.d.ts, auth.ts, onboarding.ts | **Present.** Strong typing and validation.                                                                |
| **Rate Limiting**          | Utility for API rate limiting                                                      | rate-limit.ts                                                                              | **Present.** In-memory rate limiting utility.                                                             |
| **RBAC UI Components**     | User table, role assignment modal, invite form                                     | UserTable.tsx, `RoleAssignmentModal.tsx`, `InviteUserForm.tsx`                             | **Present.** Admin UI for user/role management.                                                           |
| **App Layouts/Pages**      | Auth layouts, sign-in/up/out, onboarding, accept-invitation, forgot/reset password | layout.tsx, layout.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx, page.tsx         | **Present.** All major auth flows covered.                                                                |

---

### **Gaps**

- **Clerk SDK Initialization:**  
  The actual Clerk client initialization (e.g., `clerkClient`) is referenced but not shown. Ensure this is present and properly configured in auth or a dedicated `lib/clerk.ts`.

- **Feature-Driven Structure:**  
  While your structure is solid, consider moving domain logic/UI into a features directory for better scalability (see your instructions).

- **Onboarding/Org Sync:**  
  The webhook handler is present, but the actual DB sync logic is not visible. Ensure robust error handling, idempotency, and logging in webhook processing.

- **Testing:**  
  No test files are shown. Add unit/integration tests for all critical logic, especially onboarding, RBAC checks, and webhook handlers.

- **Documentation:**  
  Minimal inline comments are present. Add more documentation for complex flows and configuration.

- **No Duplicate Fetchers:**  
  Ensure fetchers are reused and colocated by domain (as per your instructions).

- **Strict TypeScript:**  
  Confirm `strict` mode is enabled in tsconfig.json and avoid `any` types.

- **Production Readiness:**  
  - Ensure all error handling is robust.
  - Validate all inputs with Zod before mutations.
  - Use environment variables securely.
  - Consider distributed rate limiting (e.g., Redis) for production.

---

## Summary

Here’s a recap and details about your routing and RBAC (role-based access control) implementation:

---

### **Strengths**

- **Strong typing and validation** throughout.
- **Separation of concerns** between UI, logic, and data access.
- **Modern Next.js 15 patterns** (server actions, RSC, layouts).
- **Comprehensive RBAC/ABAC logic** and UI for user/role management.
- **Webhook-based DB sync** for Clerk/Neon integration.
- **Centralized permission checks** in middleware and permissions.ts.

---

### Key Findings

- **RBAC Steps:**  
  - All pages rely on the middleware for user/org/role checks, as per your RBAC flow.
  - Some pages (notably `/compliance/[userId]` and `/drivers/[userId]`) add an extra layer of RBAC by checking the user and role in the page itself.
  - Most pages do not duplicate resource fetching or permission logic; they rely on the centralized checks.

- **Resource Duplication/Conflict:**  
  - No resource duplication or conflict was found. Data fetching and permission checks are not repeated unnecessarily.

- **Potential Improvements:**  
  - For consistency, you could add explicit user/role checks in all sensitive pages, but this is not strictly necessary if your middleware is robust.
  - Ensure that all sensitive data fetchers (in fetchers) also validate permissions as a defense-in-depth measure.

---





