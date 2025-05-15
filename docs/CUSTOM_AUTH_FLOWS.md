# Custom Authentication Flows and Integrations

This document summarizes the custom authentication flows and environment configuration for FleetFusion.

## 1. Environment Configuration (Dev & Prod)

- **Clerk Domain**: `driving-gelding-14.clerk.accounts.dev`
- **Dev URL**: `http://localhost:3000`
- **Prod URL**: `https://fleet-fusion.vercel.app`

### Dev (`.env.local`)
```dotenv
NEXT_PUBLIC_CLERK_FRONTEND_API=driving-gelding-14.clerk.accounts.dev
NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://liberal-gull-quietly.ngrok-free.app/api/clerk/webhook-handler
CLERK_WEBHOOK_SECRET=whsec_c6gzgp0U/O4A43X0CeBlu5vlScWLlWw8
```

### Prod (`.env.production`)
```dotenv
NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://fleet-fusion.vercel.app/api/clerk/webhook-handler
CLERK_WEBHOOK_SECRET=whsec_/pEFmkayO5Kuug2ooZ/98wSB0iSkU1Xw
```

## 2. Onboarding Flow

- **Onboarding Page** (`app/onboarding/page.tsx`):
  - Styled to match sign-in/sign-up pages.
  - Collects company name, DOT number, MC number, address, city, state, zip, phone, and email.
  - Uses a React 19 Server Action (`lib/actions/onboarding-actions.ts`) with Zod validation (`lib/validation/onboarding-schema.ts`).
  - On submit, updates Clerk publicMetadata for the user with onboardingComplete and company info.
  - After onboarding, user is redirected to dashboard and cannot access onboarding again.
  - ABAC and permissions are enforced via Clerk org roles and metadata.
  - Clerk webhook handler syncs org/user data to Neon DB for multi-tenancy.

Refer to Clerk docs: https://clerk.com/docs/custom-flows/organization-management

## 3. Roles, Permissions, and JWT Session Tokens (Clerk ABAC)

### Roles
- org:admin (Creator role, elevated permissions)
- org:compliance (Manages compliance documents and audits)
- org:dispatcher (Manages load assignments, schedules, and driver communication)
- org:driver (Views and updates assigned loads)
- org:member (Default, non-privileged)

### Permissions
- org:admin:access_all_reports
- org:admin:configure_company_settings
- org:admin:view_audit_logs
- org:admin:manage_users_and_roles
- org:admin:view_edit_all_loads
- org:admin:manage_billing
- org:compliance:view_compliance_dashboard
- org:compliance:access_audit_logs
- org:compliance:generate_compliance_reports
- org:compliance:upload_review_compliance_docs
- org:dispatcher:create_edit_loads
- org:dispatcher:assign_drivers
- org:dispatcher:view_driver_vehicle_status
- org:dispatcher:access_dispatch_dashboard
- org:driver:view_assigned_loads
- org:driver:update_load_status
- org:driver:upload_documents
- org:driver:log_hos
- org:sys_domains:read
- org:sys_domains:manage
- org:sys_profile:manage
- org:sys_profile:delete
- org:sys_memberships:read
- org:sys_memberships:manage
- org:sys_billing:manage

### JWT Session Token Mapping
- issuer: https://driving-gelding-14.clerk.accounts.dev
- endpoint: https://driving-gelding-14.clerk.accounts.dev/.well-known/jwks.json
- Claims:
  - org.id: {{org.id}}
  - user.id: {{user.id}}
  - org.role: {{org.role}}
  - org_membership.permissions: {{org_membership.permissions}}
  - org_membership.public_metadata: {{org.public_metadata}}

### ABAC Enforcement
- All permissions and roles are mapped in `lib/constants/permissions.ts`.
- Middleware and server actions check these claims for access control.
- Clerk publicMetadata and org roles are the source of truth for user access.

## 4. Forgot Password Flow

- **Login Page** (`app/sign-in/[[...sign-in]]/page.tsx`):
  - Added link:
    ```tsx
    <Link href="/forgot-password" className="text-blue-400 text-sm hover:underline">
      Forgot password?
    </Link>
    ```

- **Forgot Password Page** (`app/forgot-password/page.tsx`):
  - Implements two steps using Clerk's `useSignIn()` hook:
    1. **Request reset code** (strategy: `reset_password_email_code`)
    2. **Reset password** (submit code + new password)
  - Redirects to `/dashboard` on success.
  - Shows loading state and error messages per step.

Refer to Clerk docs: https://clerk.com/docs/custom-flows/forgot-password

## 5. Sign Out Integration

- **SignOut Button** Component: `components/sign-out-button.tsx`
  ```tsx
  'use client'
  import { useClerk } from '@clerk/nextjs'
  import { Button } from './ui/button'

  export const SignOutButton = () => {
    const { signOut } = useClerk()
    return (
      <Button onClick={() => signOut({ redirectUrl: '/' })}>
        Sign out
      </Button>
    )
  }
  ```

- **Main Navigation** (Protected) in `components/dashboard/main-nav.tsx`:
  ```tsx
  {/* Sign Out Button (Clerk) */}
  <div className="ml-2">
    {typeof window !== 'undefined' && SignOutButton ? <SignOutButton /> : null}
  </div>
  ```

Refer to Clerk docs: https://clerk.com/docs/custom-flows/sign-out

## 6. Neon Database Integration

- Using Drizzle ORM with Neon Serverless:
  - `db/db.ts` sets up `drizzle(pool, { schema })`
  - `schema.ts` defines multi-tenant tables with `companyId` and CASCADE relations.

Refer to Clerk docs: https://clerk.com/docs/integrations/databases/neon

## 7. Webhook Data Sync

- **Webhook Handler**: `app/api/clerk/webhook-handler/route.ts`
  - Verifies `svix` signature using `CLERK_WEBHOOK_SECRET`
  - Handles `organization.*`, `organizationMembership.*`, and `user.*` events
  - Syncs changes to `companies` and `company_users` tables

Refer to Clerk docs: https://clerk.com/docs/webhooks/sync-data

## 8. Multi-Tenant Architecture

- Uses Clerk Organizations + `companies` table (field: `clerkOrgId`)
- Tenant isolation via `companyId` foreign key on all tables
- `CompanyContext` (`context/company-context.tsx`) exposes `companyId` to components

Refer to Clerk docs: https://clerk.com/docs/guides/multi-tenant-architecture
