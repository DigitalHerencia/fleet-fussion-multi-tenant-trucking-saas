# FleetFusion Dispatch Domain Development Prompt

✅ **Issue #54** - 🚦 Enhance Dispatch Board & Load Management  

## Context & Overview

You are an expert full-stack developer working on the **Dispatch Domain** of FleetFusion, a modern
multi-tenant SaaS fleet management platform. The dispatch domain is the operational heart of the
system, handling load creation, assignment, tracking, and management throughout the delivery
lifecycle.

**Technology Stack:**

- Next.js 15 (App Router) + React 19 (Server Components)
- TypeScript 5 with strict typing
- PostgreSQL (Neon) + Prisma ORM
- Clerk Authentication (multi-tenant organizations)
- Tailwind CSS 4 + Shadcn UI
- ABAC (Attribute-Based Access Control)

## Domain Scope & Features

The Dispatch Domain encompasses:

### Core Features

- **Load Management**: Create, edit, update, and track shipment loads
- **Driver/Vehicle Assignment**: Assign drivers and vehicles to loads
- **Dispatch Board**: Drag-and-drop interface for load management
- **Status Tracking**: Real-time load status updates throughout lifecycle
- **Route Optimization**: Basic route planning and optimization
- **Communication**: Driver notifications and updates
- **Load Documents**: Proof of delivery, bills of lading, invoices
- **Factoring Integration**: Support for factoring company workflows

### Load Lifecycle States

From `prisma/schema.prisma` LoadStatus enum:

```
draft → pending → posted → booked → confirmed → assigned → dispatched →
in_transit → at_pickup → picked_up → en_route → at_delivery →
delivered → pod_required → completed → invoiced → paid → cancelled → problem
```

### Tenant Routes

- `app/(tenant)/[orgId]/dispatch/[userId]/page.tsx` - Main dispatch board
- `app/(tenant)/[orgId]/dispatch/[userId]/edit/page.tsx` - Load edit form
- `app/(tenant)/[orgId]/dispatch/[userId]/new/page.tsx` - Create new load

## Current State Analysis

### Existing Implementation ✅

- **Page Components**: All tenant routes exist with basic structure
- **Actions**: `lib/actions/dispatchActions.ts` (385 lines, well-implemented)
- **Fetchers**: `lib/fetchers/dispatchFetchers.ts` (needs audit)
- **Components**: `components/dispatch/` directory with multiple components
- **Types**: `types/dispatch.ts` (comprehensive type definitions)
- **Schemas**: `schemas/dispatch.ts` (Zod validation schemas)
- **Features**: `features/dispatch/recent-activity.tsx`

### Database Schema (Prisma Models)

- ✅ **Load**: Primary load entity with comprehensive fields
- ✅ **LoadStatusEvent**: Track status changes with history
- ✅ **Driver**: Assignable resources
- ✅ **Vehicle**: Assignable resources
- ✅ **Organization**: Multi-tenant isolation
- ✅ **AuditLog**: Change tracking

### Key Strengths

- Comprehensive load model with origin/destination coordinates
- Status event tracking for full audit trail
- Multi-reference support (customer, broker info)
- Proper multi-tenant isolation
- RBAC permissions already defined

### Areas Needing Development

1. **Real-time Updates**: WebSocket or polling for live status updates
2. **Advanced Dispatch Board**: Drag-and-drop functionality needs enhancement
3. **Route Optimization**: Basic route planning algorithms
4. **Document Management**: File upload/storage for load documents
5. **Mobile App Support**: Driver mobile interface
6. **Integration APIs**: Third-party load board integrations
7. **Factoring Workflows**: Complete factoring company features

## GitHub Issue/PR Requirements

### Issue Template

```markdown
## Domain: Dispatch

**Epic**: [Dispatch MVP] | [Dispatch Enhancement] | [Dispatch Integration] **Priority**:
High/Medium/Low **Load Status Impact**: [which load statuses affected] **Estimated Effort**:
S/M/L/XL

### Description

Detailed description of dispatch feature/improvement

### Acceptance Criteria

- [ ] Multi-tenant org isolation enforced (organizationId filter)
- [ ] RBAC permissions for DISPATCHER/ADMIN roles
- [ ] Load status transitions follow business rules
- [ ] Real-time updates implemented where needed
- [ ] Error handling for failed operations
- [ ] Audit trail for all load changes
- [ ] Mobile responsive design

### Technical Requirements

- [ ] Server actions use 'use server' directive
- [ ] Prisma queries properly scoped by organizationId
- [ ] Zod schema validation for all inputs
- [ ] TypeScript types updated/created
- [ ] Cache revalidation implemented
- [ ] Status event logging

### Definition of Done

- [ ] Code reviewed and approved
- [ ] Tests passing (unit + integration)
- [ ] Load status transitions tested
- [ ] Documentation updated
- [ ] Deployed to staging

### Related Load Statuses

- [ ] Affects load creation (draft/pending)
- [ ] Affects assignment (assigned/dispatched)
- [ ] Affects tracking (in_transit/delivered)
- [ ] Affects completion (completed/invoiced)
```

### PR Guidelines

- **Branch naming**: `feature/dispatch-[feature-name]` or `fix/dispatch-[issue]`
- **Required labels**: `domain:dispatch`, priority level, status impact
- **Screenshots**: Include for any UI changes, especially dispatch board
- **Load Testing**: Include performance impact for dispatch board operations

## Authentication & RBAC Implementation

### Permission Requirements

From `lib/auth/permissions.ts`:

```typescript
// Dispatch access control
'/:orgId/dispatch/:userId': [
  SystemRoles.DISPATCHER,  // Primary role
  SystemRoles.ADMIN        // Full access
],

// Related permissions
'/:orgId/drivers': [
  SystemRoles.ADMIN,
  SystemRoles.DISPATCHER,
  SystemRoles.COMPLIANCE_OFFICER,
  SystemRoles.VIEWER,
  SystemRoles.ACCOUNTANT
],

'/:orgId/vehicles': [
  SystemRoles.ADMIN,
  SystemRoles.DISPATCHER,
  SystemRoles.COMPLIANCE_OFFICER,
  SystemRoles.VIEWER,
  SystemRoles.ACCOUNTANT
]
```

### Security Implementation

```typescript
// Server action pattern from existing dispatchActions.ts
async function checkUserPermissions(orgId: string, requiredPermissions: string[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await prisma.user.findFirst({
    where: {
      clerkId: userId,
      organizationId: orgId,
    },
  });

  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }

  // Additional permission checks
  return user;
}
```

### Data Access Patterns

```typescript
// ALWAYS scope by organizationId for multi-tenant isolation
export async function getLoads(orgId: string, filters?: LoadFilters) {
  const user = await checkUserPermissions(orgId, ['dispatch:view']);

  return await prisma.load.findMany({
    where: {
      organizationId: orgId, // ⚡ Critical for tenant isolation
      ...filters,
    },
    include: {
      driver: true,
      vehicle: true,
      statusEvents: {
        orderBy: { timestamp: 'desc' },
        take: 5,
      },
    },
  });
}
```

## Database & Prisma Implementation

### Load Model Structure

From `prisma/schema.prisma`:

```prisma
model Load {
  id                    String       @id @default(uuid())
  organizationId        String       @map("organization_id")
  driverId              String?      @map("driver_id")
  vehicleId             String?      @map("vehicle_id")
  trailerId             String?      @map("trailer_id")
  loadNumber            String       @map("load_number")
  status                LoadStatus   @default(pending)

  // Origin/Destination with coordinates
  originAddress         String       @map("origin_address")
  originLat             Decimal?     @map("origin_lat") @db.Decimal(10, 6)
  originLng             Decimal?     @map("origin_lng") @db.Decimal(10, 6)
  destinationAddress    String       @map("destination_address")
  destinationLat        Decimal?     @map("destination_lat") @db.Decimal(10, 6)
  destinationLng        Decimal?     @map("destination_lng") @db.Decimal(10, 6)

  // Financial
  rate                  Decimal?     @db.Decimal(10, 2)
  currency              String?      @default("USD")

  // Dates
  scheduledPickupDate   DateTime?    @map("scheduled_pickup_date")
  actualPickupDate      DateTime?    @map("actual_pickup_date")
  scheduledDeliveryDate DateTime?    @map("scheduled_delivery_date")
  actualDeliveryDate    DateTime?    @map("actual_delivery_date")

  // Relationships
  statusEvents          LoadStatusEvent[]
  driver                Driver?      @relation(fields: [driverId], references: [id])
  vehicle               Vehicle?     @relation("VehicleLoads", fields: [vehicleId], references: [id])
  organization          Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

### Critical Queries

#### Load Assignment Query

```typescript
export async function assignLoadToDriver(
  orgId: string,
  loadId: string,
  driverId: string,
  vehicleId?: string
) {
  // Validate all entities belong to same org
  const [load, driver, vehicle] = await Promise.all([
    prisma.load.findFirst({
      where: { id: loadId, organizationId: orgId },
    }),
    prisma.driver.findFirst({
      where: { id: driverId, organizationId: orgId, status: 'active' },
    }),
    vehicleId
      ? prisma.vehicle.findFirst({
          where: { id: vehicleId, organizationId: orgId, status: 'active' },
        })
      : null,
  ]);

  if (!load || !driver) throw new Error('Invalid assignment');

  // Update load and create status event
  const updatedLoad = await prisma.load.update({
    where: { id: loadId },
    data: {
      driverId,
      vehicleId,
      status: 'assigned',
      lastModifiedBy: 'dispatcher',
      statusEvents: {
        create: {
          status: 'assigned',
          timestamp: new Date(),
          source: 'dispatcher',
          notes: `Assigned to driver ${driver.firstName} ${driver.lastName}`,
        },
      },
    },
    include: {
      driver: true,
      vehicle: true,
      statusEvents: true,
    },
  });

  return updatedLoad;
}
```

### Performance Optimization

- **Pagination**: Implement cursor-based pagination for load lists
- **Indexes**: Ensure proper indexing on organizationId, status, dates
- **Caching**: Use `unstable_cache` for frequently accessed data
- **Batch Operations**: Support bulk load operations

## Fetchers & Actions Architecture

### Enhanced Dispatch Fetchers

File: `lib/fetchers/dispatchFetchers.ts`

```typescript
import { unstable_cache } from 'next/cache';

export const getDispatchBoardData = unstable_cache(
  async (orgId: string, filters?: DispatchFilters) => {
    const [loads, availableDrivers, availableVehicles] = await Promise.all([
      getActiveLoads(orgId, filters),
      getAvailableDrivers(orgId),
      getAvailableVehicles(orgId),
    ]);

    return {
      loads: loads.map(formatLoadForBoard),
      drivers: availableDrivers,
      vehicles: availableVehicles,
      statistics: calculateDispatchMetrics(loads),
    };
  },
  ['dispatch-board'],
  {
    revalidate: 300, // 5 minutes
    tags: [`dispatch-${orgId}`, `loads-${orgId}`],
  }
);

export const getLoadDetails = unstable_cache(
  async (orgId: string, loadId: string) => {
    return await prisma.load.findFirst({
      where: { id: loadId, organizationId: orgId },
      include: {
        driver: true,
        vehicle: true,
        trailer: true,
        statusEvents: {
          orderBy: { timestamp: 'desc' },
        },
        organization: {
          select: { name: true, settings: true },
        },
      },
    });
  },
  ['load-details'],
  {
    revalidate: 60, // 1 minute for active loads
    tags: [`load-${loadId}`, `loads-${orgId}`],
  }
);
```

### Dispatch Actions Enhancement

File: `lib/actions/dispatchActions.ts` (existing, needs enhancement)

Priority actions to implement/improve:

```typescript
'use server';

// Status transition with business rules
export async function updateLoadStatus(
  orgId: string,
  loadId: string,
  newStatus: LoadStatus,
  location?: { lat: number; lng: number },
  notes?: string
) {
  // Validate status transition rules
  // Create status event
  // Update load
  // Notify relevant parties
  // Revalidate cache
}

// Real-time location update
export async function updateLoadLocation(
  orgId: string,
  loadId: string,
  location: { lat: number; lng: number },
  driverId: string
) {
  // Validate driver is assigned to load
  // Update location
  // Create tracking event
}

// Bulk operations for efficiency
export async function bulkAssignLoads(orgId: string, assignments: LoadAssignment[]) {
  // Validate all assignments
  // Batch update loads
  // Create status events
  // Send notifications
}
```

## Issues & Misconfigurations to Address

### High Priority Issues

1. **Incomplete Real-time Updates**: Dispatch board needs live status updates
2. **Missing Route Optimization**: No route planning or optimization logic
3. **Limited Mobile Support**: Driver mobile interface needs development
4. **Document Management**: Load document upload/storage not fully implemented
5. **Status Transition Validation**: Need business rule enforcement for status changes
6. **Performance Issues**: Dispatch board may be slow with large datasets

### Common Misconfigurations

1. **Status Transition Bugs**: Invalid status changes allowed
2. **Assignment Validation**: Missing checks for driver/vehicle availability
3. **Cross-tenant Data**: Queries missing organizationId filters
4. **Cache Invalidation**: Updates not properly clearing cached data
5. **Permission Bypassing**: Client-side checks without server validation
6. **Coordinate Validation**: Invalid lat/lng values causing map issues

### Integration Issues

1. **Third-party APIs**: Load board integrations not implemented
2. **Factoring Company**: Incomplete factoring workflows
3. **Mobile App**: Driver mobile app API endpoints missing
4. **Notification System**: Driver notifications not working
5. **Analytics Integration**: Dispatch metrics not feeding into analytics

## Development Roadmap

### Phase 1: Core Dispatch (MVP Ready)

- [x] Load CRUD operations
- [x] Basic assignment functionality
- [ ] Status transition validation
- [ ] Real-time board updates
- [ ] Mobile responsive dispatch board
- [ ] Document upload/management

### Phase 2: Advanced Features

- [ ] Drag-and-drop dispatch board
- [ ] Route optimization algorithms
- [ ] Advanced filtering/search
- [ ] Bulk operations UI
- [ ] Driver mobile app integration
- [ ] Load board integrations

### Phase 3: Enterprise Features

- [ ] AI-powered load matching
- [ ] Predictive analytics
- [ ] Advanced reporting
- [ ] API for third-party integrations
- [ ] Multi-carrier coordination
- [ ] Factoring automation

## Testing Requirements

### Unit Tests

- Load creation and validation
- Status transition logic
- Assignment validation rules
- Business rule enforcement
- Permission checking

### Integration Tests

- End-to-end load lifecycle
- Multi-tenant data isolation
- Real-time update functionality
- Document upload/storage
- Mobile API endpoints

### Performance Tests

- Dispatch board with 1000+ loads
- Concurrent load assignments
- Real-time update scalability
- Database query optimization
- Cache effectiveness

## Documentation Links

- **Technical Spec**: `doc/Developer-Documentation.md`
- **Database Schema**: `prisma/schema.prisma` (Load, LoadStatusEvent models)
- **RBAC Tables**: `.notes/notes/FleetFusion.RBAC.Tables.md`
- **Architecture Overview**: `.notes/notes/FleetFusion.Architecture.Domains.md`
- **API Documentation**: Auto-generated from TypeScript types

## Success Criteria

### Definition of "Shippable"

The Dispatch Domain is ready for production when:

1. **✅ Load Lifecycle Management**: Complete load lifecycle from creation to completion
2. **✅ Assignment System**: Robust driver/vehicle assignment with validation
3. **✅ Real-time Updates**: Live status updates on dispatch board
4. **✅ Multi-tenant Security**: Complete org isolation and RBAC enforcement
5. **✅ Mobile Responsive**: Fully functional on mobile devices
6. **✅ Status Validation**: Business rules enforced for status transitions
7. **✅ Document Management**: Load documents properly stored and accessible
8. **✅ Performance**: Dispatch board responsive with 500+ active loads
9. **✅ Error Handling**: Graceful error handling and recovery
10. **✅ Audit Trail**: Complete tracking of all load changes

### Key Performance Indicators

- Load assignment time < 30 seconds
- Dispatch board load time < 3 seconds
- Status update propagation < 5 seconds
- 99.9% uptime for dispatch operations
- Zero cross-tenant data leaks

### Business Rules Validation

- Driver can only be assigned to one active load at a time
- Vehicle availability checked before assignment
- Status transitions follow defined workflow
- Required documents uploaded before completion
- Proper permissions for all operations

## Next Steps

1. **Audit Existing Dispatch Board**: Review current implementation and identify gaps
2. **Implement Real-time Updates**: Add WebSocket or polling for live updates
3. **Enhance Mobile Support**: Optimize dispatch interface for mobile devices
4. **Add Document Management**: Complete file upload and storage system
5. **Performance Optimization**: Optimize queries and implement proper caching
6. **Testing Suite**: Comprehensive test coverage for all dispatch operations

## Architecture Considerations

### Real-time Architecture

- **Server-Sent Events**: For dispatch board updates
- **WebSocket**: For driver mobile app communication
- **Optimistic Updates**: For better UX during load operations
- **Conflict Resolution**: Handle concurrent load assignments

### Scalability Planning

- **Database Partitioning**: Consider partitioning by organization
- **Caching Strategy**: Multi-layer caching for dispatch board data
- **Background Jobs**: Process heavy operations asynchronously
- **Load Balancing**: Distribute dispatch operations across servers

Focus on building a robust, efficient dispatch system that can handle high-volume operations while
maintaining data integrity and providing excellent user experience for dispatchers and drivers.
