# FleetFusion Domain Architecture Audit & Development Prompts

## Executive Summary

This document provides a comprehensive audit of the FleetFusion multi-tenant fleet management
system's domain architecture and detailed development prompts for external LLM agents to continue
implementation work.

**Project Context:**

- Multi-tenant SaaS fleet management platform
- Built with Next.js 14, TypeScript, Prisma, PostgreSQL, Clerk Auth
- RBAC (Role-Based Access Control) with 6 user roles
- Tenant-isolated routing under `app/(tenant)/[orgId]/`
- 5 main business domains requiring development

## Domain Implementation Status Overview

| Domain     | Route                 | Implementation Status | Priority | Completion % |
| ---------- | --------------------- | --------------------- | -------- | ------------ |
| Analytics  | `/[orgId]/analytics`  | **COMPLETE**          | Medium   | 95%          |
| Compliance | `/[orgId]/compliance` | **ADVANCED**          | High     | 85%          |
| IFTA       | `/[orgId]/ifta`       | **COMPLETE**          | Medium   | 90%          |
| Settings   | `/[orgId]/settings`   | **MINIMAL**           | High     | 25%          |
| Admin      | **MISSING**           | **NOT STARTED**       | Critical | 0%           |

## Architecture Foundation

### Database Schema (Prisma)

The system uses a comprehensive PostgreSQL schema with the following key models:

- `Organization` - Multi-tenant isolation
- `User` - User management with RBAC
- `Driver` - Driver profiles and compliance
- `Vehicle` - Fleet vehicle management
- `Load` - Dispatch and load management
- `ComplianceDocument` - Document management
- `IftaReport`, `IftaTrip`, `IftaFuelPurchase` - IFTA reporting
- `ComplianceAlert` - Compliance monitoring
- `AuditLog` - System audit trail

### RBAC System

**User Roles:**

- `admin` - Full system access
- `dispatcher` - Load and driver management
- `driver` - Limited self-service access
- `compliance_officer` - Compliance oversight
- `accountant` - Financial and IFTA access
- `viewer` - Read-only access

**Permission Structure:**

- Action-based: `create`, `read`, `update`, `delete`, `manage`, `assign`, `approve`, `report`
- Resource-based: `user`, `driver`, `vehicle`, `load`, `document`, `ifta_report`, `organization`,
  `billing`

### Multi-Tenant Routing

- Protected routes under `app/(tenant)/[orgId]/`
- Middleware-enforced organization isolation
- Route-level RBAC protection via `RouteProtection.canAccessRoute()`

---

## DOMAIN 1: ANALYTICS DOMAIN

### Current Implementation Status: ✅ COMPLETE (95%)

**Strengths:**

- Comprehensive data fetching with caching (`analyticsFetchers.ts` - 546 lines)
- Complete page route with parallel data loading
- Multiple analytics components (6 components)
- Dashboard with revenue, performance, driver, and vehicle metrics
- Time-range filtering (30d default)

**Architecture:**

- **Route:** `app/(tenant)/[orgId]/analytics/page.tsx`
- **Fetchers:** `lib/fetchers/analyticsFetchers.ts`
- **Components:** `components/analytics/` (6 files)
- **Types:** `types/analytics.ts` (119 lines)

**Minor Gaps (5%):**

- Export functionality for reports
- Real-time dashboard updates
- Advanced filtering options
- Custom date range selection

---

## DOMAIN 2: COMPLIANCE DOMAIN

### Current Implementation Status: ⚡ ADVANCED (85%)

**Strengths:**

- Advanced HOS (Hours of Service) calculations
- Comprehensive document management
- Driver/vehicle compliance tracking
- Complex fetcher logic (`complianceFetchers.ts` - 877 lines)
- Alert system integration

**Architecture:**

- **Route:** `app/(tenant)/[orgId]/compliance/page.tsx`
- **Fetchers:** `lib/fetchers/complianceFetchers.ts`
- **Components:** `components/compliance/` (6 files)
- **Types:** `types/compliance.ts`
- **Schemas:** `schemas/compliance.ts`

**Gaps (15%):**

- Document upload functionality completion
- Automated compliance alerts
- DOT inspection management
- Advanced reporting capabilities

---

## DOMAIN 3: IFTA DOMAIN

### Current Implementation Status: ✅ COMPLETE (90%)

**Strengths:**

- Complete IFTA reporting workflow
- Trip logging and fuel purchase tracking
- Quarterly report generation
- Server actions for data management (`iftaActions.ts` - 120 lines)

**Architecture:**

- **Route:** `app/(tenant)/[orgId]/ifta/page.tsx`
- **Actions:** `lib/actions/iftaActions.ts`
- **Types:** `types/ifta.ts`
- **Schemas:** `schemas/ifta.ts`

**Minor Gaps (10%):**

- PDF report generation
- Tax calculation automation
- Jurisdiction tax rate management

---

## DOMAIN 4: SETTINGS DOMAIN

### Current Implementation Status: ⚠️ MINIMAL (25%)

**Critical Gaps:**

- Minimal server actions (`settingsActions.ts` - 11 lines only)
- Basic page implementation
- Missing core functionality
- Incomplete component ecosystem

**Architecture:**

- **Route:** `app/(tenant)/[orgId]/settings/page.tsx` (18 lines)
- **Actions:** `lib/actions/settingsActions.ts` (11 lines)
- **Components:** `components/settings/` (6 files)
- **Types:** `types/settings.ts` (9 lines)
- **Schemas:** `schemas/settings.ts`

**Required Implementation:**

- Organization profile management
- User preferences
- Notification settings
- Integration configurations
- Billing and subscription management
- System preferences

---

## DOMAIN 5: ADMIN DOMAIN

### Current Implementation Status: 🚨 NOT STARTED (0%)

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

# DEVELOPMENT PROMPTS FOR EXTERNAL LLM AGENTS

## PROMPT 1: SETTINGS DOMAIN COMPLETION

### Objective

Complete the Settings domain implementation to provide comprehensive organization and user
configuration management.

### Context

You are working on the FleetFusion multi-tenant fleet management system. The Settings domain is
currently minimal (25% complete) and requires significant development to provide essential
configuration capabilities.

### Technical Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk with RBAC
- **UI:** Tailwind CSS with shadcn/ui components
- **State Management:** React Server Components with Server Actions

### Current Implementation Status

- **Page Route:** `app/(tenant)/[orgId]/settings/page.tsx` (18 lines - basic structure)
- **Server Actions:** `lib/actions/settingsActions.ts` (11 lines - minimal)
- **Components:** 6 existing components in `components/settings/`
- **Types:** `types/settings.ts` (9 lines - minimal)
- **Schemas:** `schemas/settings.ts` (exists)

### Database Schema Context

The Organization model includes:

```prisma
model Organization {
  settings Json? @default("{\"fuelUnit\": \"gallons\", \"timezone\": \"America/Denver\", \"dateFormat\": \"MM/dd/yyyy\", \"distanceUnit\": \"miles\"}")
  subscriptionTier SubscriptionTier @default(free)
  subscriptionStatus SubscriptionStatus @default(trial)
  maxUsers Int @default(5)
  billingEmail String?
  // ... other fields
}
```

### RBAC Permissions Required

- `read:organization` - View settings
- `update:organization` - Modify settings
- `read:billing` - View billing information
- `manage:billing` - Manage subscriptions

### Development Tasks

#### 1. Enhance Server Actions (`lib/actions/settingsActions.ts`)

**Requirements:**

- Organization profile management (name, address, contact info, logo)
- System preferences (timezone, date format, units)
- User management settings (default roles, permissions)
- Notification preferences
- Integration settings (API keys, webhooks)
- Billing and subscription management
- Audit logging for all settings changes

**Implementation Details:**

- Use Zod schemas for validation
- Implement proper RBAC checks using `hasPermission`
- Add revalidation paths for cache updates
- Error handling with proper error types
- Support for file uploads (logo, documents)

#### 2. Complete Type Definitions (`types/settings.ts`)

**Requirements:**

- OrganizationSettings interface
- UserPreferences interface
- NotificationSettings interface
- IntegrationSettings interface
- BillingSettings interface
- SystemPreferences interface

#### 3. Expand Page Route (`app/(tenant)/[orgId]/settings/page.tsx`)

**Requirements:**

- Tab-based navigation (Organization, Users, Notifications, Integrations, Billing)
- Server-side data fetching for settings
- Proper loading states and error handling
- Responsive design with mobile support
- Integration with existing PageHeader component

#### 4. Enhance Components (`components/settings/`)

**Current Components to Enhance:**

- `settings-dashboard.tsx` - Main settings hub
- `company-settings.tsx` - Organization configuration
- `user-settings.tsx` - User preferences
- `notification-settings.tsx` - Notification configuration
- `integration-settings.tsx` - Third-party integrations
- `CompanyProfileForm.tsx` - Company profile editing

**Component Requirements:**

- Form validation with react-hook-form and Zod
- Real-time preview for changes
- Bulk operations support
- Export/import settings functionality
- Settings history and version control

#### 5. Add Fetcher Functions

**Create:** `lib/fetchers/settingsFetchers.ts` **Requirements:**

- Organization settings fetching with caching
- User preferences retrieval
- Notification settings loading
- Integration status checking
- Billing information fetching
- Settings audit trail

### User Experience Requirements

- **Progressive Disclosure:** Show advanced settings only when needed
- **Real-time Validation:** Immediate feedback on form inputs
- **Confirmation Dialogs:** For destructive actions
- **Bulk Operations:** Mass user management, settings import/export
- **Mobile Responsive:** Full functionality on mobile devices
- **Accessibility:** WCAG 2.1 AA compliance

### Integration Points

- **Clerk Integration:** User management and organization settings
- **Billing System:** Subscription and payment management
- **Webhook System:** External integrations and notifications
- **Audit System:** All settings changes logged
- **File Upload:** Logo and document management

### Testing Requirements

- Unit tests for all server actions
- Integration tests for settings workflows
- E2E tests for critical user journeys
- Permission testing for RBAC compliance

### Success Criteria

1. Complete settings management for organizations
2. User preference management
3. Notification configuration system
4. Integration management interface
5. Billing and subscription interface
6. Mobile-responsive design
7. Full RBAC compliance
8. Comprehensive audit logging

---

## PROMPT 2: ADMIN DOMAIN DEVELOPMENT

### Objective

Create the complete Admin domain for system administration and organization management.

### Context

You are working on the FleetFusion multi-tenant fleet management system. The Admin domain is
completely missing its page route and requires full implementation for system administration
capabilities.

### Technical Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk with RBAC
- **UI:** Tailwind CSS with shadcn/ui components

### Current Implementation Status

- **Page Route:** ❌ MISSING - `app/(tenant)/[orgId]/admin/page.tsx`
- **Server Actions:** ⚠️ PARTIAL - `lib/actions/adminActions.ts` (198 lines)
- **Feature Component:** ✅ EXISTS - `features/admin/AdminDashboard.tsx`
- **Components:** ✅ EXISTS - 3 user management components
- **Types:** Need creation for admin interfaces

### Existing Assets

```
lib/actions/adminActions.ts - Partial user management actions
features/admin/AdminDashboard.tsx - Basic dashboard component
components/admin/users/UserTable.tsx - User listing
components/admin/users/RoleAssignmentModal.tsx - Role management
components/admin/users/InviteUserForm.tsx - User invitation
```

### RBAC Permissions Required

- `manage:user` - User management
- `read:organization` - Organization overview
- `manage:billing` - Subscription management
- `read:audit` - Audit log access
- Admin role requirement for most features

### Development Tasks

#### 1. Create Main Admin Page Route

**Create:** `app/(tenant)/[orgId]/admin/page.tsx` **Requirements:**

- Multi-tab interface (Overview, Users, Billing, Audit, Settings)
- Organization statistics dashboard
- User management interface
- System health monitoring
- Recent activity feed
- Quick action buttons

#### 2. Enhance Server Actions (`lib/actions/adminActions.ts`)

**Current Actions:** Basic user CRUD operations **Additional Requirements:**

- Organization management actions
- Bulk user operations (invite, activate, deactivate)
- Role and permission management
- Billing and subscription actions
- Audit log retrieval and filtering
- System monitoring actions
- Data export functionality

#### 3. Create Admin-Specific Components

**New Components Needed:**

- `components/admin/AdminOverview.tsx` - Main dashboard
- `components/admin/OrganizationStats.tsx` - Org metrics
- `components/admin/AuditLogViewer.tsx` - Audit trail
- `components/admin/BillingManagement.tsx` - Subscription control
- `components/admin/SystemHealth.tsx` - System monitoring
- `components/admin/BulkUserActions.tsx` - Mass user operations

#### 4. Create Admin Types and Interfaces

**Create:** `types/admin.ts` **Requirements:**

- AdminDashboardData interface
- OrganizationStats interface
- UserManagementData interface
- AuditLogEntry interface
- BillingInfo interface
- SystemHealth interface

#### 5. Create Admin Fetchers

**Create:** `lib/fetchers/adminFetchers.ts` **Requirements:**

- Organization overview data
- User statistics and lists
- Audit log retrieval with filtering
- Billing information fetching
- System health metrics
- Activity feeds and notifications

### Admin Dashboard Features

#### Overview Tab

- Organization statistics (users, vehicles, drivers, loads)
- Revenue metrics and trends
- Recent activity feed
- System alerts and notifications
- Quick actions (invite user, create vehicle, etc.)

#### User Management Tab

- User list with filtering and search
- Role assignment and permission management
- Bulk user operations (invite, activate, deactivate)
- User activity monitoring
- Access control management

#### Billing Tab

- Subscription status and history
- Usage metrics and limits
- Payment method management
- Invoice generation and history
- Upgrade/downgrade subscription

#### Audit Tab

- Comprehensive audit log viewer
- Filtering by user, action, date, resource
- Export audit reports
- Compliance reporting
- Security event monitoring

#### System Settings Tab

- Organization-wide settings
- Feature flag management
- Integration configurations
- Data retention policies
- Security settings

### Technical Requirements

#### Security and Permissions

- Admin-only access with strict RBAC enforcement
- Audit logging for all admin actions
- Multi-factor authentication for sensitive operations
- Session management and timeout controls

#### Performance

- Efficient data loading with pagination
- Caching for frequently accessed data
- Optimized queries for large datasets
- Real-time updates for critical metrics

#### User Experience

- Intuitive navigation between admin functions
- Bulk operation capabilities
- Export functionality for all data
- Mobile-responsive design
- Comprehensive search and filtering

### Integration Requirements

- **Clerk Integration:** User and organization management
- **Billing System:** Subscription and payment handling
- **Audit System:** Comprehensive activity logging
- **Notification System:** Admin alerts and system notifications
- **Export System:** Data export and reporting capabilities

### Success Criteria

1. Complete admin page route implementation
2. Comprehensive user management interface
3. Organization administration capabilities
4. Billing and subscription management
5. Audit log viewing and reporting
6. System health monitoring
7. Security and compliance features
8. Mobile-responsive admin interface

---

## PROMPT 3: ANALYTICS DOMAIN ENHANCEMENT

### Objective

Enhance the Analytics domain to provide advanced business intelligence and real-time insights.

### Context

The Analytics domain is 95% complete with comprehensive data fetching and dashboard components.
Focus on adding advanced features and improving user experience.

### Current Strengths

- Complete data fetching with caching (546 lines)
- Multiple analytics components (6 components)
- Revenue, performance, driver, and vehicle metrics
- Time-range filtering capabilities

### Enhancement Tasks

#### 1. Advanced Filtering and Date Ranges

- Custom date range picker
- Comparative analysis (previous period)
- Advanced filtering by customer, route, driver
- Saved filter presets

#### 2. Export and Reporting

- PDF report generation
- Excel/CSV export functionality
- Scheduled reports via email
- Custom report builder

#### 3. Real-time Updates

- WebSocket integration for live metrics
- Real-time dashboard updates
- Live performance indicators
- Instant notifications for KPI changes

#### 4. Advanced Visualizations

- Interactive charts with drill-down capabilities
- Geographic analysis with maps
- Predictive analytics and forecasting
- Trend analysis and seasonality detection

#### 5. Mobile Optimization

- Touch-friendly chart interactions
- Optimized mobile layouts
- Offline data caching
- Progressive web app features

### Success Criteria

- Real-time dashboard functionality
- Advanced export capabilities
- Enhanced mobile experience
- Predictive analytics features

---

## PROMPT 4: COMPLIANCE DOMAIN COMPLETION

### Objective

Complete the Compliance domain to provide comprehensive regulatory compliance management.

### Context

The Compliance domain is 85% complete with advanced HOS calculations and document management. Focus
on completing missing features and enhancing user experience.

### Current Strengths

- Advanced HOS calculations (877 lines of fetcher logic)
- Document management system
- Compliance alert integration
- Driver/vehicle compliance tracking

### Completion Tasks

#### 1. Document Upload and Management

- Complete file upload functionality
- Document categorization and tagging
- Version control for documents
- Automated document expiration alerts

#### 2. Automated Compliance Monitoring

- Real-time compliance rule evaluation
- Automated alert generation
- Workflow automation for violations
- Integration with external compliance systems

#### 3. DOT Inspection Management

- Inspection scheduling and tracking
- Violation management and remediation
- Inspector communication tools
- Inspection history and analytics

#### 4. Advanced Reporting

- Compliance dashboard with KPIs
- Regulatory report generation
- Audit trail reporting
- Custom compliance reports

#### 5. Mobile Compliance Tools

- Mobile document upload
- Field compliance checks
- Offline compliance data sync
- Driver self-service portal

### Success Criteria

- Complete document upload system
- Automated compliance monitoring
- DOT inspection management
- Comprehensive reporting capabilities

---

## PROMPT 5: CROSS-DOMAIN INTEGRATION

### Objective

Ensure seamless integration between all domains and create a unified user experience.

### Context

After individual domain completion, focus on cross-domain functionality and system-wide
improvements.

### Integration Tasks

#### 1. Navigation and Routing

- Unified navigation system
- Role-based menu visibility
- Breadcrumb navigation
- Search across all domains

#### 2. Data Integration

- Cross-domain data sharing
- Unified data export
- Integrated reporting across domains
- Real-time data synchronization

#### 3. Notification System

- Unified notification center
- Cross-domain alerts
- Email and SMS notifications
- Notification preferences management

#### 4. Audit and Security

- System-wide audit logging
- Security monitoring across domains
- Compliance reporting integration
- Data retention policies

#### 5. Performance Optimization

- Global caching strategy
- Database query optimization
- CDN implementation
- Progressive loading strategies

### Success Criteria

- Seamless cross-domain navigation
- Unified user experience
- Integrated data and reporting
- Optimized system performance

---

## DEVELOPMENT PRIORITIES

### Phase 1: Critical Missing Components (Weeks 1-2)

1. **Admin Domain Creation** - Create missing page route and complete administration
2. **Settings Domain Completion** - Finish essential configuration management

### Phase 2: Feature Completion (Weeks 3-4)

3. **Compliance Domain Enhancement** - Complete document upload and automation
4. **Analytics Domain Enhancement** - Add export and real-time features

### Phase 3: Integration and Polish (Weeks 5-6)

5. **Cross-Domain Integration** - Unified navigation and data integration
6. **Performance Optimization** - System-wide improvements
7. **Testing and Quality Assurance** - Comprehensive testing suite

## TECHNICAL GUIDELINES FOR ALL DOMAINS

### Code Quality Standards

- TypeScript strict mode compliance
- Comprehensive error handling
- Proper loading and error states
- Responsive design implementation
- Accessibility compliance (WCAG 2.1 AA)

### Security Requirements

- RBAC enforcement on all routes
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection
- CSRF protection

### Performance Standards

- Server-side rendering for initial page loads
- Client-side caching for frequently accessed data
- Optimized database queries with proper indexing
- Image optimization and lazy loading
- Bundle size optimization

### Testing Requirements

- Unit tests for all server actions
- Integration tests for critical workflows
- E2E tests for user journeys
- Permission testing for RBAC compliance
- Performance testing for large datasets

This comprehensive audit and prompt system provides external LLM agents with detailed context and
specific implementation guidance for completing the FleetFusion domain architecture.
