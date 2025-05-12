# Multi-Tenant Architecture in FleetFusion

This document explains the multi-tenant patterns used in FleetFusion for developers who are new to the project.

## Overview

FleetFusion uses a company-based multi-tenant architecture where each company (tenant) has isolated data and resources. This is implemented through a combination of:

1. Clerk Organizations for authentication/authorization
2. Database schema design for data isolation
3. Context providers for tenant-aware components

## Tenant Identification

Each tenant (trucking company) is represented by:

- A Clerk Organization in the auth system
- A Company record in the database with a `clerkOrgId` field
- A matching record in the `companies` table

## Data Isolation Patterns

### Database Level

- All tenant-specific tables include a `companyId` column as a foreign key
- All queries filter records by `companyId` to ensure data isolation
- Database constraints enforce referential integrity within tenant boundaries

Example table relationships:

```
companies
└── vehicles (companyId)
└── drivers (companyId)
└── loads (companyId)
└── documents (companyId)
```

### Application Level

The application enforces tenant isolation through:

1. **Company Context Provider**: Maintains the selected company in state

   - Located at: `context/company-context.tsx`
   - Exposes: `useCompany()` hook for components

2. **Auth-Aware Fetchers**: All data fetchers verify the user has access to the requested company

   - Example: `getCompanyByClerkOrgId()` in `lib/actions/companies.ts`

3. **Server Actions**: All mutations validate company access before executing
   - All company-specific actions require a valid company ID
   - Permissions are checked against the current user's role within that company

## Custom Hooks for Multi-Tenancy

- `useCurrentCompany()`: Returns the currently active company
- `useCurrentUser()`: Returns the current user with company-specific roles/permissions
- `useAuth()`: Abstracts Clerk authentication details and provides company-aware auth helpers

## Best Practices

When implementing new features:

1. Always include `companyId` in database entities for tenant-specific data
2. Use the `getCurrentCompanyId()` helper for server-side operations
3. Add foreign key constraints with CASCADE delete where appropriate
4. Use the `useCurrentCompany()` hook in client components
5. Verify company access in server actions and API routes

## Switching Between Tenants

Users can switch between companies they have access to via:

1. The company switcher component in the navigation
2. Organization selection during the sign-in flow

The application handles tenant switching by:

1. Updating the Clerk active organization
2. Refreshing data through server components
3. Maintaining separate permissions per company
