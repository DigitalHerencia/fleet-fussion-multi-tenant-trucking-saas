---
id: ylz5yfr4megi6rboal1xd53
title: Appendix
desc: ''
updated: 1748305117535
created: 1748296914280
---
# FleetFusion Appendix

## A. Database Schema Reference

### Complete Table Definitions

```sql
-- Core Organization Management
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_status subscription_status DEFAULT 'inactive',
  max_users INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role user_role NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_email_per_org UNIQUE (organization_id, email)
);

-- Driver Management
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  employee_id VARCHAR(50),
  license_number VARCHAR(50) NOT NULL,
  license_state VARCHAR(2) NOT NULL,
  license_expiry DATE NOT NULL,
  medical_cert_number VARCHAR(50),
  medical_cert_expiry DATE,
  hazmat_endorsement BOOLEAN DEFAULT false,
  hazmat_expiry DATE,
  status driver_status DEFAULT 'active',
  hire_date DATE,
  phone VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_license_per_org UNIQUE (organization_id, license_number)
);

-- Vehicle Management
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vin VARCHAR(17) UNIQUE NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  license_state VARCHAR(2) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
  vehicle_type vehicle_type NOT NULL,
  fuel_type fuel_type DEFAULT 'diesel',
  status vehicle_status DEFAULT 'active',
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  current_mileage INTEGER DEFAULT 0,
  last_service_date DATE,
  next_service_due INTEGER,
  insurance_policy VARCHAR(100),
  insurance_expiry DATE,
  registration_expiry DATE,
  inspection_expiry DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load Management
CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  load_number VARCHAR(50) NOT NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_contact VARCHAR(100),
  customer_phone VARCHAR(20),
  pickup_address TEXT NOT NULL,
  pickup_city VARCHAR(100) NOT NULL,
  pickup_state VARCHAR(2) NOT NULL,
  pickup_zip VARCHAR(10) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME,
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_state VARCHAR(2) NOT NULL,
  delivery_zip VARCHAR(10) NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  cargo_description TEXT,
  cargo_weight DECIMAL(10,2),
  cargo_value DECIMAL(12,2),
  rate DECIMAL(10,2),
  fuel_surcharge DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(12,2),
  status load_status DEFAULT 'pending',
  priority load_priority DEFAULT 'normal',
  miles_estimated INTEGER,
  miles_actual INTEGER,
  fuel_used DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_load_number_per_org UNIQUE (organization_id, load_number)
);

-- Compliance Documents
CREATE TABLE compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  file_type VARCHAR(50),
  issue_date DATE,
  expiry_date DATE,
  status document_status DEFAULT 'active',
  notes TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IFTA Reporting
CREATE TABLE ifta_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  status ifta_status DEFAULT 'in_progress',
  total_miles INTEGER DEFAULT 0,
  total_gallons DECIMAL(10,2) DEFAULT 0,
  tax_due DECIMAL(10,2) DEFAULT 0,
  filed_date DATE,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_by UUID REFERENCES users(id),
  CONSTRAINT unique_ifta_report_per_org UNIQUE (organization_id, year, quarter)
);

-- This table seems to be part of ifta_reports or not used based on the latest schema.
-- CREATE TABLE ifta_entries (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
--   quarter_id UUID NOT NULL REFERENCES ifta_reports(id) ON DELETE CASCADE, -- Changed from ifta_quarters
--   vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
--   jurisdiction VARCHAR(2) NOT NULL,
--   miles_driven INTEGER NOT NULL DEFAULT 0,
--   fuel_purchased DECIMAL(10,2) NOT NULL DEFAULT 0,
--   fuel_gallons DECIMAL(10,2) NOT NULL DEFAULT 0,
--   tax_rate DECIMAL(6,4) NOT NULL DEFAULT 0,
--   tax_due DECIMAL(10,2) NOT NULL DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  status VARCHAR(50) DEFAULT 'received', -- e.g., received, processing, success, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

### Enum Definitions

```sql
-- User Roles
CREATE TYPE user_role AS ENUM (
  'admin',
  'dispatcher',
  'driver',
  'compliance_officer',
  'accountant',
  'manager',
  'user'
);

-- Driver Status
CREATE TYPE driver_status AS ENUM (
  'active',
  'inactive',
  'on_leave',
  'terminated'
);

-- Vehicle Types and Status
CREATE TYPE vehicle_type AS ENUM (
  'tractor',
  'trailer',
  'straight_truck',
  'van',
  'pickup'
);

CREATE TYPE vehicle_status AS ENUM (
  'active',
  'inactive',
  'maintenance',
  'out_of_service',
  'sold'
);

CREATE TYPE fuel_type AS ENUM (
  'diesel',
  'gasoline',
  'electric',
  'hybrid'
);

-- Load Management
CREATE TYPE load_status AS ENUM (
  'pending',
  'assigned',
  'en_route_pickup',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled'
);

CREATE TYPE load_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Compliance
CREATE TYPE document_type AS ENUM (
  'driver_license',
  'medical_certificate',
  'hazmat_endorsement',
  'vehicle_registration',
  'insurance_policy',
  'inspection_certificate',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'active',
  'expired',
  'pending_renewal',
  'cancelled'
);

-- Subscription Management
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'basic',
  'pro',
  'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'inactive',
  'trialing',
  'past_due',
  'cancelled'
);

-- IFTA
CREATE TYPE ifta_status AS ENUM (
  'in_progress',
  'ready_to_file',
  'filed',
  'overdue'
);
```

### Database Indexes

```sql
-- Performance Indexes
CREATE INDEX CONCURRENTLY idx_users_org_role ON users(organization_id, role);
CREATE INDEX CONCURRENTLY idx_drivers_org_status ON drivers(organization_id, status);
CREATE INDEX CONCURRENTLY idx_vehicles_org_status ON vehicles(organization_id, status);
CREATE INDEX CONCURRENTLY idx_loads_org_status ON loads(organization_id, status);
CREATE INDEX CONCURRENTLY idx_loads_driver_date ON loads(driver_id, pickup_date);
CREATE INDEX CONCURRENTLY idx_loads_vehicle_date ON loads(vehicle_id, pickup_date);
CREATE INDEX CONCURRENTLY idx_compliance_expiry ON compliance_documents(expiry_date) WHERE expiry_date IS NOT NULL;
-- CREATE INDEX CONCURRENTLY idx_ifta_quarter_org ON ifta_entries(organization_id, quarter_id); -- Commented out as ifta_entries might not be used
CREATE INDEX CONCURRENTLY idx_ifta_reports_org_quarter_year ON ifta_reports(organization_id, quarter, year); -- Adjusted for ifta_reports
CREATE INDEX CONCURRENTLY idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX CONCURRENTLY idx_audit_user_time ON audit_logs(user_id, created_at);

-- Unique Constraints
ALTER TABLE organizations ADD CONSTRAINT unique_org_slug UNIQUE (slug);
ALTER TABLE users ADD CONSTRAINT unique_user_clerk_id UNIQUE (clerk_id);
ALTER TABLE drivers ADD CONSTRAINT unique_driver_license UNIQUE (organization_id, license_number);
ALTER TABLE vehicles ADD CONSTRAINT unique_vehicle_vin UNIQUE (vin);
ALTER TABLE loads ADD CONSTRAINT unique_load_number UNIQUE (organization_id, load_number);
-- Add unique constraint for ifta_reports if it's organization_id, quarter, year
ALTER TABLE ifta_reports ADD CONSTRAINT unique_ifta_report_org_quarter_year UNIQUE (organization_id, quarter, year);
-- Add indexes for webhook_events
CREATE INDEX CONCURRENTLY idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX CONCURRENTLY idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX CONCURRENTLY idx_webhook_events_organization_id ON webhook_events(organization_id);
CREATE INDEX CONCURRENTLY idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX CONCURRENTLY idx_webhook_events_status ON webhook_events(status);
CREATE INDEX CONCURRENTLY idx_webhook_events_created_at ON webhook_events(created_at);
```

## B. API Reference

### Clerk Webhook Handler

This is the primary API endpoint for the application, designed to handle incoming webhook events from Clerk. Its main responsibility is to synchronize data between Clerk and the Neon serverless PostgreSQL database. This synchronization is achieved through idempotent upsert database operations, ensuring data consistency and resilience against duplicate events.

```typescript
// POST /api/clerk/webhook-handler
// Receives webhook events from Clerk and processes them to sync data
// with the Neon serverless PostgreSQL database using idempotent upsert operations.

// Expected Request Body: Clerk Webhook Payload
// The structure of the payload varies depending on the event type.
// Refer to Clerk documentation for specific payload structures for each subscribed event.
interface ClerkWebhookPayload {
  type: string; // e.g., "user.created", "organizationMembership.updated", "organization.created"
  data: any;    // The actual event data, specific to the event type
  object: "event";
  // ... other common Clerk webhook fields like "event_id", "created_at"
}

// Subscribed Events (Essential for Core Functionality - Verify with Clerk Dashboard):
// User Management:
// - user.created: To create a new user record in the Neon DB.
// - user.updated: To update existing user details.
// - user.deleted: To handle user deletion (e.g., mark as inactive or delete).
// Organization Management:
// - organization.created: To create a new organization record.
// - organization.updated: To update organization details.
// - organization.deleted: To handle organization deletion.
// Membership Management:
// - organizationMembership.created: To link users to organizations and assign roles/permissions.
// - organizationMembership.updated: To update user roles or permissions within an organization.
// - organizationMembership.deleted: To remove users from organizations.
// Session Management (Optional, depending on specific needs beyond Clerk's session handling):
// - session.created
// - session.revoked
// - session.removed
// - session.ended

interface WebhookHandlerResponse {
  success: boolean;
  message: string;
  processedEvent?: {
    eventId: string; // Clerk's unique event ID
    eventType: string;
  };
  error?: string; // Detailed error message if processing failed
}

// Responses:
// - 200 OK: Webhook received and successfully processed.
// - 202 Accepted: Webhook received and queued for asynchronous processing (if applicable).
// - 400 Bad Request: Invalid payload structure, missing required fields, or unhandled event type.
// - 401 Unauthorized: Invalid webhook signature (ensure CLERK_WEBHOOK_SECRET is correctly configured).
// - 403 Forbidden: Request did not originate from Clerk or is otherwise disallowed.
// - 500 Internal Server Error: An unexpected error occurred during database operation or other processing logic.
// - 503 Service Unavailable: The service is temporarily unable to handle the request (e.g., database connection issues).
```

## C. Component Library Reference

### Base Components (Shadcn/UI)

```typescript
// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  description?: string;
}

// Select Component
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

// Table Component
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

// Dialog Component
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
```

### Business Components

```typescript
// DataTable Component
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterColumn?: string;
  filterOptions?: { label: string; value: string }[];
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPaginationChange: (pagination: PaginationState) => void;
  };
  loading?: boolean;
  error?: string;
}

// PageHeader Component
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

// LoadingSpinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ErrorBoundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

### Form Components

```typescript
// FormField Component (React Hook Form integration)
interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: (field: ControllerRenderProps) => React.ReactNode;
}

// DatePicker Component
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

// FileUpload Component
interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}
```

## D. Environment Configuration

### Development Environment

```bash
# .env.local (development)
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fleetfusion_dev"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# External APIs
GOOGLE_MAPS_API_KEY="AIza..."

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=false
```

### Production Environment

```bash
# .env.production
NODE_ENV=production

# Database (Neon)
DATABASE_URL="postgresql://user:password@host.neon.tech:5432/fleetfusion_prod?sslmode=require"

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# URLs
NEXT_PUBLIC_APP_URL="https://fleetfusion.com"

# File Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Analytics
VERCEL_ANALYTICS_ID="analytics_..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="fleetfusion"
SENTRY_PROJECT="web"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
```

## E. Deployment Guide

### Vercel Deployment

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/*/route.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "CLERK_SECRET_KEY": "@clerk-secret-key",
    "CLERK_WEBHOOK_SECRET": "@clerk-webhook-secret"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
      "NEXT_PUBLIC_APP_URL": "@app-url"
    }
  }
}
```

### Database Migration Strategy

```bash
# Development workflow
npm run db:generate    # Generate migrations
npm run db:migrate     # Apply migrations
npm run db:seed        # Seed development data

# Production workflow
npm run db:migrate:prod    # Apply migrations to production
npm run db:backup         # Create backup before migration
npm run db:rollback       # Rollback if needed
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## F. Testing Strategy

### Unit Testing

```typescript
// __tests__/lib/auth/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { RouteProtection } from '@/lib/auth/permissions';
import type { UserContext } from '@/types/auth';

describe('RouteProtection', () => {
  const mockUserContext: UserContext = {
    userId: 'user-123',
    organizationId: 'org-123',
    role: 'dispatcher',
    permissions: ['loads:read', 'loads:write', 'drivers:read'],
    isActive: true,
    // ... other required fields
  };

  it('should allow access to dispatcher routes', () => {
    const canAccess = RouteProtection.canAccessRoute(
      mockUserContext, 
      '/dispatch/loads'
    );
    expect(canAccess).toBe(true);
  });

  it('should deny access to admin routes', () => {
    const canAccess = RouteProtection.canAccessRoute(
      mockUserContext, 
      '/admin/users'
    );
    expect(canAccess).toBe(false);
  });
});
```

### Integration Testing

```typescript
// __tests__/api/drivers.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/organizations/[orgId]/drivers/route';
import { cleanupTestData, createTestUser, createTestOrg } from '@/test/helpers';

describe('/api/organizations/[orgId]/drivers', () => {
  let testOrg: any;
  let testUser: any;

  beforeEach(async () => {
    testOrg = await createTestOrg();
    testUser = await createTestUser(testOrg.id, 'admin');
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  it('should create a new driver', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'x-user-id': testUser.id,
        'x-organization-id': testOrg.id,
      },
      body: {
        licenseNumber: 'D123456789',
        licenseState: 'CA',
        licenseExpiry: '2025-12-31',
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.driver.licenseNumber).toBe('D123456789');
  });
});
```

### End-to-End Testing

```typescript
// e2e/driver-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Driver Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/sign-in');
    await page.fill('[data-testid=email]', 'admin@testorg.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=submit]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new driver', async ({ page }) => {
    await page.goto('/drivers');
    await page.click('[data-testid=add-driver]');
    
    await page.fill('[data-testid=license-number]', 'D123456789');
    await page.fill('[data-testid=first-name]', 'John');
    await page.fill('[data-testid=last-name]', 'Doe');
    await page.selectOption('[data-testid=license-state]', 'CA');
    await page.fill('[data-testid=license-expiry]', '2025-12-31');
    
    await page.click('[data-testid=submit]');
    
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
  });
});
```

## G. Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | < 1.5s | Core Web Vitals |
| **Largest Contentful Paint** | < 2.5s | Core Web Vitals |
| **Cumulative Layout Shift** | < 0.1 | Core Web Vitals |
| **Time to Interactive** | < 3.0s | Lighthouse |
| **API Response Time** | < 200ms | P95 percentile |
| **Database Query Time** | < 50ms | P95 percentile |
| **Page Load Time** | < 2.0s | Google Analytics |

### Database Performance

```sql
-- Query performance monitoring
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  stddev_time
FROM pg_stat_statements 
WHERE calls > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage analysis
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze

# Bundle size targets
# Total bundle size: < 500KB gzipped
# Largest chunk: < 250KB gzipped
# Third-party libraries: < 200KB gzipped
```

This appendix provides comprehensive reference materials for implementing and maintaining FleetFusion.

![db](<assets/FleetFusion - DB Diagram.png>)