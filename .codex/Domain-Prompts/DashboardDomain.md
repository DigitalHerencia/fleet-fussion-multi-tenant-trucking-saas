# FleetFusion Dashboard Domain Development Prompt

## Context & Overview

You are an expert full-stack developer working on the **Dashboard Domain** of FleetFusion, a modern
multi-tenant SaaS fleet management platform. The dashboard serves as the central hub for all fleet
operations, providing role-based overview widgets, quick actions, and key performance indicators.

**Technology Stack:**

- Next.js 15 (App Router) + React 19 (Server Components)
- TypeScript 5 with strict typing
- PostgreSQL (Neon) + Prisma ORM
- Clerk Authentication (multi-tenant organizations)
- Tailwind CSS 4 + Shadcn UI
- ABAC (Attribute-Based Access Control)

## Domain Scope & Features

The Dashboard Domain encompasses:

### Core Features

- **Multi-Role Dashboard Layout**: Admin, Dispatcher, Driver, Compliance Officer, Accountant views
- **KPI Widgets**: Fleet utilization, active loads, driver status, vehicle status, compliance alerts
- **Quick Actions**: Create load, assign driver, view reports, check alerts
- **Real-time Updates**: Live status updates for loads, drivers, vehicles
- **Activity Feed**: Recent system activity and notifications
- **Role-Based Content**: Dynamic content based on user permissions

### Tenant Routes

- `app/(tenant)/[orgId]/dashboard/page.tsx` - Main dashboard
- `app/(tenant)/[orgId]/dashboard/[userId]/page.tsx` - User-specific dashboard (if needed)

## Current State Analysis

### Existing Files

- ✅ **Page Component**: `app/(tenant)/[orgId]/dashboard/page.tsx` (basic structure)
- ✅ **Features**: `features/dashboard/quick-actions.tsx` (minimal)
- ✅ **Actions**: `lib/actions/dashboardActions.ts` (exists)
- ⚠️ **Fetchers**: Need to audit `lib/fetchers/` for dashboard-specific data fetching
- ⚠️ **Components**: `components/dashboard/` directory exists but needs full implementation
- ⚠️ **Types**: `types/analytics.ts` and `types/kpi.ts` exist but may need dashboard-specific types

### Database Schema Integration

From `prisma/schema.prisma`, relevant models:

- `Organization` (settings, subscription info)
- `User` (role-based dashboard customization)
- `Load` (active loads KPI)
- `Driver` (driver status KPI)
- `Vehicle` (fleet status KPI)
- `ComplianceAlert` (compliance dashboard widgets)
- `AuditLog` (activity feed)

## GitHub Issue/PR Requirements

When creating GitHub issues or PRs, ensure they:

### Issue Template

```markdown
## Domain: Dashboard

**Epic**: [Dashboard MVP] or [Dashboard Enhancement] **Priority**: High/Medium/Low **Estimated
Effort**: S/M/L/XL

### Description

Brief description of the dashboard feature/fix

### Acceptance Criteria

- [ ] Multi-tenant org isolation enforced
- [ ] RBAC/ABAC permissions implemented
- [ ] TypeScript types are complete
- [ ] Server actions follow 'use server' pattern
- [ ] Responsive design (mobile-first)
- [ ] Test coverage > 80%

### Technical Requirements

- [ ] Prisma queries scoped by organizationId
- [ ] Clerk session validation
- [ ] Error boundaries implemented
- [ ] Loading states handled
- [ ] Revalidation tags for caching

### Definition of Done

- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Deployed to staging
```

### PR Guidelines

- Branch naming: `feature/dashboard-[feature-name]` or `fix/dashboard-[issue]`
- Link to related issues
- Include screenshots for UI changes
- Ensure CI/CD pipeline passes

## Authentication & RBAC Implementation

### Permission Requirements

Reference `lib/auth/permissions.ts` for dashboard access:

```typescript
// Dashboard access permissions from existing RouteProtection
'/:orgId/dashboard/:userId': [
  SystemRoles.ADMIN,
  SystemRoles.DISPATCHER,
  SystemRoles.DRIVER,
  SystemRoles.COMPLIANCE_OFFICER,
  SystemRoles.ACCOUNTANT,
  SystemRoles.VIEWER
]
```

### Required Checks

1. **Middleware Validation**: `middleware.ts` handles route protection
2. **Server Action Security**: Always validate orgId and user permissions
3. **Data Isolation**: All queries must filter by `organizationId`
4. **Role-Based Content**: Show/hide widgets based on user role

### Implementation Pattern

```typescript
// In server actions/fetchers
export async function getDashboardData(orgId: string) {
  const { userId } = await auth();
  const user = await prisma.user.findFirst({
    where: { clerkId: userId, organizationId: orgId },
  });
  if (!user) throw new Error('Unauthorized');

  // Multi-tenant scoped queries
  const data = await prisma.someModel.findMany({
    where: { organizationId: orgId },
    // ...
  });
}
```

## Database & Prisma Guidelines

### Multi-Tenant Patterns

All database queries must include organization isolation:

```typescript
// CORRECT: Always scope by organizationId
const loads = await prisma.load.findMany({
  where: {
    organizationId: orgId,
    status: 'active',
  },
  include: {
    driver: true,
    vehicle: true,
  },
});

// WRONG: Missing tenant isolation
const loads = await prisma.load.findMany({
  where: { status: 'active' }, // ❌ Cross-tenant data leak!
});
```

### Prisma Optimization

- Use `include` for relations, not separate queries
- Implement cursor-based pagination for large datasets
- Use `select` to limit fields returned
- Add proper indexing for dashboard queries

### Connection Pattern

```typescript
import { db } from '@/lib/database/db';
// or
import prisma from '@/lib/database/db';
```

## Fetchers & Actions Implementation

### Dashboard Fetchers Structure

File: `lib/fetchers/dashboardFetchers.ts` (create if missing)

```typescript
import { unstable_cache } from 'next/cache';

export const getDashboardMetrics = unstable_cache(
  async (orgId: string) => {
    // Fetch dashboard KPIs
    const [loads, drivers, vehicles, alerts] = await Promise.all([
      // Active loads count
      // Active drivers count
      // Vehicle status breakdown
      // Critical compliance alerts
    ]);
    return { loads, drivers, vehicles, alerts };
  },
  ['dashboard-metrics'],
  {
    revalidate: 300, // 5 minutes
    tags: [`dashboard-${orgId}`],
  }
);
```

### Dashboard Actions Structure

File: `lib/actions/dashboardActions.ts` (enhance existing)

```typescript
'use server';

export async function updateDashboardPreferences(
  orgId: string,
  userId: string,
  preferences: DashboardPreferences
) {
  // Validate permissions
  // Update user dashboard preferences
  // Revalidate dashboard cache
  revalidatePath(`/${orgId}/dashboard`);
}
```

## Issues & Misconfigurations to Address

### High Priority Issues

1. **Incomplete KPI Widgets**: Dashboard needs real-time metrics
2. **Missing Role-Based Views**: Different dashboards per user role
3. **No Real-time Updates**: Implement live status updates
4. **Incomplete Quick Actions**: Dashboard action buttons need implementation
5. **Missing Activity Feed**: Recent activity component not implemented

### Common Misconfigurations

1. **Missing revalidatePath**: Actions not triggering UI updates
2. **Cross-tenant data leaks**: Queries missing organizationId filter
3. **Permission bypassing**: Client components without proper auth checks
4. **Caching issues**: Missing or incorrect cache tags
5. **Type mismatches**: Prisma types not matching TypeScript interfaces

### Code Quality Issues

1. **Missing error boundaries**: Dashboard crashes on data fetch errors
2. **No loading states**: Poor UX during data loading
3. **Hard-coded values**: Config should come from organization settings
4. **Missing tests**: Dashboard components need comprehensive testing

## Development Roadmap

### Phase 1: Core Dashboard (MVP)

- [ ] Multi-role dashboard layout
- [ ] Basic KPI widgets (loads, drivers, vehicles)
- [ ] Quick action buttons
- [ ] Role-based content filtering
- [ ] Proper error handling

### Phase 2: Enhanced Features

- [ ] Real-time updates via WebSocket/polling
- [ ] Customizable dashboard widgets
- [ ] Activity feed component
- [ ] Dashboard preferences
- [ ] Advanced analytics integration

### Phase 3: Optimization

- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Mobile responsive improvements
- [ ] Accessibility enhancements

## Testing Requirements

### Unit Tests

- Dashboard component rendering
- KPI calculation logic
- Permission-based content display
- Error state handling

### Integration Tests

- Multi-tenant data isolation
- Role-based access control
- Dashboard data fetching
- Action button functionality

### E2E Tests

- Full dashboard workflow
- Role switching scenarios
- Real-time update functionality
- Mobile responsive testing

## Documentation Links

- **Technical Spec**: `doc/Developer-Documentation.md`
- **RBAC Documentation**: `.notes/notes/FleetFusion.RBAC.Tables.md`
- **Multi-tenant Architecture**: `.notes/notes/FleetFusion.Context.Mermaid.md`
- **Middleware Configuration**: `.notes/notes/FleetFusion.Docs.MiddlewareConfiguration.md`

## Success Criteria

### Definition of "Shippable"

The Dashboard Domain is considered shippable when:

1. **✅ Multi-tenant Security**: All data properly isolated by organization
2. **✅ Role-based Access**: Content varies appropriately by user role
3. **✅ Core KPIs**: Essential metrics displayed and updating
4. **✅ Quick Actions**: Primary actions functional and accessible
5. **✅ Performance**: Dashboard loads in <2 seconds
6. **✅ Mobile Responsive**: Fully functional on mobile devices
7. **✅ Error Handling**: Graceful degradation on errors
8. **✅ Test Coverage**: >80% coverage with meaningful tests
9. **✅ Documentation**: Complete API and component documentation
10. **✅ Accessibility**: WCAG 2.1 AA compliance

### Key Performance Indicators

- Dashboard load time < 2 seconds
- Time to first meaningful paint < 1 second
- Zero cross-tenant data leaks in audit
- 100% uptime for dashboard endpoints
- User engagement metrics from analytics

## Next Steps

1. **Audit Current Implementation**: Review existing dashboard components and identify gaps
2. **Create Missing Components**: Implement KPI widgets, quick actions, activity feed
3. **Implement Real-time Updates**: Add live data refresh capability
4. **Add Comprehensive Tests**: Unit, integration, and E2E test coverage
5. **Performance Optimization**: Implement proper caching and optimize queries
6. **Documentation**: Complete API documentation and usage guides

## Contact & Resources

- **Project Repository**: Reference the current codebase structure
- **Team Slack**: Use for real-time collaboration
- **Code Reviews**: All PRs require approval from domain experts
- **Architecture Decisions**: Document in ADR format for major changes

Focus on building a robust, secure, and user-friendly dashboard that serves as the central command
center for fleet operations while maintaining strict multi-tenant isolation and role-based access
control.
