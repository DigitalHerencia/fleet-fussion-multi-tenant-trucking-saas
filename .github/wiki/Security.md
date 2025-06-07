# FleetFusion Security & RBAC

## Overview

FleetFusion implements a comprehensive security model combining authentication via Clerk with custom Role-Based Access Control (RBAC) for multi-tenant operations. The system ensures data isolation between organizations while providing fine-grained permissions within each tenant.

## Authentication Architecture

### Clerk Integration

FleetFusion uses Clerk for user authentication and organization management:

```typescript
// Middleware authentication check
export default clerkMiddleware((auth, req) => {
  const { userId, orgId, sessionClaims } = auth();
  
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn();
  }
  
  // Build user context with RBAC permissions
  const userContext = buildUserContext(userId, sessionClaims, orgId);
  
  // Proceed with route protection
  return RouteProtection.checkAccess(req, userContext);
});
```

### Session Claims Structure

Custom session claims extend Clerk's default claims with FleetFusion-specific data:

```typescript
interface CustomSessionClaims {
  abac?: {
    role: SystemRole;
    permissions: Permission[];
    organizationId: string;
  };
  publicMetadata?: {
    role?: string;
    organizationId?: string;
    onboardingComplete?: boolean;
  };
  organizationMetadata?: {
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    subscriptionStatus: 'active' | 'inactive' | 'trial';
    maxUsers: number;
    features: string[];
  };
}
```

## Role-Based Access Control (RBAC)

### System Roles

FleetFusion defines six core roles with distinct permissions:

```typescript
export const SystemRoles = {
  ADMIN: 'admin',                    // Full system access
  DISPATCHER: 'dispatcher',          // Load and driver management
  DRIVER: 'driver',                 // Limited self-service access
  COMPLIANCE_OFFICER: 'compliance_officer', // Compliance and documents
  ACCOUNTANT: 'accountant',         // Financial and reporting
  VIEWER: 'viewer'                  // Read-only access
} as const;
```

### Permission Matrix

| Role | Users | Drivers | Vehicles | Loads | Documents | IFTA | Billing |
|------|-------|---------|----------|--------|-----------|------|---------|
| **Admin** | ✓ Manage | ✓ Manage | ✓ Manage | ✓ Manage | ✓ Manage | ✓ Manage | ✓ Manage |
| **Dispatcher** | ✗ | ✓ Read/Assign | ✓ Read | ✓ Manage | ✓ Read | ✗ | ✗ |
| **Driver** | ✗ | ✓ Own Profile | ✗ | ✓ Read Assigned | ✓ Own Documents | ✗ | ✗ |
| **Compliance** | ✗ | ✓ Read | ✓ Read | ✗ | ✓ Manage | ✗ | ✗ |
| **Accountant** | ✗ | ✗ | ✗ | ✓ Read | ✗ | ✓ Manage | ✓ Read |
| **Viewer** | ✗ | ✓ Read | ✓ Read | ✓ Read | ✓ Read | ✓ Read | ✗ |

### Permission Structure

Permissions follow an action-resource pattern:

```typescript
export interface Permission {
  action: PermissionAction; // create, read, update, delete, manage, assign, approve
  resource: ResourceType;   // user, driver, vehicle, load, document, etc.
}

// Examples
const permissions = [
  { action: 'create', resource: 'load' },     // Can create new loads
  { action: 'assign', resource: 'driver' },   // Can assign drivers to loads
  { action: 'read', resource: 'vehicle' },    // Can view vehicle information
  { action: 'manage', resource: 'document' }  // Full document control
];
```

## Multi-Tenant Isolation

### Organization-Based Tenancy

Every data operation includes organization context for complete tenant isolation:

```typescript
// Database query with tenant isolation
async function getDrivers(organizationId: string, userId: string) {
  // Verify user belongs to organization
  await verifyUserAccess(userId, organizationId);
  
  return await prisma.driver.findMany({
    where: {
      organizationId, // Tenant isolation
      isActive: true
    }
  });
}
```

### Data Access Patterns

1. **Route Level**: Middleware validates organization membership
2. **Service Level**: All database queries include organizationId filter
3. **Component Level**: UI components only show tenant-specific data

```typescript
// Server Action with tenant isolation
'use server';

export async function createLoad(data: CreateLoadInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  // Verify permission
  if (!hasPermission(user, 'create', 'load')) {
    throw new Error('Insufficient permissions');
  }
  
  // Create with tenant context
  return await prisma.load.create({
    data: {
      ...data,
      organizationId: user.organizationId // Automatic tenant isolation
    }
  });
}
```

## Permission Checking

### Server-Side Checks

```typescript
import { hasPermission } from '@/lib/auth/permissions';

// In Server Actions
export async function updateDriver(id: string, data: UpdateDriverInput) {
  const user = await getCurrentUser();
  
  if (!hasPermission(user, 'update', 'driver')) {
    throw new Error('Permission denied');
  }
  
  // Proceed with update...
}

// In Server Components
export default async function DriversPage() {
  const user = await getCurrentUser();
  
  if (!hasPermission(user, 'read', 'driver')) {
    return <AccessDenied />;
  }
  
  // Render component...
}
```

### Client-Side Checks

```typescript
'use client';

import { useUser } from '@/lib/auth/hooks';
import { hasPermission } from '@/lib/auth/permissions';

export function CreateDriverButton() {
  const user = useUser();
  
  if (!hasPermission(user, 'create', 'driver')) {
    return null; // Hide button if no permission
  }
  
  return (
    <Button onClick={handleCreateDriver}>
      Create Driver
    </Button>
  );
}
```

## Route Protection

### Middleware Protection

The middleware handles route-level protection with organization context:

```typescript
export default clerkMiddleware((auth, req) => {
  const { userId, orgId } = auth();
  const { pathname } = req.nextUrl;
  
  // Public routes bypass protection
  if (isPublicRoute(req)) return NextResponse.next();
  
  // Require authentication
  if (!userId) return redirectToSignIn();
  
  // Build user context with RBAC
  const userContext = buildUserContext(userId, sessionClaims, orgId);
  
  // Check route access
  return RouteProtection.checkAccess(req, userContext);
});
```

### Protected Route Patterns

```typescript
const protectedRoutes = {
  // Admin-only routes
  '/tenant/[orgId]/admin': ['admin'],
  
  // Dispatcher routes
  '/tenant/[orgId]/dispatch': ['admin', 'dispatcher'],
  
  // Driver self-service
  '/tenant/[orgId]/driver/[userId]': ['admin', 'driver'],
  
  // Compliance routes
  '/tenant/[orgId]/compliance': ['admin', 'compliance_officer'],
  
  // Financial routes
  '/tenant/[orgId]/ifta': ['admin', 'accountant'],
};
```

## Security Features

### 1. Session Management

- **JWT Tokens**: Clerk-managed secure tokens
- **Session Caching**: 30-second cache for performance
- **Automatic Refresh**: Seamless token renewal
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies

### 2. Data Protection

- **Encryption at Rest**: Neon PostgreSQL encryption
- **Encryption in Transit**: TLS 1.3 for all connections
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries

### 3. Audit Trails

```typescript
// Automatic audit logging
export async function createAuditLog(
  action: string,
  resource: string,
  userId: string,
  organizationId: string,
  details?: Record<string, any>
) {
  await prisma.auditLog.create({
    data: {
      action,
      resource,
      userId,
      organizationId,
      details,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent()
    }
  });
}
```

### 4. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

export async function rateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
```

## Best Practices

### 1. Permission Checks

- ✅ Always check permissions at both route and action levels
- ✅ Use specific permissions rather than role checks
- ✅ Implement defense in depth with multiple layers
- ✅ Cache permission checks for performance

### 2. Data Access

- ✅ Include organizationId in all database queries
- ✅ Validate user belongs to organization before data access
- ✅ Use typed interfaces for all data operations
- ✅ Implement proper error handling and logging

### 3. Frontend Security

- ✅ Hide UI elements based on permissions
- ✅ Validate permissions on server actions
- ✅ Use secure HTTP headers
- ✅ Implement proper error boundaries

## Security Configuration

### Environment Variables

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database Security
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Additional Security
WEBHOOK_SECRET=whsec_...
ENCRYPTION_KEY=...
```

### Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

*This security model provides enterprise-grade protection while maintaining usability and performance for fleet management operations.*
