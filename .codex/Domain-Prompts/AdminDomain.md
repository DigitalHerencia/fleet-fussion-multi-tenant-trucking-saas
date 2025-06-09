# DOMAIN: ADMIN DOMAIN

## Current Implementation Status: 🚨 NOT STARTED (0%)

**Critical Issues:**

- **NO PAGE ROUTE** - Missing `app/(tenant)/[orgId]/admin/page.tsx`
- Partial server actions (`adminActions.ts` - 198 lines)
- Feature component exists but no route integration
- Missing from navigation and routing

**Architecture Gaps:**

- **Missing Route:** `app/(tenant)/[orgId]/admin/page.tsx`
- **Partial Actions:** `lib/actions/adminActions.ts`
- **Feature:** `features/admin/AdminDashboard.tsx` (exists)
- **Components:** `components/admin/users/` (3 files)

**Required Implementation:**

- Complete admin dashboard page route
- User management interface
- Organization administration
- System monitoring
- Audit log management
- Permission management interface

---

# PROMPT: ADMIN DOMAIN DEVELOPMENT

## Objective

Create the complete Admin domain for system administration and organization management.

## Context

You are working on the FleetFusion multi-tenant fleet management system. The Admin domain is
completely missing its page route and requires full implementation for system administration
capabilities.

## Technical Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk with RBAC
- **UI:** Tailwind CSS with shadcn/ui components

## Current Implementation Status

- **Page Route:** ❌ MISSING - `app/(tenant)/[orgId]/admin/page.tsx`
- **Server Actions:** ⚠️ PARTIAL - `lib/actions/adminActions.ts` (198 lines)
- **Feature Component:** ✅ EXISTS - `features/admin/AdminDashboard.tsx`
- **Components:** ✅ EXISTS - 3 user management components
- **Types:** Need creation for admin interfaces

## Existing Assets

```
lib/actions/adminActions.ts - Partial user management actions
features/admin/AdminDashboard.tsx - Basic dashboard component
components/admin/users/UserTable.tsx - User listing
components/admin/users/RoleAssignmentModal.tsx - Role management
components/admin/users/InviteUserForm.tsx - User invitation
```

## RBAC Permissions Required

- `manage:user` - User management
- `read:organization` - Organization overview
- `manage:billing` - Subscription management
- `read:audit` - Audit log access
- Admin role requirement for most features

## Development Tasks

### 1. Create Main Admin Page Route

**Create:** `app/(tenant)/[orgId]/admin/page.tsx` **Requirements:**

- Multi-tab interface (Overview, Users, Billing, Audit, Settings)
- Organization statistics dashboard
- User management interface
- System health monitoring
- Recent activity feed
- Quick action buttons

### 2. Enhance Server Actions (`lib/actions/adminActions.ts`)

**Current Actions:** Basic user CRUD operations **Additional Requirements:**

- Organization management actions
- Bulk user operations (invite, activate, deactivate)
- Role and permission management
- Billing and subscription actions
- Audit log retrieval and filtering
- System monitoring actions
- Data export functionality

### 3. Create Admin-Specific Components

**New Components Needed:**

- `components/admin/AdminOverview.tsx` - Main dashboard
- `components/admin/OrganizationStats.tsx` - Org metrics
- `components/admin/AuditLogViewer.tsx` - Audit trail
- `components/admin/BillingManagement.tsx` - Subscription control
- `components/admin/SystemHealth.tsx` - System monitoring
- `components/admin/BulkUserActions.tsx` - Mass user operations

### 4. Create Admin Types and Interfaces

**Create:** `types/admin.ts` **Requirements:**

- AdminDashboardData interface
- OrganizationStats interface
- UserManagementData interface
- AuditLogEntry interface
- BillingInfo interface
- SystemHealth interface

### 5. Create Admin Fetchers

**Create:** `lib/fetchers/adminFetchers.ts` **Requirements:**

- Organization overview data
- User statistics and lists
- Audit log retrieval with filtering
- Billing information fetching
- System health metrics
- Activity feeds and notifications

## Admin Dashboard Features

### Overview Tab

- Organization statistics (users, vehicles, drivers, loads)
- Revenue metrics and trends
- Recent activity feed
- System alerts and notifications
- Quick actions (invite user, create vehicle, etc.)

### User Management Tab

- User list with filtering and search
- Role assignment and permission management
- Bulk user operations (invite, activate, deactivate)
- User activity monitoring
- Access control management

### Billing Tab

- Subscription status and history
- Usage metrics and limits
- Payment method management
- Invoice generation and history
- Upgrade/downgrade subscription

### Audit Tab

- Comprehensive audit log viewer
- Filtering by user, action, date, resource
- Export audit reports
- Compliance reporting
- Security event monitoring

### System Settings Tab

- Organization-wide settings
- Feature flag management
- Integration configurations
- Data retention policies
- Security settings

## Technical Requirements

### Security and Permissions

- Admin-only access with strict RBAC enforcement
- Audit logging for all admin actions
- Multi-factor authentication for sensitive operations
- Session management and timeout controls

### Performance

- Efficient data loading with pagination
- Caching for frequently accessed data
- Optimized queries for large datasets
- Real-time updates for critical metrics

### User Experience

- Intuitive navigation between admin functions
- Bulk operation capabilities
- Export functionality for all data
- Mobile-responsive design
- Comprehensive search and filtering

## Integration Requirements

- **Clerk Integration:** User and organization management
- **Billing System:** Subscription and payment handling
- **Audit System:** Comprehensive activity logging
- **Notification System:** Admin alerts and system notifications
- **Export System:** Data export and reporting capabilities

## Success Criteria

1. Complete admin page route implementation
2. Comprehensive user management interface
3. Organization administration capabilities
4. Billing and subscription management
5. Audit log viewing and reporting
6. System health monitoring
7. Security and compliance features
8. Mobile-responsive admin interface

