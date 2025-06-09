# FleetFusion Drivers Domain Development Prompt 

## Domain Overview

The **Drivers Domain** manages comprehensive driver lifecycle from onboarding to performance
tracking. This includes profile management, licensing compliance, Hours of Service (HOS) tracking,
assignment management, performance analytics, and real-time status monitoring within a multi-tenant
TMS environment.

## Repository Context

**Repository**: FleetFusion TMS Platform  
**Tech Stack**: Next.js 15, React 19, TypeScript, Clerk Auth, Prisma ORM, Neon PostgreSQL  
**Architecture**: Multi-tenant SaaS with RBAC/ABAC permissions  
**Branch Strategy**: Feature branches → `development` → `main`

## Current State Analysis

### Database Schema (Prisma)

The Drivers domain utilizes these core models:

```prisma
model Driver {
  id                    String   @id @default(cuid())
  organizationId        String   // Multi-tenant isolation
  firstName             String
  lastName              String
  email                 String
  phone                 String
  licenseNumber         String
  licenseState          String
  licenseClass          String   // A, B, C
  licenseExpiration     DateTime
  medicalCardExpiration DateTime
  status                DriverStatus
  hireDate              DateTime
  emergencyContact1     String?
  emergencyContact2     String?
  notes                 String?
  customFields          Json?
  loads                 Load[]   // Driver assignments
  complianceDocuments   ComplianceDocument[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum DriverStatus {
  ACTIVE
  INACTIVE
  TERMINATED
  ON_LEAVE
}
```

### Key Components Structure

- **Routes**: `app/(tenant)/[orgId]/drivers/` (list), `[userId]/page.tsx` (dashboard)
- **Features**: `DriverFormFeature`, `DriverAssignmentDialog`, `DriverListPage`
- **Components**: `DriverCard`, `DriverDetailsDialog`, driver forms
- **Actions**: `createDriverAction`, `updateDriverAction`, `assignDriverAction`
- **Fetchers**: `listDriversByOrg`, `getDriverById`, `getDriverHOSStatus`
- **Types**: Comprehensive driver interfaces in `types/drivers.ts`
- **Schemas**: Zod validation in `schemas/drivers.ts`

### Key Strengths

- Comprehensive driver model with CDL tracking and compliance
- HOS status calculation and violation detection
- Assignment management with load tracking
- Multi-tenant data isolation with organizationId
- RBAC permissions properly configured
- Real-time status updates using React 19 features
- Performance analytics integration

### Areas Needing Development

1. **Mobile Driver App**: Driver-facing mobile interface for HOS logging
2. **ELD Integration**: Electronic Logging Device data synchronization
3. **Advanced Performance Analytics**: Detailed metrics and benchmarking
4. **Driver Training Module**: Certification tracking and training workflows
5. **Automated Compliance Alerts**: Proactive license/medical expiration notifications
6. **Driver Communication**: In-app messaging and notifications
7. **Payroll Integration**: Hours tracking for pay calculation

## Architecture & Implementation Patterns

### Multi-Tenant Architecture

```typescript
// All driver queries MUST include organizationId filter
const drivers = await prisma.driver.findMany({
  where: {
    organizationId: orgId, // CRITICAL for tenant isolation
    status: { not: 'TERMINATED' },
  },
});
```

### RBAC Implementation

Current permission matrix for `/drivers` routes:

- **Admin**: Full CRUD access to all drivers
- **Dispatcher**: Read/write access for assignments and status
- **Driver**: Read-only access to own profile and loads
- **Compliance Officer**: Read/write for compliance-related data

### HOS Status Calculation

The system implements DOT HOS regulations:

```typescript
// HOS limits (in minutes)
const DRIVE_LIMIT = 11 * 60; // 11 hours driving
const ON_DUTY_LIMIT = 14 * 60; // 14 hours on-duty
const CYCLE_LIMIT = 70 * 60; // 70 hours in 8 days

function calculateHosStatus(driverId: string, hosLogs: HosLog[]): DriverHOSStatus {
  // Real-time compliance calculation with violation detection
}
```

### Assignment Management

Driver assignments link to loads and vehicles:

```typescript
interface DriverAssignment {
  id: string;
  driverId: string;
  loadId?: string;
  vehicleId?: string;
  assignmentType: 'load' | 'maintenance' | 'training' | 'other';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  scheduledStart: string;
  instructions?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
```

## RBAC & Security Requirements

### Route Protection

```typescript
// middleware.ts patterns for driver routes
'/:orgId/drivers': [ADMIN, DISPATCHER, COMPLIANCE_OFFICER, VIEWER],
'/:orgId/drivers/:userId': [DRIVER, ADMIN, DISPATCHER, COMPLIANCE_OFFICER] // Driver can access own profile
```

### Action-Level Permissions

```typescript
// driverActions.ts - Always validate permissions
export async function createDriverAction(tenantId: string, data: DriverFormData) {
  const { userId } = await auth();
  // Validate user has driver:create permission for this org
  // NEVER trust client-side tenantId - verify against user's org membership
}
```

### Data Isolation Patterns

- Every driver query MUST filter by `organizationId`
- Driver dashboard only shows own data unless user has elevated permissions
- Assignment actions validate driver belongs to same organization

## Database Integration (Neon/Prisma)

### Query Optimization

```typescript
// Efficient driver list with related data
const drivers = await prisma.driver.findMany({
  where: { organizationId: orgId },
  include: {
    loads: {
      where: { status: { in: ['ASSIGNED', 'IN_TRANSIT'] } },
      take: 1,
    },
    complianceDocuments: {
      where: {
        type: { in: ['cdl_license', 'medical_certificate'] },
        status: 'ACTIVE',
      },
    },
  },
  orderBy: { lastName: 'asc' },
});
```

### Performance Considerations

- Use database indexes on `organizationId`, `status`, `licenseExpiration`
- Implement pagination for large driver fleets
- Cache HOS status calculations with appropriate TTL
- Use optimistic updates for real-time status changes

### Migration Patterns

```sql
-- Add new driver fields with proper defaults
ALTER TABLE "Driver" ADD COLUMN "safetyScore" INTEGER DEFAULT 100;
ALTER TABLE "Driver" ADD COLUMN "violationCount" INTEGER DEFAULT 0;

-- Update existing data
UPDATE "Driver" SET "safetyScore" = 100 WHERE "safetyScore" IS NULL;
```

## Fetchers & Actions Implementation

### Data Fetching Patterns

```typescript
// lib/fetchers/driverFetchers.ts
export async function listDriversByOrg(
  organizationId: string,
  filters: DriverFilters
): Promise<DriverListResponse> {
  // Implement pagination, search, status filtering
  // Return standardized response format
}

export async function getDriverById(driverId: string): Promise<Driver | null> {
  // Include related data (current assignment, documents, HOS status)
  // Validate permissions based on requesting user
}
```

### Server Actions

```typescript
// lib/actions/driverActions.ts
export async function createDriverAction(
  tenantId: string,
  data: DriverFormData
): Promise<DriverActionResult> {
  // 1. Validate permissions
  // 2. Parse and validate data with Zod
  // 3. Check for duplicate CDL numbers
  // 4. Create driver record
  // 5. Log audit event
  // 6. Revalidate cache
}
```

### Error Handling

```typescript
// Consistent error response format
interface DriverActionResult {
  success: boolean;
  data?: Driver;
  error?: string;
  code?: 'UNAUTHORIZED' | 'DUPLICATE_CDL' | 'VALIDATION_ERROR';
}
```

## Testing Requirements

### Unit Tests

- Driver form validation (Zod schemas)
- HOS calculation logic accuracy
- Permission validation for all actions
- Assignment business logic

### Integration Tests

- Driver CRUD operations with database
- Multi-tenant data isolation
- Assignment workflow end-to-end
- Compliance expiration alerts

### E2E Tests

- Driver onboarding workflow
- HOS violation detection
- Assignment and dispatch integration
- Mobile driver app functionality

## Performance & Optimization

### Caching Strategy

```typescript
// Cache HOS status for 5 minutes
const CACHE_TTL = {
  HOS_STATUS: 5 * 60 * 1000,
  DRIVER_LIST: 10 * 60 * 1000,
  DRIVER_PROFILE: 15 * 60 * 1000,
};
```

### Real-time Updates

- Use React 19 `use()` hook for HOS status polling
- WebSocket connections for assignment notifications
- Optimistic UI updates for status changes

### Database Optimization

- Composite indexes on (organizationId, status, licenseExpiration)
- Partial indexes for active drivers only
- Query result caching for frequently accessed data

## Issues & Misconfigurations to Address

### High Priority Issues

1. **Incomplete HOS Tracking**: Need real ELD integration and automated logging
2. **Missing Mobile Interface**: Driver mobile app for status updates and HOS
3. **Limited Performance Analytics**: Basic metrics need enhancement
4. **Manual Compliance Alerts**: Need automated expiration notifications
5. **Assignment Validation**: Better availability checking before assignment
6. **Document Management**: File upload and storage for driver documents

### Common Misconfigurations

1. **Tenant Boundary Violations**: Queries missing organizationId filters
2. **Permission Bypassing**: Client-side permissions without server validation
3. **HOS Calculation Errors**: Incorrect time zone handling or daylight savings
4. **Assignment Conflicts**: Double-booking drivers or invalid status transitions
5. **Data Synchronization**: Driver status not updating across related entities
6. **Cache Invalidation**: Updates not clearing cached driver data

### Security Vulnerabilities

1. **Driver Profile Access**: Drivers accessing other drivers' profiles
2. **Org Switching**: Users accessing drivers from wrong organization
3. **Data Leakage**: Driver PII visible to unauthorized roles
4. **Assignment Manipulation**: Invalid assignment modifications

## What Needs to be Created for "Shippability"

### 1. Enhanced HOS Management

- **ELD Integration**: Connect with popular ELD devices for automatic logging
- **Violation Alerts**: Real-time notifications for HOS violations
- **Mobile HOS Logging**: Driver app for manual status updates
- **Compliance Dashboard**: Overview of fleet HOS compliance status

### 2. Advanced Driver Analytics

- **Performance Metrics**: Safety scores, efficiency ratings, delivery performance
- **Comparative Analytics**: Driver rankings and peer comparisons
- **Training Recommendations**: Identify improvement areas automatically
- **Cost Analysis**: Driver-related cost tracking and optimization

### 3. Mobile Driver Application

- **Load Management**: View assignments, update status, upload PODs
- **HOS Logging**: Easy status changes with location tracking
- **Document Camera**: Scan and upload required documents
- **Communication**: Message dispatch and receive notifications

### 4. Automated Compliance System

- **Expiration Tracking**: License, medical, certification monitoring
- **Renewal Reminders**: Automated email/SMS notifications
- **Document Workflow**: Upload, review, and approval processes
- **Audit Trail**: Complete compliance history tracking

### 5. Integration APIs

- **Payroll Systems**: Export hours for wage calculation
- **Background Check**: Automated driver screening integration
- **Training Platforms**: Sync certification and training records
- **Insurance Systems**: Driver record sharing for policy management

## Success Criteria

### Functional Requirements

- [ ] Complete driver CRUD operations with proper validation
- [ ] Real-time HOS status calculation and violation detection
- [ ] Assignment management with conflict prevention
- [ ] Document upload and expiration tracking
- [ ] Performance analytics and reporting
- [ ] Mobile driver interface for core functions

### Technical Requirements

- [ ] Sub-200ms response times for driver list and profile pages
- [ ] 99.9% uptime for HOS calculation services
- [ ] Zero data leakage between tenant organizations
- [ ] Complete audit trail for all driver-related actions
- [ ] Mobile app works offline with sync capabilities

### Compliance Requirements

- [ ] DOT HOS regulation compliance (11/14/70 hour rules)
- [ ] CDL and medical certificate tracking
- [ ] Driver qualification file (DQF) management
- [ ] Safety performance monitoring and reporting
- [ ] Drug and alcohol testing record integration

## GitHub Workflow Integration

### Issue Creation

```markdown
## Driver Domain Issue Template

**Type**: [Feature|Bug|Enhancement|Compliance] **Priority**: [P0|P1|P2|P3] **Estimated Effort**:
[S|M|L|XL]

### Description

[Clear description of the issue or feature]

### Acceptance Criteria

- [ ] Specific, testable requirements
- [ ] Performance benchmarks if applicable
- [ ] Compliance requirements if applicable

### Technical Notes

- Database migrations needed: [Yes/No]
- Breaking changes: [Yes/No]
- Dependencies: [List any dependencies]

### Testing Requirements

- [ ] Unit tests for business logic
- [ ] Integration tests for database operations
- [ ] E2E tests for user workflows
```

### PR Guidelines

- **Branch naming**: `feature/drivers-[feature-name]` or `fix/drivers-[issue-description]`
- **Required reviews**: Minimum 2 reviewers for driver-related changes
- **CI/CD checks**: All tests must pass, including HOS calculation accuracy
- **Performance validation**: Driver operations must meet response time requirements

## Resources & Documentation

### External APIs & Integrations

- **ELD Vendors**: Research integration with Samsara, Geotab, Fleet Complete
- **DOT Regulations**: Current HOS rules and compliance requirements
- **CDL Databases**: State-specific license verification systems
- **Background Check**: Integration with screening service providers

### Code References

- **Core Files**: `types/drivers.ts`, `schemas/drivers.ts`, `lib/actions/driverActions.ts`
- **UI Components**: `components/drivers/`, `features/drivers/`
- **HOS Utilities**: `lib/utils/hos.ts` for compliance calculations
- **Database Schema**: `prisma/schema.prisma` Driver model

### Development Guidelines

- Follow established patterns in `lib/actions/dispatchActions.ts` for consistency
- Use TypeScript strictly - no `any` types in driver-related code
- Implement proper error boundaries for HOS calculation failures
- Ensure all driver operations are properly audited
- Test HOS calculations against DOT regulation examples

This prompt provides comprehensive guidance for developing the Drivers domain with proper
multi-tenancy, security, compliance, and performance considerations. The domain should integrate
seamlessly with Dispatch, Compliance, and Analytics domains while maintaining strict data isolation
and regulatory compliance.
