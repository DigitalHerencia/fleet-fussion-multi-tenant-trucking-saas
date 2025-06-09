# DOMAIN: SETTINGS DOMAIN

## Current Implementation Status: ⚠️ MINIMAL (25%) 

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

# PROMPT: SETTINGS DOMAIN DEVELOPMENT

## Objective

Complete the Settings domain for comprehensive organization and user configuration management.

## Context

You are working on the FleetFusion multi-tenant fleet management system. The Settings domain is
currently minimal (25% complete) and requires complete implementation for organization configuration,
user preferences, and system settings.

## Technical Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Clerk with RBAC
- **UI:** Tailwind CSS with shadcn/ui components

## Current Implementation Status

- **Page Route:** ⚠️ BASIC - `app/(tenant)/[orgId]/settings/page.tsx` (18 lines)
- **Server Actions:** ⚠️ MINIMAL - `lib/actions/settingsActions.ts` (11 lines)
- **Components:** ✅ EXISTS - 6 settings components
- **Types:** ⚠️ MINIMAL - `types/settings.ts` (9 lines)
- **Schemas:** ✅ EXISTS - `schemas/settings.ts`

## Implementation Requirements

### 1. Complete Settings Page Route

**Enhance:** `app/(tenant)/[orgId]/settings/page.tsx`

**Requirements:**
- Multi-tab interface (Organization, User Preferences, Notifications, Integrations, Billing)
- Role-based tab visibility (admin sees all, users see limited)
- Real-time settings validation
- Auto-save functionality
- Settings change audit trail

### 2. Expand Server Actions

**Enhance:** `lib/actions/settingsActions.ts`

**Required Actions:**
- `updateOrganizationSettings` - Organization profile and preferences
- `updateUserPreferences` - User-specific settings
- `updateNotificationSettings` - Email, SMS, in-app notifications
- `updateIntegrationSettings` - Third-party API configurations
- `updateBillingSettings` - Payment and subscription settings
- `resetSettingsToDefault` - Reset to system defaults
- `exportSettings` - Settings backup functionality
- `importSettings` - Settings restore functionality

### 3. Enhanced Types and Interfaces

**Enhance:** `types/settings.ts`

**Required Interfaces:**
- `OrganizationSettings` - Company info, timezone, business rules
- `UserPreferences` - UI preferences, dashboard layout, language
- `NotificationSettings` - Email, SMS, push notification preferences
- `IntegrationSettings` - API keys, webhook configurations
- `BillingSettings` - Payment methods, billing preferences
- `SystemSettings` - Feature flags, limits, permissions
- `SettingsAuditLog` - Settings change tracking

### 4. Complete Fetchers

**Create:** `lib/fetchers/settingsFetchers.ts`

**Required Fetchers:**
- `getOrganizationSettings` - Organization configuration
- `getUserPreferences` - User-specific preferences
- `getNotificationSettings` - Notification configurations
- `getIntegrationSettings` - Third-party integrations
- `getBillingSettings` - Billing and subscription info
- `getSettingsAuditLog` - Settings change history
- `getSystemDefaults` - Default configuration values

## Settings Domain Features

### Organization Settings Tab

- **Company Profile**: Name, logo, address, contact information
- **Business Rules**: Operating hours, time zones, fiscal year
- **Fleet Configuration**: Default vehicle settings, driver requirements
- **Compliance Settings**: HOS rules, DOT configurations
- **Data Retention**: Audit log retention, document storage policies

### User Preferences Tab

- **Interface Settings**: Theme, language, dashboard layout
- **Data Display**: Units (metric/imperial), date formats, currency
- **Quick Actions**: Customizable dashboard widgets
- **Accessibility**: Screen reader support, high contrast, font size

### Notifications Tab

- **Email Notifications**: Alerts, reports, system updates
- **SMS Notifications**: Critical alerts, dispatch updates
- **In-App Notifications**: Real-time alerts, task assignments
- **Notification Schedules**: Quiet hours, escalation rules

### Integrations Tab

- **ELD Integration**: Electronic logging device connections
- **Accounting Systems**: QuickBooks, Xero integrations
- **Fuel Cards**: Fuel card provider APIs
- **Mapping Services**: Google Maps, HERE Maps configurations
- **Factoring Companies**: Invoice factoring integrations

### Billing Tab (Admin Only)

- **Subscription Management**: Plan details, usage metrics
- **Payment Methods**: Credit cards, ACH, payment history
- **Invoice Settings**: Billing address, tax information
- **Usage Analytics**: Feature usage, cost breakdown

## Technical Requirements

### Permission-Based Access

- **Admin Role**: Full access to all settings
- **Dispatcher**: Organization and notification settings
- **Driver**: User preferences and notifications only
- **Compliance Officer**: Compliance and notification settings
- **Accountant**: Billing and organization settings
- **Viewer**: Read-only access to user preferences

### Data Validation

- **Real-time Validation**: Zod schemas for all settings
- **Cross-field Validation**: Dependency checks between settings
- **External API Validation**: Test integrations before saving
- **Business Rule Validation**: Ensure settings comply with regulations

### Performance Optimization

- **Lazy Loading**: Load settings tabs on demand
- **Optimistic Updates**: Immediate UI feedback
- **Background Sync**: Auto-save without blocking UI
- **Caching Strategy**: Cache frequently accessed settings

### Security Considerations

- **Sensitive Data**: Encrypt API keys and credentials
- **Audit Trail**: Log all settings changes
- **Rate Limiting**: Prevent abuse of settings updates
- **Input Sanitization**: Validate and sanitize all inputs

## Success Criteria

- ✅ Complete multi-tab settings interface
- ✅ Role-based access control implemented
- ✅ All core settings categories functional
- ✅ Real-time validation and auto-save
- ✅ Comprehensive audit trail
- ✅ Mobile-responsive design
- ✅ Integration testing with external APIs
- ✅ Performance optimization implemented

## Development Priority

1. **Phase 1**: Organization settings and user preferences
2. **Phase 2**: Notification settings and basic integrations
3. **Phase 3**: Advanced integrations and billing settings
4. **Phase 4**: Audit trail and export/import functionality