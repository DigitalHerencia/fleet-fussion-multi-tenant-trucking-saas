---
id: zj86geucc3q0c2prc4404fm
title: TODO
desc: ''
updated: 1748297063708
created: 1748297035879
---
# ✅ **FleetFusion Project Setup TODO**

---

## 🗂️ Task Overview:

This task involves restructuring your Next.js 15, React 19, TypeScript 5, TailwindCSS 4, and ShadCN UI project to create a modern, fully-featured multi-tenant ABAC SaaS Transportation Management System (TMS). Your target users are freight and logistics SMEs in Southern New Mexico.

Ensure a complete integration using Clerk for Attribute-Based Access Control (ABAC) authentication and Neon PostgreSQL as your primary database, synchronized via Clerk webhooks.

---

## ✅ **Order of Completion & Detailed Instructions:**

### 1️⃣ **Setup and Scaffolding:**

* **Restructure my directory clearly by domain**, adapting this structure to align with modern standards:

  ```
  /
  ├── public/            # Marketing & legal: terms, privacy, refund, pricing, about, features, services, contact, blog
  ├── app/               # Next.js App Router: routes, pages, layouts
  ├── components/        # Dumb, reusable UI components (e.g., buttons, inputs)
  ├── features/          # Smart UI components with business logic (e.g., <UserProfile />, <OrderForm />)
  ├── lib/               # Core business logic, utilities, data fetching, server actions
  │   ├── actions/       # Server Actions for mutations (e.g., createUser, updateOrder)
  │   ├── fetchers/      # Data fetching functions (e.g., getProducts, getOrderDetails)
  │   ├── utils/         # Utility functions (e.g., formatters, validators)
  │   ├── database/      # Database schema, migrations, connection, queries (Drizzle ORM)
  │   └── webhooks/      # Webhook handlers (e.g., Clerk, Stripe)
  ├── styles/            # Global styles, Tailwind CSS base, CSS custom properties/tokens
  ├── types/             # Shared TypeScript type definitions and interfaces
  ├── config/            # Configuration files (e.g., Tailwind, Next.js, PostCSS, Drizzle)
  ├── db/                # Database related files (e.g., schema, migrations, seeds) - consider merging relevant parts into lib/database/ and config/
  ├── middleware.ts      # Next.js middleware for routing, authentication
  ├── next.config.mjs    # Next.js configuration
  ├── tailwind.config.ts # Tailwind CSS configuration
  ├── tsconfig.json      # TypeScript configuration
  └── README.md          # Project documentation
  ```
* **Initialize Drizzle ORM** and set up the database schema in `lib/database/schema.ts`.
    * Define tables for `companies`, `users`, `roles`, `permissions`, `vehicles`, `drivers`, `loads`, `documents`, `settings`, `subscriptions`, `audit_logs`, etc.
    * Ensure relationships between tables are correctly defined (e.g., a `company` has many `users`, a `user` has one `role`).
* **Configure Drizzle Kit** for migrations in `drizzle.config.ts`.
* **Set up Neon PostgreSQL** as the database provider.
    * Store connection string securely in environment variables.
* **Integrate Clerk for authentication**:
    * Configure Clerk for multi-tenancy using organizations.
    * Implement ABAC (Attribute-Based Access Control) using Clerk roles and permissions.
    * Set up Clerk webhooks to synchronize user and organization data with your Neon database (`/app/api/webhooks/clerk/route.ts` and `lib/webhooks/clerk.ts`).
        * On `organization.created`, create a corresponding `company` in your database.
        * On `user.created`, associate the user with their `company` and assign a default role.
        * Handle other relevant events like `user.updated`, `organization.updated`, `organizationMembership.created`, etc.
* **Implement basic UI components** using ShadCN UI and Tailwind CSS:
    * Create a consistent layout structure (`app/(protected)/layout.tsx`, `app/(public)/layout.tsx`).
    * Develop navigation components (`components/main-nav.tsx`, `components/user-nav.tsx`).
    * Style forms, buttons, tables, and other common UI elements.
* **Set up Tailwind CSS 4** according to the new CSS-first theming approach:
    * Define design tokens (CSS custom properties for colors, spacing, radius, etc.) in `app/globals.css` within `:root`.
    * Use `hsl(var(--token))` for colors in Tailwind utility classes.
    * Ensure `darkMode: 'class'` is enabled in `tailwind.config.ts`.
* **Create initial pages** for key areas:
    * Public: Landing, About, Pricing, Contact
    * Auth: Sign In, Sign Up
    * App (Protected): Dashboard, Settings

### 2️⃣ **Core Feature Development (TMS Specific):**

*   **Company & Tenant Management (Aligns with `Settings`, `Auth`, and `Onboarding` Domains):**
    *   **Architectural Overview:** Manage company profiles, tenant-specific configurations, and initial setup post-organization creation via Clerk.
    *   **Core Functionality:**
        *   Allow users (typically admins) to manage their company profile (details, logo, branding elements like primary color, address, contact info).
        *   Implement logic for tenant isolation in all database queries and data handling.
        *   Handle initial company setup during or after the onboarding flow.
    *   **UI Components (`components/settings/`, `components/shared/ui/`):**
        *   Develop `CompanyProfileForm` for editing company details.
        *   Create UI elements for managing tenant-specific settings (e.g., notification preferences, integration settings).
    *   **Business Logic/Features (`features/settings/`, `app/(tenant)/[orgId]/settings/company`):**
        *   Implement `CompanySettingsPage` to host the company profile form and related settings.
        *   Logic to apply branding (e.g., primary color) across the tenant's UI.
    *   **Server Actions (`lib/actions/settingsActions.ts`, `lib/actions/onboardingActions.ts`):**
        *   `updateCompanyProfileAction(orgId, data)`: Saves changes to the company profile.
        *   Actions to handle initial company data setup during onboarding.
        *   Ensure actions validate input and respect user permissions.
    *   **Fetchers (`lib/fetchers/settingsFetchers.ts`):**
        *   `getCompanyProfile(orgId)`: Retrieves company details for display.
        *   `getTenantSettings(orgId)`: Fetches various tenant-specific configurations.
    *   **Types & Validations (`types/settings.ts`, `validations/settings.ts`):**
        *   Define types for company profiles and tenant settings.
        *   Create Zod schemas for validating company profile forms.

*   **User & Role Management (within a tenant) (Aligns with `Auth`, `Admin` Domains):**
    *   **Architectural Overview:** Manage users, their roles, and permissions within an organization, leveraging Clerk for core user data and ABAC.
    *   **Core Functionality:**
        *   Allow tenant admins to invite new users to their organization.
        *   Provide views to list, search, and manage users within their organization.
        *   Implement UI for assigning and managing user roles (e.g., admin, dispatcher, driver, compliance) based on pre-defined ABAC policies.
        *   Synchronize user data (including roles/permissions metadata) with Clerk and the local database.
    *   **UI Components (`components/auth/`, `components/admin/users/`, `components/shared/ui/`):**
        *   `UserTable` for displaying list of users with roles.
        *   `InviteUserForm` for sending invitations.
        *   `RoleAssignmentModal` for changing user roles.
    *   **Business Logic/Features (`features/admin/users/`, `app/(tenant)/[orgId]/settings/users/`):**
        *   `UserManagementDashboard` to host user table, invitation forms.
        *   Logic to interact with Clerk for user invitations and role updates via metadata.
    *   **Server Actions (`lib/actions/userActions.ts`, `lib/actions/authActions.ts`):**
        *   `inviteUserAction(orgId, email, role)`
        *   `updateUserRoleAction(orgId, userId, newRole)` (updates Clerk metadata and local DB)
        *   `removeUserFromOrgAction(orgId, userId)`
    *   **Fetchers (`lib/fetchers/userFetchers.ts`, `lib/fetchers/authFetchers.ts`):**
        *   `listOrganizationUsers(orgId)` (fetches from Clerk and/or local DB)
        *   `getUserDetails(orgId, userId)`
    *   **Types & Validations (`types/auth.ts`, `types/abac.ts`, `validations/auth.ts`):**
        *   Define types for user profiles with roles and permissions.
        *   Validation for invitation forms.

*   **Onboarding Process Management (Aligns with `Onboarding` Domain):**
    *   **Architectural Overview:** Guide new users/organizations through initial setup after registration.
    *   **Core Functionality:**
        *   Multi-step onboarding wizard for users to complete their profile.
        *   Tenant admins to set up initial company details, if not done via Clerk organization creation.
        *   Configure essential settings (e.g., default currency, timezone) during onboarding.
    *   **UI Components (`components/onboarding/`, `components/shared/ui/`):**
        *   `OnboardingWizard` main component.
        *   `OnboardingStepIndicator`.
        *   Forms for each onboarding step (e.g., `ProfileSetupFormFields`, `CompanySetupFormFields`).
    *   **Business Logic/Features (`features/onboarding/`, `app/(auth)/onboarding/`):**
        *   Parent component managing onboarding flow, state, and step transitions.
    *   **Server Actions (`lib/actions/onboardingActions.ts`):**
        *   `submitOnboardingStepAction(step, data)`: Persists data for each step.
        *   Action to mark onboarding as complete for a user/organization.
    *   **Fetchers (`lib/fetchers/onboardingFetchers.ts`):**
        *   `getOnboardingStatus(userId, orgId)`: To resume onboarding if incomplete.
    *   **Types & Validations (`types/onboarding.ts`, `validations/onboarding.ts`):**
        *   Types for onboarding state and step data.
        *   Validation schemas for each onboarding step's form.

*   **Vehicle Management (Aligns with `Vehicles` Domain):**
    *   **Architectural Overview:** Manage fleet vehicles, including their details, status, and related documentation.
    *   **Core Functionality:**
        *   CRUD operations for vehicles (tractors, trailers).
        *   Track vehicle details (VIN, make, model, year, status, current location (manual/integrated), registration, insurance, maintenance schedules).
        *   Associate vehicles with the tenant organization.
    *   **UI Components (`components/vehicles/`, `components/shared/ui/`):**
        *   `VehicleCard` for summary display in lists.
        *   `VehicleForm` for adding/editing vehicle details.
        *   `VehicleDataTable` for tabular view with sorting/filtering.
        *   `VehicleStatusBadge`.
    *   **Business Logic/Features (`features/vehicles/`, `app/(tenant)/[orgId]/vehicles/`):**
        *   `VehicleListPage` to display all vehicles.
        *   `VehicleDetailsPage` showing comprehensive info, including linked documents, maintenance history.
        *   `AddVehicleFeature` and `EditVehicleFeature` orchestrating the forms and actions.
    *   **Server Actions (`lib/actions/vehicleActions.ts`):**
        *   `createVehicleAction(orgId, data)`
        *   `updateVehicleAction(vehicleId, data)`
        *   `deleteVehicleAction(vehicleId)`
        *   Actions for updating vehicle status (e.g., "In Maintenance", "Available").
    *   **Fetchers (`lib/fetchers/vehicleFetchers.ts`):**
        *   `getVehicleById(vehicleId)`
        *   `listVehiclesByOrg(orgId, filters)`
        *   `getVehicleMaintenanceSchedule(vehicleId)`
    *   **Types & Validations (`types/vehicles.ts`, `validations/vehicles.ts`):**
        *   Define `Vehicle` type and related types (e.g., `MaintenanceRecord`).
        *   Zod schemas for vehicle form validation.

*   **Driver Management (Aligns with `Drivers` Domain):**
    *   **Architectural Overview:** Manage driver profiles, qualifications, compliance documents, and assignments.
    *   **Core Functionality:**
        *   CRUD operations for drivers.
        *   Track driver details (CDL info, contact info, address, employment status, emergency contacts, pay rates).
        *   Manage driver compliance documents (licenses, medical cards - links to Document Management).
        *   View driver assignment history and current load.
    *   **UI Components (`components/drivers/`, `components/shared/ui/`):**
        *   `DriverCard` for list views. (As in `components/drivers/driver-card.tsx`)
        *   `DriverForm` for adding/editing driver profiles.
        *   `DriverDataTable` for tabular display.
        *   `DriverDetailsDialog` for quick view. (As in `components/drivers/driver-details-dialog.tsx`)
    *   **Business Logic/Features (`features/drivers/`, `app/(tenant)/[orgId]/drivers/`):**
        *   `DriverListPage` with search and filtering.
        *   `DriverProfilePage` showing all details, documents, HOS status, assigned loads.
    *   **Server Actions (`lib/actions/driverActions.ts`):**
        *   `createDriverAction(orgId, data)`
        *   `updateDriverAction(driverId, data)`
        *   `deleteDriverAction(driverId)`
        *   Actions for updating driver status (e.g., "On Duty", "Off Duty", "On Leave").
    *   **Fetchers (`lib/fetchers/driverFetchers.ts`):**
        *   `getDriverById(driverId)`
        *   `listDriversByOrg(orgId, filters)`
        *   `getDriverComplianceSummary(driverId)`
    *   **Types & Validations (`types/drivers.ts`, `validations/drivers.ts`):**
        *   Define `Driver` type and related information.
        *   Zod schemas for driver form validation.

*   **Load Management (Dispatch) (Aligns with `Dispatch` Domain):**
    *   **Architectural Overview:** Core of TMS operations, managing loads from creation to delivery.
    *   **Core Functionality:**
        *   CRUD operations for loads.
        *   Track load details (origin, destination, shipper, consignee, customer, dates/times, cargo type, weight, dimensions, rate, status).
        *   Assign loads to drivers and vehicles.
        *   Implement a dispatch board/calendar view for visualizing and managing load assignments.
        *   Update load statuses (e.g., "Booked", "Assigned", "In Transit", "Delivered", "Invoiced", "Paid").
    *   **UI Components (`components/dispatch/`, `components/shared/ui/`):**
        *   `LoadCard` for dispatch board items. (As in `components/dispatch/load-card.tsx`)
        *   `LoadForm` for creating/editing loads. (As in `components/dispatch/load-form.tsx`)
        *   `DispatchBoard` (interactive, potentially drag-and-drop). (As in `components/dispatch/dispatch-board.tsx`)
        *   `LoadDetailsDialog` for quick view. (As in `components/dispatch/load-details-dialog.tsx`)
        *   `LoadStatusBadge`.
    *   **Business Logic/Features (`features/dispatch/`, `app/(tenant)/[orgId]/dispatch/`):**
        *   `InteractiveDispatchBoardFeature` managing load assignments.
        *   `CreateLoadFeature` and `EditLoadFeature`.
        *   `LoadTrackingPage` to show current status and history of a load.
    *   **Server Actions (`lib/actions/dispatchActions.ts`):**
        *   `createLoadAction(orgId, data)`
        *   `updateLoadAction(loadId, data)`
        *   `assignLoadAction(loadId, driverId, vehicleId)`
        *   `updateLoadStatusAction(loadId, newStatus, eventDetails)`
    *   **Fetchers (`lib/fetchers/dispatchFetchers.ts`):**
        *   `getLoadById(loadId)`
        *   `listLoadsByOrg(orgId, filters, dateRange)`
        *   `getActiveLoadsForDispatchBoard(orgId)`
        *   `getAvailableDriversForLoad(orgId, loadRequirements)`
        *   `getAvailableVehiclesForLoad(orgId, loadRequirements)`
    *   **Types & Validations (`types/dispatch.ts`, `validations/dispatch.ts`):**
        *   Define `Load`, `ShipmentLeg`, `LoadStatusEvent` types.
        *   Zod schemas for load creation and update forms.

*   **✅ Compliance & Document Management (Aligns with `Compliance` Domain):** **COMPLETED**
    *   **✅ Architectural Overview:** Complete regulatory compliance system including HOS, vehicle maintenance, DVIR reports, safety events, and comprehensive document management.
    *   **✅ Core Functionality (General Document Management):**
        *   Comprehensive document management for vehicles, drivers, loads (BOLs, PODs, insurance certs, registration, contracts).
        *   Advanced categorization with 40+ document types, tagging, and expiry tracking.
        *   Automatic alert system for expiring documents with configurable thresholds.
    *   **✅ Core Functionality (Compliance Specific):**
        *   Complete HOS (Hours of Service) tracking with ELD integration support, violation detection, and automated alerts.
        *   Comprehensive DVIR (Driver Vehicle Inspection Reports) with defect tracking and severity classification.
        *   Advanced maintenance scheduling, automated alerts, and comprehensive maintenance history tracking.
        *   Complete safety event management with severity classification and investigation tracking.
        *   Real-time compliance monitoring with automated violation detection and alert generation.
    *   **✅ Types & Data Models (`types/compliance.ts`):**
        *   **ComplianceDocument**: 40+ document types, status tracking, metadata, relationships
        *   **HOSLog**: Comprehensive duty status tracking, ELD integration, violation detection
        *   **DVIRReport**: Complete inspection workflow with defect management
        *   **MaintenanceRecord**: Full maintenance lifecycle with scheduling and cost tracking
        *   **SafetyEvent**: Incident management with investigation workflow
        *   **ComplianceAlert**: Real-time notification system with severity classification
    *   **✅ Validation Schemas (`validations/compliance.ts`):**
        *   Complete Zod validation for all compliance operations with comprehensive field validation
        *   Advanced filtering schemas with 15+ filter options for each domain
        *   Bulk operation validation with error handling and rollback support
    *   **✅ Server Actions (`lib/actions/complianceActions.ts`):**
        *   **Document Management**: Full CRUD with permissions, audit logging, duplicate detection
        *   **HOS Management**: Log creation with overlap detection, violation checking, real-time status updates
        *   **DVIR Management**: Report creation with defect tracking, automatic maintenance alerts
        *   **Maintenance Management**: Record creation with scheduling, cost tracking, vehicle updates
        *   **Safety Events**: Incident reporting with severity-based alert generation
        *   **Alert Management**: Mark as read/dismissed, bulk operations, automated cleanup
        *   **Advanced Features**: HOS violation detection, automatic alert generation, audit trails
    *   **✅ Data Fetchers (`lib/fetchers/complianceFetchers.ts`):**
        *   **Document Queries**: Advanced filtering, pagination, search, expiry tracking
        *   **HOS Analytics**: Driver status calculation, violation tracking, compliance metrics
        *   **DVIR Analytics**: Defect rate analysis, inspection frequency tracking
        *   **Maintenance Analytics**: Cost analysis, scheduling optimization, utilization tracking
        *   **Safety Analytics**: Incident rate tracking, severity analysis, trend identification
        *   **Compliance Overview**: Real-time dashboard data, KPI calculation, alert summaries
        *   **Advanced Features**: Multi-domain filtering, statistical analysis, compliance scoring

*   **IFTA Management (Aligns with `IFTA` Domain):**
    *   **Architectural Overview:** Specifically handle International Fuel Tax Agreement requirements.
    *   **Core Functionality:**
        *   Track mileage per jurisdiction for each vehicle.
        *   Record fuel purchases per jurisdiction.
        *   Generate IFTA reports for quarterly filing.
    *   **UI Components (`components/ifta/`, `components/shared/ui/`):**
        *   `IftaReportForm` for generating reports.
        *   `MileageLogForm` / `FuelPurchaseLogForm`.
        *   `IftaDataTable` for displaying trip/fuel data. (As in `components/ifta/ifta-trip-table.tsx`, `ifta-report-table.tsx`)
        *   `IftaDashboard`. (As in `components/ifta/ifta-dashboard.tsx`)
    *   **Business Logic/Features (`features/ifta/`, `app/(tenant)/[orgId]/ifta/`):**
        *   `IftaReportingFeature` to manage data entry and report generation.
    *   **Server Actions (`lib/actions/iftaActions.ts`):**
        *   `logIftaTripDataAction(orgId, vehicleId, tripData)`
        *   `logFuelPurchaseAction(orgId, vehicleId, purchaseData)`
        *   `generateIftaReportAction(orgId, quarter, year)`
    *   **Fetchers (`lib/fetchers/iftaFetchers.ts`):**
        *   `getIftaDataForPeriod(orgId, quarter, year)`
        *   `listVehicleTripsForIfta(vehicleId, dateRange)`
    *   **Types & Validations (`types/ifta.ts`, `validations/ifta.ts`):**
        *   Define `IftaTrip`, `FuelPurchase`, `IftaReport` types.
        *   Zod schemas for data entry forms.

*   **Basic Analytics & Dashboard (Aligns with `Analytics` Domain):**
    *   **Architectural Overview:** Present key performance indicators and operational insights.
    *   **Core Functionality:**
        *   Display key metrics for fleet operations (e.g., vehicle utilization, driver performance, load profitability, revenue per mile, fuel efficiency).
        *   Provide a main dashboard summarizing critical information.
        *   Allow basic filtering of analytics data (e.g., by date range, driver, vehicle).
    *   **UI Components (`components/analytics/`, `components/dashboard/`, `components/shared/ui/`):**
        *   `MetricCard` for displaying individual KPIs. (e.g., `components/dashboard/dashboard-cards.tsx`)
        *   `SimpleBarChart`, `LineChart`, `PieChart` for visualizing data. (e.g., `components/analytics/performance-metrics.tsx` might use these)
        *   `AnalyticsDataTable` for presenting tabular data.
        *   `DateRangePicker` and other filter controls.
    *   **Business Logic/Features (`features/analytics/`, `app/(tenant)/[orgId]/dashboard/`, `app/(tenant)/[orgId]/analytics/`):**
        *   `MainDashboardFeature` composing various metric cards and charts.
        *   Specific analytic views like `DriverPerformanceDashboard`, `VehicleUtilizationReport`.
    *   **Server Actions (`lib/actions/analyticsActions.ts`):**
        *   (Less common for display) `saveDashboardPreferencesAction(userId, orgId, preferences)` if customizable dashboards are implemented.
        *   `triggerReportGenerationAction(orgId, reportType, params)` if reports are generated asynchronously.
    *   **Fetchers (`lib/fetchers/analyticsFetchers.ts`):**
        *   `getDashboardSummary(orgId)`
        *   `getVehicleUtilizationStats(orgId, dateRange)`
        *   `getDriverPerformanceMetrics(orgId, driverId, dateRange)`
        *   `getLoadProfitabilityData(orgId, dateRange)`
    *   **Types & Validations (`types/analytics.ts`, `validations/analytics.ts`):**
        *   Define types for analytics data points, chart data structures.
        *   Zod schemas if there are forms for custom report parameters.

*   **Settings Management (Aligns with `Settings` Domain, distinct from Company Profile):**
    *   **Architectural Overview:** Manage user-specific and organization-wide application settings.
    *   **Core Functionality:**
        *   User profile settings (name, contact, password change - often handled by Clerk components).
        *   Notification preferences (in-app, email).
        *   Integration settings (e.g., API keys for 3rd party services, if any for MVP).
        *   Application appearance (e.g., theme, language - if applicable).
    *   **UI Components (`components/settings/`, `components/shared/ui/`):**
        *   `NotificationSettingsForm`.
        *   `IntegrationSettingsPanel`.
        *   `UserProfileSettingsForm` (can leverage Clerk's `<UserProfile />` or be custom).
    *   **Business Logic/Features (`features/settings/`, `app/(tenant)/[orgId]/settings/`):**
        *   `UserSettingsPage`.
        *   `OrganizationSettingsPage` (for admins).
    *   **Server Actions (`lib/actions/settingsActions.ts`):**
        *   `updateNotificationPreferencesAction(userId, orgId, preferences)`
        *   `saveIntegrationSettingsAction(orgId, integrationKey, settings)`
    *   **Fetchers (`lib/fetchers/settingsFetchers.ts`):**
        *   `getUserSettings(userId, orgId)`
        *   `getOrganizationSettings(orgId)`
    *   **Types & Validations (`types/settings.ts`, `validations/settings.ts`):**
        *   Define types for various settings objects.
        *   Zod schemas for settings forms.

*   **Admin-Specific Features (Aligns with `Admin` Domain - Placeholder for MVP):**
    *   **Architectural Overview:** Features for super-admins or high-level system administration, potentially spanning across tenants or managing system-wide configurations.
    *   **Potential MVP Scope (if any, might be deferred):**
        *   Viewing system audit logs (if `audit_logs` table is actively used).
        *   Managing feature flags or system-wide announcements (if applicable).
        *   For a multi-tenant SaaS, this might involve tenant lifecycle management if not fully automated by Clerk/Stripe.
    *   **Note:** For MVP, most "admin" functions will likely be tenant-admin focused and covered within other domains like User Management or Company Management. This is a placeholder for future expansion or if specific system-level admin tasks are identified for MVP.


### 3️⃣ **Advanced Features & Integrations:**

*   **Subscription & Billing:**
    *   Integrate Stripe for subscription management (free, pro, enterprise tiers).
    *   Implement logic to restrict features based on subscription tier.
*   **Real-time Tracking (Optional):**
    *   Integrate with ELD/GPS providers for real-time vehicle tracking.
*   **Accounting Integration (Optional):**
    *   Allow exporting data for accounting software (e.g., QuickBooks).
*   **Reporting Module:**
    *   Generate custom reports for various aspects of the TMS.
*   **Notifications:**
    *   Implement in-app and email notifications for important events (e.g., new load assignment, expiring documents).

### 4️⃣ **Testing, Deployment & Polish:**

*   **Write unit and integration tests** for critical business logic (Server Actions, fetchers, utilities).
*   **Implement end-to-end tests** for key user flows.
*   **Set up CI/CD pipeline** for automated testing and deployment (e.g., using Vercel, GitHub Actions).
*   **Optimize for performance and scalability.**
*   **Thoroughly test ABAC rules** to ensure data security and isolation.
*   **Refine UI/UX** based on user feedback.
*   **Create comprehensive documentation** (user guides, API docs).

---

## 📝 **Notes & Reminders:**

*   Prioritize server-first rendering with React Server Components (RSC).
*   Use Server Actions for all mutations and form submissions.
*   Keep API routes (`/app/api/*`) minimal (auth, webhooks, 3rd-party integrations).
*   Follow TypeScript best practices (strict mode, `satisfies` for configs).
*   Maintain a clean and modular codebase.
*   Document everything!

Let's build an amazing TMS! 🚀

# Vercel Deployment Analysis: ABAC Multi-Tenant SaaS with Clerk & Neon

## Current Implementation Assessment

### ✅ What's Working Well

1. **Authentication Architecture**
   - Proper Clerk middleware implementation with ABAC support
   - Comprehensive role-based access control (8 roles: admin, manager, user, dispatcher, driver, compliance, accountant, viewer)
   - Multi-tenant organization structure
   - Proper session claim management

2. **Database Integration**
   - Neon PostgreSQL integration for multi-tenancy
   - Webhook handlers for Clerk-to-database synchronization
   - Proper user metadata and organization metadata handling

3. **Type Safety**
   - Comprehensive TypeScript definitions for auth, ABAC, and permissions
   - Proper typing for Clerk session claims and user context

## Potential Vercel Deployment Issues

### 🚨 Common Issues & Solutions

#### 1. Environment Variables
**Issue**: Missing or incorrect environment variables in Vercel
**Solution**: Ensure these are set in Vercel dashboard:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs (for production)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# Neon Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### 2. Webhook Configuration
**Issue**: Clerk webhooks failing to reach Vercel deployment
**Solutions**:

1. **Update Clerk Dashboard**:
   - Webhook URL: `https://your-app.vercel.app/api/clerk/webhook-handler`
   - Events to listen for: user.created, user.updated, user.deleted, organization.*, organizationMembership.*

2. **Verify Webhook Secret**:
   - Copy webhook secret from Clerk dashboard
   - Add to Vercel environment variables as `CLERK_WEBHOOK_SECRET`

#### 3. Database Connection Issues
**Issue**: Neon database connection timeouts or connection limits
**Solutions**:

1. **Connection Pooling**:
   - Use `@neondatabase/serverless` (already in package.json ✅)
   - Implement proper connection management

2. **Database URL Configuration**:
   ```typescript
   // lib/database/connection.ts
   import { neon } from '@neondatabase/serverless';
   
   export const sql = neon(process.env.DATABASE_URL!);
   ```

#### 4. Middleware Edge Runtime Issues
**Issue**: Middleware not working properly on Vercel Edge Runtime
**Current Status**: Your middleware.ts looks correct ✅

**Potential Enhancement**:
```typescript
// Add to middleware.ts if experiencing issues
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
  runtime: 'nodejs', // Add this if edge runtime causes issues
};
```

#### 5. Server Actions Configuration
**Issue**: Server actions not working in production
**Current Status**: Your next.config.ts has correct allowedOrigins ✅

**Update for Production**:
```typescript
// next.config.ts
experimental: {
  serverActions: {
    allowedOrigins: [
      'localhost:3000',
      'your-app.vercel.app', // Update this to your actual domain
      '*.vercel.app'
    ],
  },
},
```

## Deployment Checklist

### Pre-Deployment

- [ ] Update `allowedOrigins` in next.config.ts with production domain
- [ ] Verify all environment variables are set in Vercel
- [ ] Test webhook endpoint locally with ngrok
- [ ] Verify database migrations are applied

### Clerk Configuration

- [ ] Update Clerk authorized redirect URLs
- [ ] Configure webhook endpoint URL in Clerk dashboard
- [ ] Set correct environment (development vs production)
- [ ] Verify session token customization

### Neon Database

- [ ] Verify database connection string format
- [ ] Check connection limits and pooling
- [ ] Ensure proper SSL configuration
- [ ] Verify database schema is up to date

## Monitoring & Debugging

### Vercel Function Logs
Monitor these endpoints for errors:
- `/api/clerk/webhook-handler` - Webhook processing
- Middleware execution logs
- Database connection errors

### Common Error Patterns

1. **Webhook 401 Errors**: Invalid webhook secret
2. **Database Connection Timeouts**: Connection pool exhaustion
3. **Session Claim Errors**: Clerk metadata not synced
4. **Permission Denied**: ABAC rules not properly configured

## Performance Optimizations

### 1. Database Queries
```typescript
// Optimize user context queries
export async function getUserWithPermissions(clerkId: string) {
  return await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          metadata: true,
        },
      },
    },
  });
}
```

### 2. Session Management
```typescript
// Cache session data to reduce database calls
export function useUserContext(): UserContext | null {
  const { user } = useAuth();
  
  // Consider implementing caching strategy
  return useMemo(() => user, [user]);
}
```

### 3. Middleware Optimization
```typescript
// Add response caching for public routes
if (isPublicRoute(req)) {
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'public, max-age=3600');
  return response;
}
```

## Security Considerations

### 1. Session Token Security
- Verify session token customization includes necessary claims
- Implement proper token validation in middleware
- Use secure cookie settings

### 2. ABAC Implementation
- Verify permission checks are comprehensive
- Implement proper resource-level authorization
- Add audit logging for permission changes

### 3. Database Security
- Use parameterized queries (Drizzle ORM handles this ✅)
- Implement proper row-level security
- Verify connection string security

## Next Steps

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Test Authentication Flow**:
   - User registration/login
   - Organization creation/joining
   - Role assignments
   - Permission enforcement

3. **Monitor Webhooks**:
   - Check Vercel function logs
   - Verify database synchronization
   - Test with Clerk dashboard

4. **Performance Testing**:
   - Load test authentication endpoints
   - Monitor database connection usage
   - Verify middleware performance

## Troubleshooting Commands

```bash
# Check Vercel deployment logs
vercel logs

# Test webhook locally
curl -X POST https://your-app.vercel.app/api/clerk/webhook-handler \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verify environment variables
vercel env ls
```

This analysis covers the key areas that typically cause issues when deploying Clerk + Neon multi-tenant applications to Vercel. Your implementation appears solid, so the issues are likely configuration-related.