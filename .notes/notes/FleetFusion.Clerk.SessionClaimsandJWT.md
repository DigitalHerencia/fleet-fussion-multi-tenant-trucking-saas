---
id: byw07mcf7jlw2ksdaw5f8x5
title: SessionClaimsandJWT
desc: ''
updated: 1748311694106
created: 1748309991987
---

# Clerk Information

## User Authentication Options:

- Email address: Enabled. Users can add email addresses to their accounts.
- Require email during sign-up: Enabled. Users must provide and maintain an email address.
- Username: Enabled. Users can set a username.
- First and last name: Enabled. Users can set their first and last name.
- Require first and last name: Disabled. Not required at sign-up.

## Roles and Permissions

**Admin** (`org:admin`)

- org:sys_domains:read
- org:sys_domains:manage
- org:sys_profile:manage
- org:sys_profile:delete
- org:sys_memberships:read
- org:sys_memberships:manage
- org:admin:access_all_reports
- org:admin:configure_company_settings
- org:admin:view_audit_logs
- org:admin:manage_users_and_roles
- org:admin:view_edit_all_loads
- org:sys_billing:manage
- org:sys_billing:read

**Compliance** (`org:compliance`)

- org:sys_memberships:read
- org:compliance:view_compliance_dashboard
- org:compliance:access_audit_logs
- org:compliance:generate_compliance_req
- org:compliance:upload_review_compliance

**Dispatcher** (`org:dispatcher`)

- org:sys_memberships:read
- org:dispatcher:create_edit_loads
- org:dispatcher:assign_drivers
- org:dispatcher:view_driver_vehicle_status
- org:dispatcher:access_dispatch_dashboard

**Driver** (`org:driver`)

- org:sys_memberships:read
- org:driver:view_assigned_loads
- org:driver:update_load_status
- org:driver:upload_documents
- org:driver:log_hos

**Member** (`org:member`) _(Default role)_

- org:sys_memberships:read

## Session Claims

{ "org.id": "{{org.id}}", "user.id": "{{user.id}}", "org.name": "{{org.name}}", "org.role":
"{{org.role}}", "publicMetadata": { "onboardingComplete":
"{{user.public_metadata.onboardingComplete}}" }, "user.organizations": "{{user.organizations}}",
"org_membership.permissions": "{{org_membership.permissions}}" }

## Custom JWT - Neon:

{ "org.id": "{{org.id}}", "user.id": "{{user.id}}", "org.name": "{{org.name}}", "org.role":
"{{org.role}}", "publicMetadata": { "onboardingComplete":
"{{user.public_metadata.onboardingComplete}}" }, "user.organizations": "{{user.organizations}}",
"org_membership.permissions": "{{org_membership.permissions}}" }

## Webhook Subcribed Events:

email.created organization.created organization.deleted organization.updated
organizationDomain.created organizationDomain.deleted organizationDomain.updated
organizationInvitation.accepted organizationInvitation.created organizationInvitation.revoked
organizationMembership.created organizationMembership.deleted organizationMembership.updated
permission.created permission.deleted permission.updated role.created role.deleted role.updated
session.created session.ended session.pending session.removed session.revoked user.created
user.deleted user.updated

## Clerk Webhook URL

### Local Development

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_FRONTEND_API=driving-gelding-14.clerk.accounts.dev

NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://liberal-gull-quietly.ngrok-free.app/api/clerk/webhook-handler

### Production

NEXT_PUBLIC_APP_URL=http://fleet-fusion.vercel.app

NEXT_PUBLIC_CLERK_FRONTEND_API=driving-gelding-14.clerk.accounts.dev

NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://fleet-fusion.vercel.app/api/clerk/webhook-handler
