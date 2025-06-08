---
id: m1gd1dujaeemfdesjzq9g00
title: Webhook
desc: ''
updated: 1748754627439
created: 1748754032431
---
# Webhook Overview
FleetFusion uses Clerk webhooks to handle user events like sign-up, sign-in, and profile updates. These webhooks trigger server-side logic to manage user data and permissions in the FleetFusion system.

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

**Member** (`org:member`) *(Default role)*
- org:sys_memberships:read

## Session Claims

{
	"org.id": "{{org.id}}",
	"user.id": "{{user.id}}",
	"org.name": "{{org.name}}",
	"org.role": "{{org.role}}",
	"publicMetadata": {
		"onboardingComplete": "{{user.public_metadata.onboardingComplete}}"
	},
	"user.organizations": "{{user.organizations}}",
	"org_membership.permissions": "{{org_membership.permissions}}"
}

## Custom JWT - Neon:

{
	"org.id": "{{org.id}}",
	"user.id": "{{user.id}}",
	"org.name": "{{org.name}}",
	"org.role": "{{org.role}}",
	"publicMetadata": {
		"onboardingComplete": "{{user.public_metadata.onboardingComplete}}"
	},
	"user.organizations": "{{user.organizations}}",
	"org_membership.permissions": "{{org_membership.permissions}}"
}

## Webhook Subcribed Events:

email.created
organization.created
organization.deleted
organization.updated
organizationDomain.created
organizationDomain.deleted
organizationDomain.updated
organizationInvitation.accepted
organizationInvitation.created
organizationInvitation.revoked
organizationMembership.created
organizationMembership.deleted
organizationMembership.updated
permission.created
permission.deleted
permission.updated
role.created
role.deleted
role.updated
session.created
session.ended
session.pending
session.removed
session.revoked
user.created
user.deleted
user.updated

## Clerk Webhook URL

### Local Development

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_FRONTEND_API=driving-gelding-14.clerk.accounts.dev

NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://liberal-gull-quietly.ngrok-free.app/api/clerk/webhook-handler

### Production

NEXT_PUBLIC_APP_URL=http://fleet-fusion.vercel.app

NEXT_PUBLIC_CLERK_FRONTEND_API=driving-gelding-14.clerk.accounts.dev

NEXT_PUBLIC_CLERK_WEBHOOK_ENDPOINT=https://fleet-fusion.vercel.app/api/clerk/webhook-handler


## Event Payload Structure

### User Created Event Payload

```json:

{"data":{"id":"user_2xtKOmOKFZcYQ8kBGzxhPlrgBJv","banned":false,"locked":false,"object":"user","passkeys":[],"username":null,"has_image":false,"image_url":"https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd0JoTHNieURXRzJmV0FIZjJYNnFvQmQ4SUgiLCJyaWQiOiJ1c2VyXzJ4dEtPbU9LRlpjWVE4a0JHenhoUGxyZ0JKdiIsImluaXRpYWxzIjoiQVQifQ","last_name":"Test","created_at":1748751899098,"first_name":"Admin","updated_at":1748751899113,"external_id":null,"totp_enabled":false,"web3_wallets":[],"phone_numbers":[],"saml_accounts":[],"last_active_at":1748751899097,"mfa_enabled_at":null,"email_addresses":[{"id":"idn_2xtKOcsRaFBgAAGVksuIb6MMjju","object":"email_address","reserved":true,"linked_to":[],"created_at":1748751898964,"updated_at":1748751899101,"verification":null,"email_address":"digitalherencia@outlook.com","matches_sso_connection":false}],"last_sign_in_at":null,"mfa_disabled_at":null,"public_metadata":{},"unsafe_metadata":{},"password_enabled":true,"private_metadata":{},"external_accounts":[],"legal_accepted_at":null,"profile_image_url":"https://www.gravatar.com/avatar?d=mp","two_factor_enabled":false,"backup_code_enabled":false,"delete_self_enabled":true,"enterprise_accounts":[],"primary_web3_wallet_id":null,"primary_phone_number_id":null,"primary_email_address_id":"idn_2xtKOcsRaFBgAAGVksuIb6MMjju","lockout_expires_in_seconds":null,"create_organization_enabled":true,"verification_attempts_remaining":100},"type":"user.created","object":"event","timestamp":1748751899130,"instance_id":"ins_2wBhLsbyDWG2fWAHf2X6qoBd8IH","event_attributes":{"http_request":{"client_ip":"2603:8080:a200:372:d8ad:4156:ee07:b259","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0"}}}
```

### Organization Created Event Payload

```json

{"data":{"id":"org_2xtHWId18HISm4zUJTzVtJwEigw","name":"Test Trucking","slug":"test-trucking","object":"organization","logo_url":null,"has_image":false,"image_url":"https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd0JoTHNieURXRzJmV0FIZjJYNnFvQmQ4SUgiLCJyaWQiOiJvcmdfMnh0SFdJZDE4SElTbTR6VUpUelZ0SndFaWd3IiwiaW5pdGlhbHMiOiJUIn0","created_at":1748750479752,"created_by":"user_2xtHVEB6WD7Dpr8AqGrmVM9UiL1","updated_at":1748750479752,"public_metadata":{"mcNumber":"5689865445","dotNumber":"US DOT 1234567","companyName":"Test Trucking"},"private_metadata":{},"admin_delete_enabled":true,"max_allowed_memberships":5},"type":"organization.created","object":"event","timestamp":1748750479753,"instance_id":"ins_2wBhLsbyDWG2fWAHf2X6qoBd8IH","event_attributes":{"http_request":{"client_ip":"2603:8080:a200:372:d8ad:4156:ee07:b259","user_agent":"@clerk/nextjs@6.20.1"}}}
```

### Organization Membership Created Event Payload

```json
{"data":{"id":"orgmem_2xtKS7v97eo9g3TGqgyk1Wyxk74","role":"org:admin","object":"organization_membership","role_name":"Admin","created_at":1748751926436,"updated_at":1748751926436,"permissions":["org:sys_domains:read","org:sys_domains:manage","org:sys_profile:manage","org:sys_profile:delete","org:sys_memberships:read","org:sys_memberships:manage","org:admin:access_all_reports","org:admin:configure_company_settings","org:admin:view_audit_logs","org:admin:manage_users_and_roles","org:admin:view_edit_all_loads","org:sys_billing:manage","org:sys_billing:read"],"organization":{"id":"org_2xtKS56z1iD1EVaRTl9TEMizXs6","name":"Test Trucking","slug":"test-trucking","object":"organization","logo_url":null,"has_image":false,"image_url":"https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd0JoTHNieURXRzJmV0FIZjJYNnFvQmQ4SUgiLCJyaWQiOiJvcmdfMnh0S1M1NnoxaUQxRVZhUlRsOVRFTWl6WHM2IiwiaW5pdGlhbHMiOiJUIn0","created_at":1748751926429,"updated_at":1748751926429,"members_count":1,"public_metadata":{"mcNumber":"5689865445","dotNumber":"US DOT 1234567","companyName":"Test Trucking"},"admin_delete_enabled":true,"max_allowed_memberships":5,"pending_invitations_count":0},"public_metadata":{},"public_user_data":{"user_id":"user_2xtKOmOKFZcYQ8kBGzxhPlrgBJv","has_image":false,"image_url":"https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd0JoTHNieURXRzJmV0FIZjJYNnFvQmQ4SUgiLCJyaWQiOiJ1c2VyXzJ4dEtPbU9LRlpjWVE4a0JHenhoUGxyZ0JKdiIsImluaXRpYWxzIjoiQVQifQ","last_name":"Test","first_name":"Admin","identifier":"digitalherencia@outlook.com","profile_image_url":"https://www.gravatar.com/avatar?d=mp"}},"type":"organizationMembership.created","object":"event","timestamp":1748751926443,"instance_id":"ins_2wBhLsbyDWG2fWAHf2X6qoBd8IH","event_attributes":{"http_request":{"client_ip":"2603:8080:a200:372:d8ad:4156:ee07:b259","user_agent":"@clerk/nextjs@6.20.1"}}}

```

## Current DB Table Structure

Certainly! Below are Markdown tables representing the main tables and their columns from your ERD image. Each table lists the columns and their types (as visible).

---

### audit_logs

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| asset_id       | text, not null |
| activity_type  | text, not null |
| activity_id    | text, not null |
| author         | text, not null |
| changes        | jsonb, not null |
| metadata       | jsonb, not null |
| timestamp      | timestamp, not null |

---

### organizations

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| clerk_id       | text, not null |
| name           | text, not null |
| mc_number      | text, not null |
| dot_number     | text, not null |
| address        | text, not null |
| city           | text, not null |
| state          | text, not null |
| zip            | text, not null |
| phone          | text, not null |
| logo_url       | text, not null |
| subscription_tier | SubscriptionTier, not null |
| subscription_status | SubscriptionStatus, not null |
| billing_email  | text, not null |
| settings       | jsonb, not null |
| is_active      | bool, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |

---

### drivers

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| user_id        | text, not null |
| display_name   | text, not null |
| phone          | text, not null |
| email          | text, not null |
| license_number | text, not null |
| license_state  | text, not null |
| license_expiration | date, not null |
| license_class  | text, not null |
| dob            | date, not null |
| status         | DriverStatus, not null |
| background_check | bool, not null |
| emergency_contact | text, not null |
| medical_card_exp | date, not null |

---

### compliance_documents

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| driver_id      | text, not null |
| vehicle_id     | text, not null |
| document_type  | text, not null |
| document_number| text, not null |
| issuing_authority | text, not null |
| issue_date     | date, not null |
| expiration_date| date, not null |
| is_verified    | bool, not null |
| verified_at    | timestamp, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |

---

### users

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| clerk_id       | text, not null |
| organization_id| text, not null |
| first_name     | text, not null |
| last_name      | text, not null |
| profile_image  | text, not null |
| permissions    | jsonb, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |
| onboarding_steps | jsonb, not null |
| onboarding_complete | bool, not null |

---

### loads

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| driver_id      | text, not null |
| vehicle_id     | text, not null |
| load_number    | text, not null |
| customer_name  | text, not null |
| customer_phone | text, not null |
| customer_email | text, not null |
| pickup_address | text, not null |
| pickup_city    | text, not null |
| pickup_state   | text, not null |
| pickup_zip     | text, not null |
| pickup_date    | timestamp, not null |
| destination_address | text, not null |
| destination_city | text, not null |
| destination_state | text, not null |
| destination_zip | text, not null |
| destination_date | timestamp, not null |
| scheduled_delivery | timestamp, not null |
| delivered_at   | timestamp, not null |
| commodity      | text, not null |
| hazard         | bool, not null |
| total_miles    | int, not null |
| actual_miles   | int, not null |
| notes          | text, not null |
| custom_fields  | jsonb, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |

---

### vehicles

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| status         | VehicleStatus, not null |
| make           | text, not null |
| model          | text, not null |
| year           | int, not null |
| vin            | text, not null |
| license_plate  | text, not null |
| license_plate_state | text, not null |
| current_odometer | int, not null |
| last_odometer_service | int, not null |
| last_service_at | timestamp, not null |
| fuel_type      | text, not null |
| notes          | text, not null |
| custom_fields  | jsonb, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |
| registration_expiry | date, not null |

---

### ifta_reports

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| organization_id| text, not null |
| year           | int, not null |
| quarter        | int, not null |
| total_gallons  | numeric, not null |
| total_miles    | numeric, not null |
| submitted_by   | text, not null |
| submitted_at   | timestamp, not null |
| report_file_url| text, not null |
| calculation_data | jsonb, not null |
| created_at     | timestamp, not null |
| updated_at     | timestamp, not null |
| supporting_docs| jsonb, not null |

---

### webhook_events

| Column         | Type         |
|----------------|--------------|
| id             | text, not null |
| event_type     | text, not null |
| event_id       | text, not null |
| organization_id| text, not null |
| payload        | jsonb, not null |
| status         | text, not null |
| processed_at   | timestamp, not null |
| processed_error| text, not null |
| created_at     | timestamp, not null |
| retry_count    | int, not null |

---

### prisma_migrations

| Column         | Type         |
|----------------|--------------|
| id             | varchar(36), not null |
| checksum       | varchar(64), not null |
| finished_at    | timestamp, not null |
| migration_name | varchar(255), not null |
| rolled_back_at | timestamp, not null |
| started_at     | timestamp, not null |
| applied_steps_count | int, not null |

