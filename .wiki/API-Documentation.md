# FleetFusion API Documentation

This document provides comprehensive API documentation for FleetFusion's server-side architecture,
including webhooks, server actions, data fetchers, and route handlers.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Webhooks](#webhooks)
- [Server Actions](#server-actions)
- [Data Fetchers](#data-fetchers)
- [API Routes](#api-routes)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)

## Overview

FleetFusion uses a modern Next.js architecture with:

- **Server Actions** for mutations and form handling
- **Server Components** with data fetchers for data retrieval
- **API Routes** for external integrations and webhooks
- **Clerk** for authentication and user management
- **Neon PostgreSQL** for data persistence

### Architecture Principles

- Server-first approach with minimal client-side JavaScript
- Type-safe operations with TypeScript
- RBAC (Role-Based Access Control) throughout
- Real-time synchronization via webhooks
- Comprehensive error handling and logging

## Authentication

All API operations require proper authentication and authorization through Clerk.

### Session Validation

```typescript
import { auth } from '@clerk/nextjs';

export async function validateSession() {
  const { userId, orgId, orgRole } = auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return { userId, orgId, orgRole };
}
```

### Permission Checking

```typescript
import { checkPermission } from '@/lib/auth/permissions';

export async function requirePermission(permission: string) {
  const { userId, orgId } = await validateSession();

  const hasPermission = await checkPermission(userId, orgId, permission);
  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
}
```

## Webhooks

### Clerk Webhook Handler

**Endpoint**: `/api/clerk/webhook-handler`  
**Method**: `POST`  
**Purpose**: Synchronize Clerk authentication events with the database

#### Supported Events

| Event Type                       | Description                  | Action                           |
| -------------------------------- | ---------------------------- | -------------------------------- |
| `user.created`                   | New user registration        | Create user record in database   |
| `user.updated`                   | User profile changes         | Update user metadata and profile |
| `user.deleted`                   | User account deletion        | Soft delete user records         |
| `organization.created`           | New organization created     | Create organization record       |
| `organization.updated`           | Organization details changed | Update organization metadata     |
| `organization.deleted`           | Organization deleted         | Handle organization cleanup      |
| `organizationMembership.created` | User joined organization     | Create membership record         |
| `organizationMembership.updated` | Membership role changed      | Update user permissions          |
| `organizationMembership.deleted` | User left organization       | Remove access permissions        |
| `session.created`                | New user session             | Log session activity             |
| `session.ended`                  | Session terminated           | Update session logs              |

#### Webhook Implementation

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const body = await request.text();
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const evt = wh.verify(body, {
      'svix-id': svix_id!,
      'svix-timestamp': svix_timestamp!,
      'svix-signature': svix_signature!,
    });

    const { type, data } = evt;

    // Route to appropriate handler
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'organization.created':
        await handleOrganizationCreated(data);
        break;
      // Additional event handlers...
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

#### Event Handlers

```typescript
async function handleUserCreated(userData: any) {
  await DatabaseQueries.createUser({
    clerkId: userData.id,
    email: userData.email_addresses[0]?.email_address,
    firstName: userData.first_name,
    lastName: userData.last_name,
    imageUrl: userData.image_url,
    createdAt: new Date(userData.created_at),
  });
}

async function handleOrganizationCreated(orgData: any) {
  await DatabaseQueries.createOrganization({
    clerkId: orgData.id,
    name: orgData.name,
    slug: orgData.slug,
    imageUrl: orgData.image_url,
    createdAt: new Date(orgData.created_at),
  });
}
```

### Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const webhookRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
});

export async function applyRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await webhookRateLimit.limit(identifier);

  if (!success) {
    throw new Error('Rate limit exceeded');
  }

  return { limit, reset, remaining };
}
```

## Server Actions

Server Actions handle all mutations and form submissions in FleetFusion.

### Location and Structure

All server actions are located in `lib/actions/*.ts` organized by domain:

- `lib/actions/users.ts` - User management actions
- `lib/actions/organizations.ts` - Organization management
- `lib/actions/vehicles.ts` - Vehicle/asset management
- `lib/actions/loads.ts` - Load management
- `lib/actions/onboarding.ts` - Onboarding flow

### User Management Actions

#### Create User

```typescript
'use server';

import { auth } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'dispatcher', 'driver', 'compliance']),
});

export async function createUser(formData: FormData) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:admin:manage_users_and_roles');

  const validatedFields = createUserSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const user = await DatabaseQueries.createUser({
      ...validatedFields.data,
      organizationId: orgId,
      createdBy: userId,
    });

    revalidatePath('/dashboard/users');
    return { success: true, user };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Failed to create user' };
  }
}
```

#### Update User

```typescript
'use server';

export async function updateUser(userId: string, formData: FormData) {
  const { userId: currentUserId, orgId } = auth();

  if (!currentUserId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:admin:manage_users_and_roles');

  const validatedFields = updateUserSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role'),
    isActive: formData.get('isActive') === 'true',
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const user = await DatabaseQueries.updateUser(userId, {
      ...validatedFields.data,
      updatedBy: currentUserId,
    });

    revalidatePath('/dashboard/users');
    revalidatePath(`/dashboard/users/${userId}`);
    return { success: true, user };
  } catch (error) {
    console.error('Update user error:', error);
    return { error: 'Failed to update user' };
  }
}
```

### Vehicle Management Actions

#### Add Vehicle

```typescript
'use server';

const addVehicleSchema = z.object({
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  make: z.string().min(1),
  model: z.string().min(1),
  vin: z.string().length(17),
  licensePlate: z.string().min(1),
  type: z.enum(['truck', 'trailer', 'van']),
});

export async function addVehicle(formData: FormData) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:dispatcher:manage_vehicles');

  const validatedFields = addVehicleSchema.safeParse({
    year: Number(formData.get('year')),
    make: formData.get('make'),
    model: formData.get('model'),
    vin: formData.get('vin'),
    licensePlate: formData.get('licensePlate'),
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid vehicle data' };
  }

  try {
    const vehicle = await DatabaseQueries.createVehicle({
      ...validatedFields.data,
      organizationId: orgId,
      createdBy: userId,
    });

    revalidatePath('/dashboard/vehicles');
    return { success: true, vehicle };
  } catch (error) {
    console.error('Add vehicle error:', error);
    return { error: 'Failed to add vehicle' };
  }
}
```

### Load Management Actions

#### Create Load

```typescript
'use server';

const createLoadSchema = z.object({
  pickupLocation: z.string().min(1),
  deliveryLocation: z.string().min(1),
  pickupDate: z.string().transform(str => new Date(str)),
  deliveryDate: z.string().transform(str => new Date(str)),
  weight: z.number().positive(),
  rate: z.number().positive(),
  description: z.string().optional(),
});

export async function createLoad(formData: FormData) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:dispatcher:create_edit_loads');

  const validatedFields = createLoadSchema.safeParse({
    pickupLocation: formData.get('pickupLocation'),
    deliveryLocation: formData.get('deliveryLocation'),
    pickupDate: formData.get('pickupDate'),
    deliveryDate: formData.get('deliveryDate'),
    weight: Number(formData.get('weight')),
    rate: Number(formData.get('rate')),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid load data' };
  }

  try {
    const load = await DatabaseQueries.createLoad({
      ...validatedFields.data,
      organizationId: orgId,
      createdBy: userId,
      status: 'pending',
    });

    // Create audit log entry
    await DatabaseQueries.createAuditLog({
      organizationId: orgId,
      userId,
      action: 'create_load',
      resourceType: 'load',
      resourceId: load.id,
      metadata: { loadNumber: load.loadNumber },
    });

    revalidatePath('/dashboard/loads');
    return { success: true, load };
  } catch (error) {
    console.error('Create load error:', error);
    return { error: 'Failed to create load' };
  }
}
```

## Data Fetchers

Data fetchers handle all server-side data retrieval and are used in Server Components.

### Location and Structure

All data fetchers are organized in `lib/fetchers/*.ts` by domain:

- `lib/fetchers/users.ts` - User data retrieval
- `lib/fetchers/organizations.ts` - Organization data
- `lib/fetchers/vehicles.ts` - Vehicle data
- `lib/fetchers/loads.ts` - Load data
- `lib/fetchers/dashboard.ts` - Dashboard metrics

### User Data Fetchers

```typescript
import { auth } from '@clerk/nextjs';
import { cache } from 'react';

export const getUserById = cache(async (userId: string): Promise<User | null> => {
  const { orgId } = auth();

  if (!orgId) {
    throw new Error('Unauthorized');
  }

  return await DatabaseQueries.getUserById(userId, orgId);
});

export const getUsersByOrganization = cache(async (): Promise<User[]> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:sys_memberships:read');

  return await DatabaseQueries.getUsersByOrganization(orgId);
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  return await DatabaseQueries.getUserByClerkId(userId);
});
```

### Vehicle Data Fetchers

```typescript
export const getVehiclesByOrganization = cache(async (): Promise<Vehicle[]> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:dispatcher:view_vehicles');

  return await DatabaseQueries.getVehiclesByOrganization(orgId);
});

export const getVehicleById = cache(async (vehicleId: string): Promise<Vehicle | null> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const vehicle = await DatabaseQueries.getVehicleById(vehicleId);

  if (!vehicle || vehicle.organizationId !== orgId) {
    throw new Error('Vehicle not found');
  }

  return vehicle;
});

export const getAvailableVehicles = cache(async (): Promise<Vehicle[]> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  await requirePermission('org:dispatcher:assign_vehicles');

  return await DatabaseQueries.getAvailableVehicles(orgId);
});
```

### Load Data Fetchers

```typescript
export const getLoadsByOrganization = cache(async (filters?: LoadFilters): Promise<Load[]> => {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  // Drivers can only see their assigned loads
  if (orgRole === 'org:driver') {
    await requirePermission('org:driver:view_assigned_loads');
    return await DatabaseQueries.getLoadsByDriver(userId, orgId, filters);
  }

  // Other roles can see all organization loads
  await requirePermission('org:dispatcher:view_loads');
  return await DatabaseQueries.getLoadsByOrganization(orgId, filters);
});

export const getLoadById = cache(async (loadId: string): Promise<Load | null> => {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  const load = await DatabaseQueries.getLoadById(loadId);

  if (!load || load.organizationId !== orgId) {
    throw new Error('Load not found');
  }

  // Drivers can only access their assigned loads
  if (orgRole === 'org:driver' && load.assignedDriverId !== userId) {
    throw new Error('Access denied');
  }

  return load;
});
```

### Dashboard Data Fetchers

```typescript
export const getDashboardMetrics = cache(async (): Promise<DashboardMetrics> => {
  const { userId, orgId, orgRole } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  // Role-based metrics
  switch (orgRole) {
    case 'org:admin':
      await requirePermission('org:admin:access_all_reports');
      return await DatabaseQueries.getAdminDashboardMetrics(orgId);

    case 'org:dispatcher':
      await requirePermission('org:dispatcher:access_dispatch_dashboard');
      return await DatabaseQueries.getDispatcherDashboardMetrics(orgId);

    case 'org:driver':
      await requirePermission('org:driver:view_assigned_loads');
      return await DatabaseQueries.getDriverDashboardMetrics(userId, orgId);

    case 'org:compliance':
      await requirePermission('org:compliance:view_compliance_dashboard');
      return await DatabaseQueries.getComplianceDashboardMetrics(orgId);

    default:
      return await DatabaseQueries.getBasicDashboardMetrics(orgId);
  }
});

export const getRecentActivity = cache(async (limit: number = 10): Promise<ActivityLog[]> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error('Unauthorized');
  }

  return await DatabaseQueries.getRecentActivity(orgId, limit);
});
```

## API Routes

### External API Routes

#### Health Check

**Endpoint**: `/api/health`  
**Method**: `GET`  
**Purpose**: System health monitoring

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    await DatabaseQueries.healthCheck();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        auth: 'operational',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

#### Public API Endpoints

```typescript
// GET /api/v1/loads/public/:id - Public load tracking
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const load = await DatabaseQueries.getPublicLoadInfo(params.id);

    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: load.id,
      status: load.status,
      estimatedDelivery: load.estimatedDeliveryDate,
      currentLocation: load.currentLocation,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Error Handling

### Standardized Error Responses

```typescript
export class APIError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        },
      },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled API error:', error);
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    },
    { status: 500 }
  );
}
```

### Common Error Types

```typescript
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function createError(code: keyof typeof ErrorCodes, message: string): APIError {
  const statusMap = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
  };

  return new APIError(message, statusMap[code], code);
}
```

## Rate Limiting

### Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Different limits for different endpoints
export const rateLimits = {
  api: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, '1 m'),
  }),
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
  }),
  webhook: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, '1 m'),
  }),
};

export async function applyRateLimit(
  type: keyof typeof rateLimits,
  identifier: string
): Promise<void> {
  const { success } = await rateLimits[type].limit(identifier);

  if (!success) {
    throw createError('RATE_LIMITED', 'Rate limit exceeded');
  }
}
```

## Testing

### Server Action Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createUser } from '@/lib/actions/users';

// Mock auth
vi.mock('@clerk/nextjs', () => ({
  auth: () => ({
    userId: 'user_123',
    orgId: 'org_123',
    orgRole: 'org:admin',
  }),
}));

describe('createUser', () => {
  it('should create a user successfully', async () => {
    const formData = new FormData();
    formData.set('firstName', 'John');
    formData.set('lastName', 'Doe');
    formData.set('email', 'john@example.com');
    formData.set('role', 'driver');

    const result = await createUser(formData);

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('john@example.com');
  });

  it('should handle validation errors', async () => {
    const formData = new FormData();
    formData.set('firstName', '');
    formData.set('email', 'invalid-email');

    const result = await createUser(formData);

    expect(result.error).toBe('Invalid fields');
  });
});
```

### Data Fetcher Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getUsersByOrganization } from '@/lib/fetchers/users';

describe('getUsersByOrganization', () => {
  it('should fetch users for organization', async () => {
    // Mock database response
    vi.mocked(DatabaseQueries.getUsersByOrganization).mockResolvedValue([
      { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    ]);

    const users = await getUsersByOrganization();

    expect(users).toHaveLength(1);
    expect(users[0].firstName).toBe('John');
  });

  it('should throw error for unauthorized access', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, orgId: null });

    await expect(getUsersByOrganization()).rejects.toThrow('Unauthorized');
  });
});
```

### API Route Testing

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.services.database).toBe('connected');
  });
});
```

## Performance Optimization

### Caching Strategies

```typescript
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// React cache for single request deduplication
export const getUser = cache(async (id: string) => {
  return await DatabaseQueries.getUserById(id);
});

// Next.js cache for longer-term caching
export const getOrganizationSettings = unstable_cache(
  async (orgId: string) => {
    return await DatabaseQueries.getOrganizationSettings(orgId);
  },
  ['organization-settings'],
  { revalidate: 3600 } // 1 hour
);
```

### Database Query Optimization

```typescript
// Use proper indexing and query optimization
export async function getLoadsWithDrivers(orgId: string) {
  return await db.load.findMany({
    where: { organizationId: orgId },
    include: {
      assignedDriver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          licensePlate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

This API documentation provides a comprehensive guide for working with FleetFusion's server-side
architecture, ensuring consistency, security, and maintainability across all API operations.
