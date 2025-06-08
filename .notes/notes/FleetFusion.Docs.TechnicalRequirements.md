---
id: ylfcdmyzkyd3y1r4jky16gx
title: TechnicalRequirements
desc: ''
updated: 1748447031209
created: 1748296758279
---
# FleetFusion Technical Specification

## Architecture Overview

FleetFusion is a modern, multi-tenant fleet management platform built with Next.js 15, leveraging Server Components and the App Router architecture. The platform provides comprehensive fleet operations management including dispatch, compliance, IFTA reporting, and analytics.

### Technology Stack

| Layer              | Technology   | Version | Purpose                             |
| ------------------ | ------------ | ------- | ----------------------------------- |
| **Frontend**       | Next.js      | 15.x    | React framework with App Router     |
| **UI Framework**   | React        | 19.x    | User interface components           |
| **Language**       | TypeScript   | 5.x     | Type-safe development               |
| **Styling**        | Tailwind CSS | 4.x     | Utility-first CSS framework         |
| **Database**       | PostgreSQL   | 15+     | Primary data store via Neon         |
| **ORM**            | Prisma       | Latest  | Type-safe database queries          |
| **Authentication** | Clerk        | Latest  | User auth & organization management |
| **Hosting**        | Vercel       | Latest  | Edge deployment platform            |
| **Storage**        | Vercel Blob  | Latest  | File storage for documents          |

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Clerk Auth    │    │  PostgreSQL DB  │
│   (Frontend)    │◄──►│   (Identity)    │    │   (Data Store)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  File Storage   │◄─────────────┘
                        │   (Documents)   │
                        └─────────────────┘
```

## Database Design

### Core Schema Structure

The database schema is designed to support multi-tenancy, ensuring data isolation between organizations while allowing shared code and infrastructure. The primary entities include users, organizations, drivers, vehicles, loads, and webhook events.


**Table: `users`**

| Field Name            | Data Type   | Constraints/Notes                              |
| :-------------------- | :---------- | :--------------------------------------------- |
| `id`                  | `text`      | `not null`                                     |
| `clerk_id`            | `text`      | `not null`                                     |
| `organization_id`     | `text`      | `not null`                                     |
| `email`               | `text`      | `not null`                                     |
| `first_name`          | `text`      | `null`                                         |
| `last_name`           | `text`      | `null`                                         |
| `profile_image`       | `text`      | `null`                                         |
| `role`                | `UserRole`  | `not null`                                     |
| `permissions`         | `jsonb`     | `null`                                         |
| `is_active`           | `bool`      | `not null`                                     |
| `last_login`          | `timestamp` | `null`                                         |
| `created_at`          | `timestamp` | `not null`                                     |
| `updated_at`          | `timestamp` | `not null`                                     |
| `onboarding_steps`    | `jsonb`     | `null`                                         |
| `onboarding_complete` | `bool`      | `not null` (inferred from `onboarding_com...`) |

**Table: `organizations`**

| Field Name            | Data Type            | Constraints/Notes     |
| :-------------------- | :------------------- | :-------------------- |
| `id`                  | `text`               | `not null`            |
| `clerk_id`            | `text`               | `not null`            |
| `name`                | `text`               | `not null`            |
| `slug`                | `text`               | `not null`            |
| `dot_number`          | `text`               | `null`                |
| `mc_number`           | `text`               | `null`                |
| `address`             | `text`               | `null`                |
| `city`                | `text`               | `null`                |
| `state`               | `text`               | `null`                |
| `zip`                 | `text`               | `null`                |
| `phone`               | `text`               | `null`                |
| `email`               | `text`               | `null`                |
| `logo_url`            | `text`               | `null`                |
| `subscription_tier`   | `SubscriptionTier`   | `not null` (inferred) |
| `subscription_status` | `SubscriptionStatus` | `not null` (inferred) |
| `max_users`           | `int4`               | `not null`            |
| `billing_email`       | `text`               | `null`                |
| `settings`            | `jsonb`              | `null`                |
| `is_active`           | `bool`               | `not null`            |
| `created_at`          | `timestamp`          | `not null`            |
| `updated_at`          | `timestamp`          | `not null`            |

**Table: `_prisma_migrations`**

| Field Name            | Data Type      | Constraints/Notes                               |
| :-------------------- | :------------- | :---------------------------------------------- |
| `id`                  | `varchar(36)`  | `not null`                                      |
| `checksum`            | `varchar(64)`  | `not null`                                      |
| `finished_at`         | `timestamptz`  | `null`                                          |
| `migration_name`      | `varchar(255)` | `not null`                                      |
| `logs`                | `text`         | `null`                                          |
| `rolled_back_at`      | `timestamptz`  | `null`                                          |
| `started_at`          | `timestamptz`  | `not null`                                      |
| `applied_steps_count` | `int4`         | `not null` (inferred from `applied_steps_c...`) |

**Table: `webhook_events`**

| Field Name         | Data Type   | Constraints/Notes |
| :----------------- | :---------- | :---------------- |
| `id`               | `text`      | `not null`        |
| `event_type`       | `text`      | `not null`        |
| `event_id`         | `text`      | `not null`        |
| `organization_id`  | `text`      | `null`            |
| `user_id`          | `text`      | `null`            |
| `payload`          | `jsonb`     | `not null`        |
| `status`           | `text`      | `not null`        |
| `processing_error` | `text`      | `null`            |
| `processed_at`     | `timestamp` | `null`            |
| `created_at`       | `timestamp` | `not null`        |
| `retry_count`      | `int4`      | `not null`        |



### Enums and Types

```sql
CREATE TYPE user_role AS ENUM (
  'admin',
  'dispatcher',
  'driver', 
  'compliance_officer',
  'accountant',
  'manager',
  'user'
);

CREATE TYPE driver_status AS ENUM (
  'active',
  'inactive',
  'on_leave',
  'terminated'
);

CREATE TYPE vehicle_status AS ENUM (
  'active',
  'inactive', 
  'maintenance',
  'out_of_service'
);

CREATE TYPE load_status AS ENUM (
  'pending',
  'assigned',
  'in_transit',
  'delivered',
  'cancelled'
);
```

### Indexes and Constraints

```sql
-- Performance indexes
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_drivers_org_id ON drivers(organization_id);
CREATE INDEX idx_vehicles_org_id ON vehicles(organization_id);
CREATE INDEX idx_loads_org_id ON loads(organization_id);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_driver_id ON loads(driver_id);

-- Multi-tenancy constraints
ALTER TABLE drivers ADD CONSTRAINT drivers_org_isolation 
  CHECK (organization_id IS NOT NULL);
ALTER TABLE vehicles ADD CONSTRAINT vehicles_org_isolation 
  CHECK (organization_id IS NOT NULL);
ALTER TABLE loads ADD CONSTRAINT loads_org_isolation 
  CHECK (organization_id IS NOT NULL);
```

## Authentication & Authorization

### Multi-Tenant Authentication Flow

1. **User Registration/Login**
   ```
   User → Clerk Auth → Session Claims → Next.js Middleware → Tenant Isolation
   ```

2. **Organization Context**
   ```
   Onboarding → Organization Creation → Clerk Organization → Tenant Context
   ```

3. **Neon Data Sync**
   ```
    Clerk Webhook → Neon Database → User/Organization Sync → Data Consistency
   ```

4. **Role-Based Access Control (RBAC)**
   ```
   User Role → Permission Matrix → Access Control → UI/Functionality
   ```

### Role-Based Access Control (RBAC)

#### Permission Matrix

| Role           | Users | Drivers | Vehicles | Loads | Compliance | IFTA | Analytics | Settings |
| -------------- | ----- | ------- | -------- | ----- | ---------- | ---- | --------- | -------- |
| **Admin**      | RWD   | RWD     | RWD      | RWD   | RWD        | RWD  | RW        | RW       |
| **Dispatcher** | R     | RW      | RW       | RWD   | R          | R    | R         | R        |
| **Driver**     | R     | R       | R        | R     | R          | -    | -         | R        |
| **Compliance** | R     | RW      | RW       | R     | RWD        | R    | R         | R        |
| **Accountant** | R     | R       | R        | R     | R          | RWD  | RW        | R        |
| **Manager**    | R     | R       | R        | R     | R          | R    | RW        | R        |
| **User**       | R     | R       | R        | R     | R          | R    | R         | R        |

*Legend: R=Read, W=Write, D=Delete*

### Middleware Implementation

The Next.js middleware (`middleware.ts`) handles:

```typescript
// Route protection
const protectedRoutes = {
  '/admin/**': ['admin'],
  '/dispatch/**': ['admin', 'dispatcher'],
  '/compliance/**': ['admin', 'compliance_officer'],
  '/ifta/**': ['admin', 'accountant'],
  '/analytics/**': ['admin', 'manager', 'accountant'],
  '/driver/**': ['admin', 'dispatcher', 'driver']
};

// Permission validation
function hasPermission(userRole: string, requiredPermissions: string[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
}
```

## API Design

### RESTful API Structure

```
/api/
├── auth/                  # Clerk User/Org Sync
│   ├── clerk/             # Subcribed Events
│   └── webhook-handler/   # Neon Integration
└── health/                # Health checks
```

### Server Actions

Following Next.js 15 best practices, most data mutations use Server Actions:

```typescript
// lib/actions/drivers.ts
'use server';

export async function createDriver(
  organizationId: string,
  data: CreateDriverInput
): Promise<ActionResult<Driver>> {
  // Validation
  const validated = createDriverSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: 'Invalid input' };
  }

  // Authorization check
  const user = await getCurrentUser();
  if (!hasPermission(user.role, ['drivers:write'])) {
    return { success: false, error: 'Unauthorized' };
  }

  // Database operation
  try {
    const driver = await db.insert(drivers).values({
      ...validated.data,
      organizationId,
    }).returning();
    
    return { success: true, data: driver[0] };
  } catch (error) {
    return { success: false, error: 'Database error' };
  }
}
```

## Frontend Architecture

### Component Structure

```
components/
├── ui/                     # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── table.tsx
├── shared/                 # Shared business components
│   ├── data-table.tsx
│   ├── page-header.tsx
│   └── loading-spinner.tsx
├── auth/                   # Authentication components
│   ├── sign-in-form.tsx
│   └── protected-route.tsx
├── dashboard/              # Dashboard components
│   ├── dashboard-cards.tsx
│   └── quick-actions.tsx
├── drivers/                # Driver management
│   ├── driver-table.tsx
│   ├── driver-form.tsx
│   └── driver-card.tsx
├── vehicles/               # Vehicle management
├── dispatch/               # Dispatch operations
├── compliance/             # Compliance management
├── ifta/                  # IFTA reporting
└── analytics/             # Analytics & reporting
```

### State Management

The application uses a combination of:

1. **Server State**: React Server Components for initial data
2. **Client State**: React 19 hooks (`useState`, `useOptimistic`)
3. **Form State**: Server Actions with `useActionState`
4. **URL State**: Next.js router for navigation state

```typescript
// Example: Optimistic updates for load status
function LoadCard({ load }: { load: Load }) {
  const [optimisticStatus, updateOptimisticStatus] = useOptimistic(
    load.status,
    (currentStatus, newStatus: LoadStatus) => newStatus
  );

  const updateStatus = async (newStatus: LoadStatus) => {
    updateOptimisticStatus(newStatus);
    await updateLoadStatus(load.id, newStatus);
  };

  return (
    <div className="load-card">
      <span className={`status-${optimisticStatus}`}>
        {optimisticStatus}
      </span>
      {/* Status update controls */}
    </div>
  );
}
```

### Routing Structure

```
app/
├── layout.tsx             # Root layout
├── page.tsx               # Landing page
├── globals.css            # Global styles
├── (auth)/                # Auth group
│   ├── layout.tsx
│   ├── sign-in/
│   ├── sign-up/
│   ├── forgot-password/
│   └── onboarding/
├── (funnel)/              # Marketing group
│   ├── layout.tsx
│   ├── about/
│   ├── pricing/
│   └── contact/
├── (tenant)/              # Tenant app group
│   └── [orgId]/
│       ├── layout.tsx     # Tenant layout
│       ├── dashboard/
│       ├── drivers/
│       ├── vehicles/
│       ├── dispatch/
│       ├── compliance/
│       ├── ifta/
│       ├── analytics/
│       └── settings/
├── api/
│   └── auth/                      # Clerk User/Org Sync
│       └── clerk/                 # Subscribed Events
│             └── webhook-handler/ # Neon Integration
```

## Data Flow Patterns

### Server-First Architecture

1. **Initial Page Load**
   ```
   Route → Server Component → Database → Render → Hydrate
   ```

2. **Form Submissions**
   ```
   Form → Server Action → Validation → Database → Revalidate → Update UI
   ```

3. **Real-time Updates**
   ```
   Webhook → Database → Revalidate → Update Components
   ```

### Error Handling

```typescript
// Error boundaries for component errors
export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Server action error handling
export async function createLoad(data: FormData): Promise<ActionResult> {
  try {
    const result = await validateAndCreateLoad(data);
    revalidatePath('/dispatch');
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, fieldErrors: error.fieldErrors };
    }
    return { success: false, error: 'Failed to create load' };
  }
}
```

## Performance Optimization

### Caching Strategy

1. **Static Generation**: Marketing pages and documentation
2. **Incremental Static Regeneration**: Dashboard data with revalidation
3. **Server-Side Rendering**: User-specific protected pages
4. **Client-Side Caching**: API responses with SWR patterns

### Database Optimization

```sql
-- Partitioning for large tables
CREATE TABLE loads_2024 PARTITION OF loads
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Materialized views for analytics
CREATE MATERIALIZED VIEW driver_performance AS
SELECT 
  driver_id,
  COUNT(*) as total_loads,
  AVG(delivery_time) as avg_delivery_time,
  SUM(miles_driven) as total_miles
FROM loads 
WHERE status = 'delivered'
GROUP BY driver_id;

-- Indexes for common queries
CREATE INDEX CONCURRENTLY idx_loads_org_status_date 
ON loads(organization_id, status, created_at);
```

### Bundle Optimization

```typescript
// Dynamic imports for large components
const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/analytics-dashboard'),
  { 
    loading: () => <AnalyticsLoader />,
    ssr: false 
  }
);

// Code splitting by route
const DispatchBoard = lazy(() => import('@/features/dispatch/dispatch-board'));
```

## Security Measures

### Data Protection

1. **SQL Injection Prevention**: Parameterized queries via Prisma ORM
2. **XSS Protection**: React's built-in escaping + CSP headers
3. **CSRF Protection**: Server Actions with built-in CSRF tokens
4. **Input Validation**: Zod schemas on client and server

### Authentication Security

1. **JWT Validation**: Clerk handles token verification
2. **Session Management**: Secure HTTP-only cookies
3. **Multi-Factor Authentication**: Clerk's built-in MFA support
4. **Organization Isolation**: Database-level tenant separation

### API Security

```typescript
// Rate limiting
export const config = {
  matcher: '/api/:path*',
  rateLimit: {
    interval: 60000, // 1 minute
    uniqueTokenPerInterval: 500,
  },
};

// Request validation
export async function POST(request: Request) {
  const body = await request.json();
  const validated = apiSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid request' }, 
      { status: 400 }
    );
  }
  
  // Process validated request
}
```

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
import { logger } from '@/lib/logger';

export async function createLoad(data: CreateLoadInput) {
  logger.info('Creating load', {
    organizationId: data.organizationId,
    driverId: data.driverId,
    userId: getCurrentUser().id,
  });
  
  try {
    const result = await db.insert(loads).values(data);
    logger.info('Load created successfully', { loadId: result.id });
    return result;
  } catch (error) {
    logger.error('Failed to create load', { error, data });
    throw error;
  }
}
```

### Performance Monitoring

1. **Core Web Vitals**: Built-in Next.js analytics
2. **Database Performance**: Query timing and optimization
3. **Error Tracking**: Error boundaries and logging
4. **User Analytics**: Usage patterns and feature adoption

## Deployment Architecture

### Production Environment

```yaml
# Vercel deployment configuration
build:
  env:
    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    - CLERK_SECRET_KEY
    - DATABASE_URL
    - BLOB_READ_WRITE_TOKEN
  
functions:
    'app/api/**': 
      runtime: 'nodejs18.x'
      maxDuration: 30
    
edge:
  'middleware.ts':
    runtime: 'edge'
```

### Environment Configuration

```typescript
// Environment validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
```

This technical specification provides a comprehensive overview of FleetFusion's architecture, from database design through deployment considerations.
