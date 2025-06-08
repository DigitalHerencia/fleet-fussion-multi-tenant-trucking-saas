---
id: bmvwm6yr96w8qrx6hj51mz2
title: Auth
desc: ''
updated: 1748741579342
created: 1748741314372
---

# Authentication Overview
FleetFusion uses Clerk for authentication, with a mix of public and protected routes. The app enforces authentication via middleware, redirecting unauthenticated users to the Clerk sign-in page. Key flows include sign-in, sign-up, onboarding, and protected dashboard access.

## 🗺️ Authentication Flow Map (Mermaid Diagram)

flowchart TD
  subgraph Public Routes
    A1[/sign-in/] --> H1[Clerk SignIn Page]
    A2[/sign-up/] --> H2[Clerk SignUp Page]
    A3[/forgot-password/] --> H3[Clerk Password Reset]
    A4[/accept-invitation/] --> H4[Accept Invitation Page]
  end

  subgraph App Routes
    B1[/] --> C1[Middleware: Auth Check]
    B2[/onboarding/] --> C2[Onboarding Page]
    B3[/dashboard/] --> C3[Dashboard (protected)]
    B4[/settings/] --> C4[Settings (protected)]
    B5[/sign-out/] --> H5[Clerk SignOut Handler]
  end

  H1 -->|Success| C1
  H2 -->|Success| C2
  H3 -->|Success| H1
  H4 -->|Accept| C2
  C2 -->|Onboarding Complete| C3

  C1 -.->|Not Authenticated| H1
  C3 -.->|Sign Out| H5
  C4 -.->|Sign Out| H5


---

## 🔍 Route & Handler Breakdown

| Route                        | Handler/Component                                  | Redirects/Logic                                      |
|------------------------------|----------------------------------------------------|------------------------------------------------------|
| `/sign-in`                   | Clerk SignIn (App Router or Clerk UI)              | On success → `/` or `/dashboard`                     |
| `/sign-up`                   | Clerk SignUp (App Router or Clerk UI)              | On success → `/onboarding`                           |
| `/forgot-password`           | Clerk Password Reset                               | On success → `/sign-in`                              |
| `/accept-invitation`         | `AcceptInvitationPage` | On success → `/onboarding` or `/dashboard`           |
| `/onboarding`                | Onboarding flow (protected, server/client)         | On complete → `/dashboard`                           |
| `/dashboard`, `/settings`    | Protected pages (middleware enforced)              | If not authenticated → `/sign-in`                    |
| `/sign-out`                  | Clerk SignOut handler                              | On success → `/sign-in`                              |

**Middleware:**  
- middleware.ts enforces authentication and redirects unauthenticated users to `/sign-in`.
- Onboarding is protected so users can't revisit after completion.

---

## 🕳️ Missing or Incomplete Flows

- **Forgot Password:** No explicit `/forgot-password` route found in app (relies on Clerk default?).
- **Sign-out:** No custom sign-out page; relies on Clerk handler.
- **Onboarding:** Flow is present, but ensure users can't skip onboarding by direct navigation.
- **Email Verification:** No explicit flow for email verification after sign-up.
- **Error Handling:** No custom error pages for auth failures (e.g., expired invitation, invalid token).
- **Multi-org Switching:** No explicit route/handler for switching organizations (if supported by Clerk).

---

## 🛠️ Recommendations

1. **Explicit Forgot Password Route:**  
   Add `/forgot-password` to the app for a branded reset experience, even if Clerk handles the backend.

2. **Custom Sign-out Page:**  
   Optionally add a sign-out confirmation or feedback page.

3. **Email Verification Flow:**  
   Ensure users verify their email before accessing protected routes. Add a `/verify-email` page if not handled by Clerk UI.

4. **Error Handling:**  
   Add custom error pages for:
   - Expired/invalid invitation
   - Auth errors (401/403)
   - Session expired

5. **Onboarding Enforcement:**  
   Double-check that users cannot bypass onboarding by navigating directly to `/dashboard` or other protected routes.

6. **Multi-org Support:**  
   If supporting multiple organizations per user, add a route/UI for org switching.

---

## 📂 Key Files

- middleware.ts
- app/(auth)/accept-invitation/page.tsx/accept-invitation/page.tsx)
- Clerk integration in app and auth
- Onboarding logic in onboarding

---

For more details on Clerk integration and session handling, see FleetFusion.Clerk.SessionClaimsandJWT.md.

---

**Summary:**  
Most core auth flows are present and enforced via middleware and Clerk. Add explicit routes for password reset, email verification, and error handling for a more robust and branded experience.