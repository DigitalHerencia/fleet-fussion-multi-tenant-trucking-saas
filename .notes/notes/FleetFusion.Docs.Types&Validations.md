---
id: 5t6ml12jd8zneajunqex0xd
title: Types&Validations
desc: ''
updated: 1748450412905
created: 1748450412905
---

# FleetFusion: Type Definitions & Validation Schemas

This document provides a comprehensive overview of the type definitions and validation schemas used throughout the FleetFusion application. It serves as a reference for developers to understand the data structures and validation rules enforced within the system.

## 1. Type Definitions

This section details the various TypeScript types and interfaces used to model data entities, API requests/responses, and other structural elements of the application. These types are primarily located in the `types/` directory and are derived from or aligned with the Prisma schema defined in `prisma/schema.prisma`.

### 1.1. Prisma Schema Enums

The following enums are defined in `prisma/schema.prisma` and are used across multiple models to represent predefined sets of values.

#### `UserRole`
Defines the roles a user can have within an organization.
```typescript
enum UserRole {
  admin
  manager
  user
  dispatcher
  driver
  compliance
  accountant
  viewer
}
```

#### `SubscriptionTier`
Defines the different subscription tiers available for organizations.
```typescript
enum SubscriptionTier {
  free
  pro
  enterprise
}
```

#### `SubscriptionStatus`
Defines the status of an organization's subscription.
```typescript
enum SubscriptionStatus {
  active
  inactive
  trial
  cancelled
}
```

#### `VehicleStatus`
Defines the operational status of a vehicle.
```typescript
enum VehicleStatus {
  active
  inactive
  maintenance
  decommissioned
}
```

#### `DriverStatus`
Defines the employment or operational status of a driver.
```typescript
enum DriverStatus {
  active
  inactive
  suspended
  terminated
}
```

#### `LoadStatus`
Defines the lifecycle status of a load.
```typescript
enum LoadStatus {
  pending
  assigned
  in_transit
  delivered
  cancelled
}
```

### 1.2. Prisma Schema Models (Core Entities)

This subsection outlines the core data models defined in `prisma/schema.prisma`. For brevity, only a summary of each model's purpose and key fields is provided. Refer to `prisma/schema.prisma` for complete definitions, relations, and attributes.

#### `Organization`
Represents a tenant company using the FleetFusion platform.
- **Key Fields**: `id`, `clerkId` (unique Clerk ID), `name`, `slug` (unique), `subscriptionTier`, `subscriptionStatus`, `settings` (JSONB for org-specific settings).
- **Relations**: Has many `User`, `Vehicle`, `Driver`, `Load`, etc.

#### `User`
Represents an individual user account within an organization.
- **Key Fields**: `id`, `clerkId` (unique Clerk ID), `organizationId` (links to `Organization`), `email`, `firstName`, `lastName`, `role` (`UserRole`), `isActive`, `onboardingComplete`.
- **Relations**: Belongs to one `Organization`; can be linked to one `Driver`.

#### `Vehicle`
Represents a vehicle (truck, trailer, etc.) owned or operated by an organization.
- **Key Fields**: `id`, `organizationId`, `type` (e.g., 'tractor', 'trailer'), `status` (`VehicleStatus`), `make`, `model`, `year`, `vin` (Vehicle Identification Number), `licensePlate`, `unitNumber` (unique within an org).
- **Relations**: Belongs to one `Organization`; can be associated with many `Load` and `ComplianceDocument`.

#### `Driver`
Represents a driver employed or contracted by an organization.
- **Key Fields**: `id`, `organizationId`, `userId` (optional link to `User` account), `employeeId` (unique within an org), `firstName`, `lastName`, `licenseNumber`, `status` (`DriverStatus`).
- **Relations**: Belongs to one `Organization`; can be linked to one `User`; associated with many `Load` and `ComplianceDocument`.

#### `Load`
Represents a shipment or job to be transported.
- **Key Fields**: `id`, `organizationId`, `driverId` (optional), `vehicleId` (optional), `loadNumber` (unique within an org), `status` (`LoadStatus`), `customerName`, origin/destination details, `rate`.
- **Relations**: Belongs to one `Organization`; can be assigned to one `Driver` and one `Vehicle`.

#### `ComplianceDocument`
Represents various compliance-related documents (e.g., licenses, insurance).
- **Key Fields**: `id`, `organizationId`, `driverId` (optional), `vehicleId` (optional), `type` (e.g., 'license', 'medical'), `title`, `fileUrl`, `expirationDate`.
- **Relations**: Belongs to one `Organization`; can be associated with a `Driver` or `Vehicle`.

#### `IftaReport`
Represents an IFTA (International Fuel Tax Agreement) report for an organization.
- **Key Fields**: `id`, `organizationId`, `quarter`, `year`, `status` (e.g., 'draft', 'submitted'), `totalMiles`, `totalGallons`, `dueDate`.
- **Relations**: Belongs to one `Organization`.

#### `AuditLog`
Records significant actions and changes within the system for auditing purposes.
- **Key Fields**: `id`, `organizationId`, `userId` (optional), `entityType`, `entityId`, `action`, `changes` (JSONB), `timestamp`.
- **Relations**: Belongs to one `Organization`; can be associated with a `User`.

#### `WebhookEvent`
Logs incoming webhook events, primarily from Clerk, for processing and debugging.
- **Key Fields**: `id`, `eventType` (e.g., 'user.created'), `eventId` (unique from source), `payload` (JSONB), `status` (e.g., 'pending', 'processed', 'failed').

---
*Next, I will document types from types/abac.ts and types/auth.ts.*

### 1.3. ABAC (Attribute-Based Access Control) Types (`types/abac.ts`)

This file defines all role types, permissions, and attributes used for authorization throughout the application. These types are used by Clerk for custom session claims and by middleware for access control.

*   **`SystemRoles`**: An object defining core roles within the FleetFusion platform. These are synchronized with Clerk's organization roles.
    *   `ADMIN`: 'admin'
    *   `DISPATCHER`: 'dispatcher'
    *   `DRIVER`: 'driver'
    *   `COMPLIANCE_OFFICER`: 'compliance_officer'
    *   `ACCOUNTANT`: 'accountant'
    *   `VIEWER`: 'viewer'
*   **`SystemRole`**: A type representing one of the defined system roles (e.g., 'admin', 'dispatcher').
*   **`ResourceTypes`**: An object defining entities that can be accessed or modified.
    *   `USER`: 'user'
    *   `DRIVER`: 'driver'
    *   `VEHICLE`: 'vehicle'
    *   `LOAD`: 'load'
    *   `DOCUMENT`: 'document'
    *   `IFTA`: 'ifta_report'
    *   `ORGANIZATION`: 'organization'
    *   `BILLING`: 'billing'
*   **`ResourceType`**: A type representing one of the defined resource types.
*   **`PermissionActions`**: An object defining operations that can be performed on resources.
    *   `CREATE`: 'create'
    *   `READ`: 'read'
    *   `UPDATE`: 'update'
    *   `DELETE`: 'delete'
    *   `MANAGE`: 'manage' (Full control)
    *   `ASSIGN`: 'assign' (e.g., assign drivers to loads)
    *   `APPROVE`: 'approve' (e.g., for compliance officers)
    *   `REPORT`: 'report' (e.g., for generating reports)
*   **`PermissionAction`**: A type representing one of the defined permission actions.
*   **`Permission`**: Interface representing a single permission.
    *   `action`: `PermissionAction`
    *   `resource`: `ResourceType`
*   **`RolePermissions`**: A record mapping each `SystemRole` to an array of `Permission` objects, defining the permissions for that role.
*   **`UserSessionAttributes`**: Interface for user session data with ABAC attributes, intended for Clerk session claims.
    *   `role`: `SystemRole`
    *   `organizationId`: `string`
    *   `permissions`: `Permission[]`

### 1.4. Authentication & Authorization Types (`types/auth.ts`)

This file defines comprehensive ABAC types for the multi-tenant fleet management system, aligning with `types/abac.ts`.

*   **`UserRole`**: Re-export of `SystemRole` from `types/abac.ts`.
*   **`Permission`**: Re-export from `types/abac.ts`.
*   **`ResourceType`**: Re-export from `types/abac.ts`.
*   **`PermissionAction`**: Re-export from `types/abac.ts`.
*   **`ROLE_PERMISSIONS`**: Re-export of `RolePermissions` from `types/abac.ts`.
*   **`ClerkUserMetadata`**: Interface for Clerk user metadata, aligned with JWT claims.
    *   `organizationId`: `string`
    *   `role`: `UserRole`
    *   `permissions`: `Permission[]`
    *   `isActive`: `boolean`
    *   `lastLogin?`: `string`
    *   `onboardingComplete`: `boolean`
*   **`ClerkOrganizationMetadata`**: Interface for organization metadata in Clerk.
    *   `subscriptionTier`: 'free' | 'pro' | 'enterprise'
    *   `subscriptionStatus`: 'active' | 'inactive' | 'trial' | 'cancelled'
    *   `maxUsers`: `number`
    *   `features`: `string[]`
    *   `billingEmail`: `string`
    *   `createdAt`: `string`
    *   `dotNumber?`: `string`
    *   `mcNumber?`: `string`
    *   `address?`: `string`
    *   `city?`: `string`
    *   `state?`: `string`
    *   `zip?`: `string`
    *   `phone?`: `string`
    *   `settings`:
        *   `timezone`: `string`
        *   `dateFormat`: `string`
        *   `distanceUnit`: 'miles' | 'kilometers'
        *   `fuelUnit`: 'gallons' | 'liters'
*   **`UserContext`**: Interface for extended user context with ABAC data.
    *   `name`: `string | undefined`
    *   `userId`: `string`
    *   `organizationId`: `string`
    *   `role`: `UserRole`
    *   `permissions`: `Permission[]`
    *   `email`: `string`
    *   `firstName?`: `string`
    *   `lastName?`: `string`
    *   `profileImage?`: `string`
    *   `isActive`: `boolean`
    *   `onboardingComplete`: `boolean`
    *   `organizationMetadata`: `ClerkOrganizationMetadata`
*   **`AuthState`**: Interface for the auth state used in React context.
    *   `user`: `UserContext | null`
    *   `isLoaded`: `boolean`
    *   `isSignedIn`: `boolean`
    *   `isLoading`: `boolean`
    *   `organization`: `{ id: string; name: string; slug: string; metadata: ClerkOrganizationMetadata; } | null`
    *   `company`: `{ id: string; name: string; dotNumber?: string; mcNumber?: string; } | null`
*   **`UserWebhookPayload`**: Interface for user-related webhook payloads from Clerk.
    *   `data`: Contains user details, email, metadata, and organization memberships.
    *   `type`: 'user.created' | 'user.updated' | 'user.deleted'
*   **`OrganizationWebhookPayload`**: Interface for organization-related webhook payloads from Clerk.
    *   `data`: Contains organization details, metadata, and member count.
    *   `type`: 'organization.created' | 'organization.updated' | 'organization.deleted'
*   **`DatabaseUser`**: Interface representing the user structure in the database, synced via webhooks.
    *   `id`: `string` (Clerk User ID)
    *   `email`: `string`
    *   `firstName`: `string | null`
    *   `lastName`: `string | null`
    *   `profileImageUrl`: `string | null`
    *   `organizationId`: `string | null`
    *   `role`: `UserRole | null`
    *   `isActive`: `boolean`
    *   `lastLogin?`: `string | null`
    *   `onboardingComplete`: `boolean`
    *   `createdAt`: `Date`
    *   `updatedAt`: `Date`
*   **`DatabaseOrganization`**: Interface representing the organization structure in the database, synced via webhooks.
    *   `id`: `string` (Clerk Organization ID)
    *   `name`: `string`
    *   `slug`: `string`
    *   `subscriptionTier`: 'free' | 'pro' | 'enterprise'
    *   `subscriptionStatus`: 'active' | 'inactive' | 'trial' | 'cancelled'
    *   `maxUsers`: `number`
    *   `features`: `string[]`
    *   `billingEmail`: `string`
    *   `clerkCreatedAt`: `string` (Timestamp from Clerk)
    *   `dotNumber?`: `string | null`
    *   `mcNumber?`: `string | null`
    *   `settings_timezone`: `string`
    *   `settings_dateFormat`: `string`
    *   `settings_distanceUnit`: 'miles' | 'kilometers'
    *   `settings_fuelUnit`: 'gallons' | 'liters'
    *   `membersCount?`: `number`
    *   `createdAt`: `Date`
    *   `updatedAt`: `Date`
*   **`OnboardingData`**: Interface for data collected during the onboarding process.
    *   Includes `userId`, company details, organization details, and selected `role`.
*   **`SetClerkMetadataResult`**: Interface for the result of setting Clerk metadata.
    *   `success`: `boolean`
    *   `organizationId?`: `string`
    *   `userId?`: `string`
    *   `error?`: `string`

*Next, I will document types from the remaining files in the `types/` directory: `analytics.ts`, `api.ts`, `compliance.ts`, `dispatch.ts`, `drivers.ts`, `globals.d.ts`, `ifta.ts`, `index.ts`, and `webhooks.ts`.*

### 1.5. Analytics Types (`types/analytics.ts`)

This file defines types for the analytics module, covering various metrics related to revenue, expenses, operations, driver performance, vehicle performance, and profitability.

*   **`AnalyticsTimeframe`**: Interface defining a time range and period for analytics.
    *   `start`: `Date`
    *   `end`: `Date`
    *   `period`: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
*   **`RevenueMetrics`**: Interface for revenue-related metrics.
    *   Includes `totalRevenue`, `revenueByCustomer`, `revenueByService`, `averageRatePerMile`, etc.
*   **`ExpenseMetrics`**: Interface for expense-related metrics.
    *   Includes `totalExpenses`, `expensesByCategory`, `fuelExpenses`, `maintenanceExpenses`, etc.
*   **`OperationalMetrics`**: Interface for operational metrics.
    *   Includes `totalMiles`, `loadedMiles`, `emptyMiles`, `deadheadPercentage`, `totalLoads`, etc.
*   **`DriverPerformanceMetrics`**: Interface for driver performance metrics.
    *   Includes an array of driver-specific metrics (`miles`, `loads`, `revenue`, `fuelEfficiency`, etc.) and averages.
*   **`VehiclePerformanceMetrics`**: Interface for vehicle performance metrics.
    *   Includes an array of vehicle-specific metrics (`miles`, `loads`, `revenue`, `maintenanceCosts`, etc.) and averages.
*   **`ProfitabilityMetrics`**: Interface for profitability metrics.
    *   Includes `grossRevenue`, `netProfit`, `profitMargin`, `costPerMile`, `revenuePerMile`, etc.

### 1.6. API Request/Response Types (`types/api.ts`)

This file defines types for API requests and responses across different modules like Auth, Dispatch, Drivers, Vehicles, Compliance, and IFTA.

*   **Auth API Types**:
    *   `SignInRequest`: { `email`, `password` }
    *   `SignUpRequest`: { `email`, `password`, `name`, `companyName` }
    *   `ForgotPasswordRequest`: { `email` }
    *   `ResetPasswordRequest`: { `token`, `password` }
*   **Dispatch API Types**:
    *   `CreateLoadRequest`: Defines the structure for creating a new load, including customer, origin, destination, dates, and rate details.
    *   `UpdateLoadRequest`: For updating existing loads (status, driver, vehicle, notes).
    *   `GetLoadsRequest`: Parameters for fetching loads (pagination, status, driver/vehicle ID, date range).
    *   `GetLoadsResponse`: `PaginatedResponse<Load>`
*   **Drivers API Types**:
    *   `CreateDriverRequest`: For creating a new driver profile.
    *   `UpdateDriverRequest`: For updating driver status, contact, and document expirations.
    *   `GetDriversRequest`: Parameters for fetching drivers (pagination, status, search).
    *   `GetDriversResponse`: `PaginatedResponse<Driver>`
*   **Vehicles API Types**:
    *   `CreateVehicleRequest`: For adding a new vehicle.
    *   `UpdateVehicleRequest`: For updating vehicle status, odometer, and maintenance dates.
    *   `GetVehiclesRequest`: Parameters for fetching vehicles (pagination, status, type, search).
    *   `GetVehiclesResponse`: `PaginatedResponse<Vehicle>`
*   **Compliance API Types**:
    *   `CreateComplianceDocumentRequest`: For creating new compliance documents.
    *   `GetComplianceDocumentsRequest`: Parameters for fetching compliance documents.
    *   `GetComplianceDocumentsResponse`: `PaginatedResponse<ComplianceDocument>`
    *   `GetHosLogsRequest`: Parameters for fetching Hours of Service logs.
    *   `GetHosLogsResponse`: `ApiResponse<HosLog[]>`
*   **IFTA API Types**:
    *   `CreateFuelPurchaseRequest`: For recording fuel purchases.
    *   `GetFuelPurchasesRequest`: Parameters for fetching fuel purchases.
    *   `GetFuelPurchasesResponse`: `PaginatedResponse<FuelPurchase>`
    *   `GetIftaReportsRequest`: Parameters for fetching IFTA reports.
    *   `GetIftaReportsResponse`: `ApiResponse<IftaReport[]>`

### 1.7. Compliance Types (`types/compliance.ts`)

This file defines types related to compliance management, including documents, Hours of Service (HOS) logs, and Driver Vehicle Inspection Reports (DVIR).

*   **`ComplianceDocument`**: Interface for compliance documents.
    *   Includes `id`, `tenantId`, `type`, `name`, `status`, `issuedDate`, `expirationDate`, `url`, etc.
*   **`ComplianceDocumentType`**: Union type for various document types (e.g., 'dot_authority', 'insurance', 'ifta_license').
*   **`HosLog`**: Interface for Hours of Service logs.
    *   Includes `driverId`, `date`, `status`, `logs` (array of `HosEntry`), `totalDriveTime`, `violations`.
*   **`HosEntry`**: Interface for individual HOS log entries.
    *   `startTime`, `endTime`, `status` ('driving', 'on_duty', etc.), `location`.
*   **`HosViolation`**: Interface for HOS violations.
    *   `type` ('11_hour', '14_hour', etc.), `description`, `severity`.
*   **`DvirReport`**: Interface for Driver Vehicle Inspection Reports.
    *   Includes `vehicleId`, `driverId`, `date`, `preTrip`, `postTrip`, `defects` (array of `DvirDefect`), `safeToOperate`.
*   **`DvirDefect`**: Interface for defects noted in a DVIR.
    *   `category` ('brakes', 'tires', etc.), `description`, `severity`, `repaired` status.

### 1.8. Dispatch Types (`types/dispatch.ts`)

This file defines types for the dispatch module, including loads, customers, locations, rates, documents, vehicles, and trailers.

*   **`Load`**: Interface for load information.
    *   Includes `id`, `tenantId`, `referenceNumber`, `status` (`LoadStatus`), `customer`, `origin`, `destination`, `pickupDate`, `deliveryDate`, `driver`, `vehicle`, `rate`, etc.
*   **`LoadStatus`**: Union type for load statuses (e.g., 'pending', 'assigned', 'in_transit').
*   **`Customer`**: Interface for customer details.
*   **`Location`**: Interface for address and contact information for origins/destinations.
*   **`Rate`**: Interface for load rate details (total, currency, type, additional charges).
*   **`Document`**: Interface for documents related to a load (e.g., BOL, POD).
*   **`Vehicle`**: Interface for vehicle details (re-used or extended from a common vehicle type if available elsewhere, but defined here for dispatch context).
    *   Includes `id`, `type` ('truck', 'van'), `make`, `model`, `vin`, `licensePlate`, `status`.
*   **`Trailer`**: Interface for trailer details.
    *   Includes `id`, `type` ('dry_van', 'reefer'), `length`, `vin`, `licensePlate`, `status`.

### 1.9. Driver Types (`types/drivers.ts`)

This file defines types for the drivers module, including driver profiles, documents, hours of service, and performance metrics.

*   **`Driver`**: Interface for driver information.
    *   Includes `id`, `tenantId`, `userId`, `firstName`, `lastName`, `email`, `phone`, `licenseNumber`, `licenseExpiration`, `medicalCardExpiration`, `status` (`DriverStatus`), `currentLocation`, `homeTerminal`, `documents`.
*   **`DriverStatus`**: Union type for driver statuses (e.g., 'available', 'on_duty', 'driving').
*   **`DriverDocument`**: Interface for documents specific to a driver (license, medical card).
*   **`HoursOfService`**: Interface for driver HOS records (distinct from compliance HOS logs, potentially for simpler tracking or a different system).
*   **`DriverPerformance`**: Interface for driver performance metrics over a period.

### 1.10. Global TypeScript Declarations (`types/globals.d.ts`)

This file extends global TypeScript interfaces, specifically for Clerk custom session claims, aligning them with ABAC specifications from `types/abac.ts`.

*   **`CustomJwtSessionClaims`**: Extends the global interface to include FleetFusion specific claims:
    *   Core Clerk fields: `"org.id"`, `"user.id"`, `"org.name"`, `"org.role"` (using `SystemRole`).
    *   ABAC attributes: `abac?: UserSessionAttributes`.
    *   User information: `firstName`, `lastName`, `primaryEmail`, `fullName`.
    *   Public metadata: `publicMetadata?: { onboardingComplete?: boolean; organizationId?: string; role?: SystemRole; }`.
    *   Organization membership permissions: `"org_membership.permissions"?: Permission[]`.
    *   Legacy metadata field (deprecated).

### 1.11. IFTA Types (`types/ifta.ts`)

This file defines types for the IFTA (International Fuel Tax Agreement) module, including fuel purchases, mileage by jurisdiction, IFTA reports, and trip reports.

*   **`FuelPurchase`**: Interface for fuel purchase records.
    *   Includes `vehicleId`, `driverId`, `date`, `location`, `gallons`, `cost`, `odometer`, `fuelType`.
*   **`MileageByJurisdiction`**: Interface for tracking miles traveled in different jurisdictions for a vehicle.
    *   Includes `vehicleId`, `quarter`, `year`, `jurisdictions` (array of `JurisdictionMileage`), `totalMiles`.
*   **`JurisdictionMileage`**: Interface for mileage within a specific jurisdiction.
    *   `jurisdiction` (state/province code), `miles`, `fuelGallons?`, `taxPaid?`.
*   **`IftaReport`**: Interface for IFTA report summaries.
    *   Includes `quarter`, `year`, `status`, `totalMiles`, `totalGallons`, `mpg`, `jurisdictionSummaries` (array of `IftaJurisdictionSummary`), `netTaxDue`.
*   **`IftaJurisdictionSummary`**: Interface for the summary of taxes for a specific jurisdiction within an IFTA report.
*   **`TripReport`**: Interface for individual trip reports, detailing mileage and fuel for IFTA purposes.

### 1.12. Core Application Types (`types/index.ts`)

This file contains base types used throughout the FleetFusion application, such as User, Tenant, Dashboard Metrics, and common utility types like Pagination.

*   **`User`**: Basic user interface.
    *   `id`, `email`, `name`, `role` (imported from `./auth`), `tenantId`.
*   **`Tenant`**: Interface for tenant (organization) information.
    *   `id`, `name`, `slug`, `plan` (`SubscriptionPlan`), `settings` (`TenantSettings`), `status`.
*   **`TenantSettings`**: Interface for tenant-specific settings.
    *   Includes `logo`, `primaryColor`, `companyAddress`, `dotNumber`, `mcNumber`, `timeZone`, `features` enabled.
*   **`SubscriptionPlan`**: Union type for subscription plans ('free', 'starter', etc.).
*   **`DashboardMetrics`**: Interface for metrics displayed on a dashboard.
*   **`PaginationParams`**: Interface for pagination parameters (`page`, `limit`).
*   **`PaginatedResponse<T>`**: Generic interface for paginated API responses.
*   **`ApiResponse<T>`**: Generic interface for standard API responses.

### 1.13. Webhook Specific Types (`types/webhooks.ts`)

This file defines types specifically for handling Clerk webhook events, separated for better organization.

*   **`WebhookEventType`**: A comprehensive union type listing all possible Clerk webhook event types (e.g., 'user.created', 'organization.updated').
*   **`WebhookPayload<T>`**: Generic interface for the structure of a webhook payload.
    *   `data`: `T` (the specific event data)
    *   `type`: `WebhookEventType`
    *   `object`: `string` (usually 'event')
*   **`UserWebhookData`**: Interface for the `data` object within user-related webhook events.
    *   Includes `id`, `email_addresses`, `first_name`, `last_name`, `public_metadata` (Partial `ClerkUserMetadata`), `organization_memberships`.
*   **`OrganizationWebhookData`**: Interface for the `data` object within organization-related webhook events.
    *   Includes `id`, `name`, `slug`, `public_metadata` (Partial `ClerkOrganizationMetadata`), `members_count`.
*   **`OrganizationMembershipWebhookData`**: Interface for the `data` object within organization membership-related webhook events.
*   **Typed Webhook Payloads**: Specific types like `UserWebhookPayload`, `OrganizationWebhookPayload` combining the generic `WebhookPayload` with specific data interfaces.
*   **`WebhookVerificationResult`**: Interface for the result of verifying a webhook.
*   **`WebhookProcessingResult`**: Interface for the result of processing a webhook event (e.g., database operation status).

*Next, I will create Section "2. Validation Schemas" and document Zod validation schemas from files in the `validations/` directory.*

## 2. Validation Schemas (Zod)

This section outlines the Zod validation schemas used for runtime data validation across various forms and API endpoints in the FleetFusion application. These schemas ensure data integrity and provide user-friendly error messages.

### 2.1. Authentication Validation Schemas (`validations/auth.ts`)

Defines Zod schemas for authentication processes like sign-in, sign-up, password reset, user onboarding, role assignments, and organization management.

*   **`signInSchema`**: Validates email and password for user login.
    *   `email`: Must be a valid email format.
    *   `password`: Minimum 8 characters.
    *   `tenantId`: Optional.
*   **`signUpSchema`**: Validates user registration details.
    *   `email`: Valid email format.
    *   `password`: Minimum 8 characters, with uppercase, lowercase, number, and special character requirements.
    *   `confirmPassword`: Must match `password`.
    *   `name`: Minimum 2 characters.
    *   `companyName`: Minimum 2 characters.
    *   `agreeToTerms`: Must be `true`.
*   **`forgotPasswordSchema`**: Validates email for initiating password reset.
    *   `email`: Valid email format.
*   **`resetPasswordSchema`**: Validates new password and confirmation during password reset.
    *   `password`: Same complexity requirements as `signUpSchema`.
    *   `confirmPassword`: Must match `password`.
*   **`onboardingSchema`**: Validates data collected during the company onboarding process.
    *   `companyDetails`: Nested object for name, address, phone, DOT/MC numbers.
    *   `businessType`: Enum for business structure (e.g., 'llc', 'corporation').
    *   `fleetSize`: Enum for fleet size ranges.
    *   `services`: Array of enums for services offered.
    *   `referralSource`: Optional enum for how the user found FleetFusion.
*   **`systemRoleSchema`**: Enum schema validating against `SystemRoles` from `types/abac.ts`.
*   **`userRoleAssignmentSchema`**: Validates `userId`, `role` (using `systemRoleSchema`), and `organizationId` for assigning roles.
*   **`updateUserRoleSchema`**: Validates `role` (using `systemRoleSchema`) for updating a user's role.
*   **`createOrganizationSchema`**: Validates data for creating a new organization.
    *   `name`: Min 2, max 100 characters, specific regex.
    *   `slug`: Optional, min 2, max 50, specific regex for lowercase, numbers, hyphens.
    *   `dotNumber`, `mcNumber`, `address`, `city`, `state`, `zip`, `phone`, `email`: Optional, with specific format validations (regex for DOT, MC, ZIP, phone).
    *   `publicMetadata`: Optional record.
*   **`updateOrganizationSchema`**: Similar to `createOrganizationSchema` but all fields are optional, for updating an existing organization.
*   **`webhookUserDataSchema`**: Validates the structure of user-related webhook payloads from Clerk.
*   **`webhookOrganizationDataSchema`**: Validates the structure of organization-related webhook payloads from Clerk.
*   **`webhookOrganizationMembershipDataSchema`**: Validates the structure of organization membership-related webhook payloads from Clerk.

### 2.2. Compliance Validation Schemas (`validations/compliance.ts`)

Defines Zod schemas for compliance-related forms, such as creating and updating compliance documents, filtering documents, and DVIR forms.

*   **`createComplianceDocumentSchema`**: Validates data for creating new compliance documents.
    *   `type`: Enum for document types (e.g., 'dot_authority', 'insurance').
    *   `name`: Required string.
    *   `issuedDate`: Required string.
    *   `expirationDate`, `documentNumber`, `issuingAuthority`, `notes`: Optional strings.
*   **`updateComplianceDocumentSchema`**: Validates data for updating compliance documents.
    *   `id`: Required string.
    *   `name`, `description`, `expirationDate`, `notes`: Optional strings.
*   **`complianceDocumentFilterSchema`**: Validates parameters for filtering compliance documents.
    *   `type`: Optional enum (includes 'all').
    *   `status`: Optional enum ('all', 'valid', 'expiring', 'expired').
    *   `expiringIn`: Optional number (days).
*   **`dvirSchema`**: Validates data for Driver Vehicle Inspection Reports.
    *   `vehicleId`, `driverId`, `date`, `signature`: Required strings.
    *   `preTrip`, `postTrip`, `safeToOperate`: Booleans.
    *   `defects`: Array of objects, each with `category` (enum), `description` (required), and `severity` (enum).
    *   `notes`: Optional string.

### 2.3. Dispatch Validation Schemas (`validations/dispatch.ts`)

Defines Zod schemas for dispatch-related forms, including creating and updating loads, and filtering loads.

*   **`createLoadSchema`**: Validates data for creating new loads.
    *   `referenceNumber`: Required string.
    *   `customer`: Nested object for customer details (ID optional, name required).
    *   `origin`, `destination`: Nested objects for location details (name, address, city, state, zipCode required).
    *   `pickupDate`, `deliveryDate`: Required strings.
    *   `driver`, `vehicle`, `trailer`: Optional nested objects with `id` and `name`/`number`.
    *   `rate`: Nested object for rate details (total number required, currency defaults to USD, type enum).
    *   `notes`: Optional string.
*   **`updateLoadSchema`**: Validates data for updating existing loads.
    *   `id`: Required string.
    *   `status`: Optional enum for load status.
    *   `driver`, `vehicle`, `trailer`: Optional nested objects with `id`.
    *   `notes`: Optional string.
*   **`loadFilterSchema`**: Validates parameters for filtering loads.
    *   `status`: Optional enum (includes 'all').
    *   `driverId`, `vehicleId`, `startDate`, `endDate`, `customerId`, `search`: Optional strings.

### 2.4. Driver Validation Schemas (`validations/drivers.ts`)

Defines Zod schemas for driver-related forms, such as creating and updating driver profiles, filtering drivers, and HOS log entries.

*   **`createDriverSchema`**: Validates data for creating new driver profiles.
    *   `firstName`, `lastName`, `licenseNumber`, `licenseState`, `licenseExpiration`, `medicalCardExpiration`, `hireDate`, `homeTerminal`: Required strings.
    *   `email`: Valid email format.
    *   `phone`: Minimum 10 characters.
    *   `emergencyContact`: Optional nested object for emergency contact details.
    *   `notes`: Optional string.
*   **`updateDriverSchema`**: Validates data for updating driver profiles.
    *   `id`: Required string.
    *   `status`: Optional enum for driver status.
    *   `phone`, `licenseExpiration`, `medicalCardExpiration`, `emergencyContact`, `notes`: Optional fields.
*   **`driverFilterSchema`**: Validates parameters for filtering drivers.
    *   `status`: Optional enum (includes 'all').
    *   `search`: Optional string.
    *   `licenseExpiringIn`, `medicalCardExpiringIn`: Optional numbers (days).
*   **`hosLogEntrySchema`**: Validates data for individual Hours of Service log entries.
    *   `status`: Enum for HOS status.
    *   `location`, `startTime`, `endTime`: Required strings.
    *   `notes`: Optional string.

### 2.5. IFTA Validation Schemas (`validations/ifta.ts`)

Defines Zod schemas for IFTA-related forms, including fuel purchases, trip reports, and filtering for both.

*   **`createFuelPurchaseSchema`**: Validates data for recording fuel purchases.
    *   `vehicleId`, `driverId`, `date`: Required strings.
    *   `location`: Nested object for location details (name, city, state, country required).
    *   `gallons`: Number > 0.1.
    *   `cost`: Number > 0.01.
    *   `odometer`: Positive number.
    *   `fuelType`: Enum ('diesel', 'gasoline').
    *   `notes`: Optional string.
*   **`fuelPurchaseFilterSchema`**: Validates parameters for filtering fuel purchases.
    *   `vehicleId`, `driverId`, `startDate`, `endDate`: Optional strings.
    *   `fuelType`: Optional enum (includes 'all').
*   **`createTripReportSchema`**: Validates data for creating trip reports for IFTA.
    *   `vehicleId`, `driverId`, `startDate`, `endDate`: Required strings.
    *   `startOdometer`, `endOdometer`: Positive numbers.
    *   `jurisdictions`: Array of objects (min 1), each with `jurisdiction` (required string) and `miles` (positive number).
    *   `loadId`, `notes`: Optional strings.
*   **`tripReportFilterSchema`**: Validates parameters for filtering trip reports.
    *   `vehicleId`, `driverId`, `startDate`, `endDate`, `jurisdiction`: Optional strings.
*   **`iftaReportFilterSchema`**: Validates parameters for filtering IFTA reports.
    *   `year`: Optional number.
    *   `quarter`: Optional number (1-4).
    *   `status`: Optional enum (includes 'all').

### 2.6. Vehicle Validation Schemas (`validations/vehicles.ts`)

Defines Zod schemas for vehicle and trailer-related forms, including creation, updates, filtering, and maintenance records.

*   **`createVehicleSchema`**: Validates data for creating new vehicles (trucks, vans).
    *   `type`: Enum ('truck', 'van', 'trailer').
    *   `make`, `model`, `licensePlate`: Required strings.
    *   `year`: Number between 1900 and current year + 1.
    *   `vin`: String of 17 characters.
    *   `fuelType`: Enum ('diesel', 'gasoline', etc.).
    *   `currentOdometer`: Optional positive number.
*   **`createTrailerSchema`**: Validates data for creating new trailers.
    *   `type`: Enum for trailer types ('dry_van', 'reefer', etc.).
    *   `length`: Required number > 1.
    *   `make`, `model`, `licensePlate`: Required strings.
    *   `year`: Number between 1900 and current year + 1.
    *   `vin`: String of 17 characters.
*   **`updateVehicleSchema`**: Validates data for updating vehicles.
    *   `id`: Required string.
    *   `status`: Optional enum for vehicle status.
    *   `currentOdometer`, `lastMaintenanceDate`, `nextMaintenanceDate`, `notes`: Optional fields.
*   **`vehicleFilterSchema`**: Validates parameters for filtering vehicles.
    *   `status`, `type`: Optional enums (include 'all').
    *   `search`: Optional string.
    *   `maintenanceDueIn`: Optional number (days).
*   **`maintenanceRecordSchema`**: Validates data for vehicle maintenance records.
    *   `vehicleId`, `date`, `description`: Required strings.
    *   `odometer`, `cost`: Positive numbers.
    *   `type`: Enum for maintenance type.
    *   `vendor`, `notes`: Optional strings.

This concludes the documentation for type definitions and validation schemas.
