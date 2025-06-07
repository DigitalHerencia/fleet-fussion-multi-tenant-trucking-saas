# API Reference

## Overview

FleetFusion uses a modern server-side architecture with Next.js 15 Server Actions and App Router. The API is organized into two main patterns:

- **Server Actions**: Server-side functions for data mutations (`lib/actions/`)
- **Data Fetchers**: Server-side functions for data retrieval (`lib/fetchers/`)
- **API Routes**: RESTful endpoints for webhooks and integrations (`app/api/`)

All operations use Clerk.js authentication and multi-tenant organization isolation.

## Authentication & Authorization

### Authentication Flow

```typescript
import { auth } from "@clerk/nextjs/server";

export async function protectedAction() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Unauthorized" };
  }
  // Continue with authorized operation
}
```

### Permission System

FleetFusion implements role-based access control (RBAC) with organization-level permissions:

```typescript
enum UserRole {
  admin        // Full system access
  manager      // Management functions
  user         // Standard user access
  dispatcher   // Dispatch operations
  driver       // Driver-specific access
  compliance   // Compliance management
  accountant   // Financial/reporting access
  viewer       // Read-only access
}
```

## Server Actions (Mutations)

Server Actions handle all data mutations with built-in validation, authentication, and audit logging.

### Load Management (`lib/actions/loadActions.ts`)

#### updateLoadAction

Updates an existing load with validation and audit logging.

```typescript
export async function updateLoadAction(
  id: string, 
  data: UpdateLoadInput
): Promise<ActionResult<Load>>

// Usage
const result = await updateLoadAction(loadId, {
  status: 'in_transit',
  actualPickupDate: new Date(),
  notes: 'Load picked up successfully'
});
```

**Parameters:**
- `id`: Load UUID
- `data`: Partial load update data

**Returns:**
```typescript
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
}
```

#### assignLoadAction

Assigns driver and vehicle to a load.

```typescript
export async function assignLoadAction(
  data: LoadAssignmentInput
): Promise<ActionResult<Load>>

// Usage
const result = await assignLoadAction({
  loadId: 'load-uuid',
  driverId: 'driver-uuid',
  vehicleId: 'vehicle-uuid',
  trailerId: 'trailer-uuid' // optional
});
```

### Vehicle Management (`lib/actions/vehicleActions.ts`)

#### createVehicleAction

Creates a new vehicle with compliance document setup.

```typescript
export async function createVehicleAction(
  data: CreateVehicleInput
): Promise<ActionResult<Vehicle>>

// Usage
const result = await createVehicleAction({
  type: 'truck',
  make: 'Freightliner',
  model: 'Cascadia',
  year: 2023,
  vin: '1FUJGHDV8NLAA1234',
  unitNumber: 'T001',
  licensePlate: 'ABC123',
  licensePlateState: 'TX'
});
```

#### updateVehicleAction

Updates vehicle information with validation.

```typescript
export async function updateVehicleAction(
  id: string,
  data: UpdateVehicleInput
): Promise<ActionResult<Vehicle>>
```

#### updateVehicleStatusAction

Changes vehicle operational status.

```typescript
export async function updateVehicleStatusAction(
  id: string,
  status: VehicleStatus,
  reason?: string
): Promise<ActionResult<Vehicle>>

// Vehicle status options
enum VehicleStatus {
  active
  inactive
  maintenance
  decommissioned
}
```

### Driver Management (`lib/actions/driverActions.ts`)

#### createDriverAction

Creates a new driver profile with compliance tracking.

```typescript
export async function createDriverAction(
  data: CreateDriverInput
): Promise<ActionResult<Driver>>

// Usage
const result = await createDriverAction({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '555-0123',
  licenseNumber: 'DL123456',
  licenseState: 'TX',
  licenseClass: 'CDL-A',
  licenseExpiration: '2025-12-31',
  hireDate: '2024-01-15'
});
```

#### updateDriverAction

Updates driver information and compliance data.

```typescript
export async function updateDriverAction(
  id: string,
  data: UpdateDriverInput
): Promise<ActionResult<Driver>>
```

### Compliance Management (`lib/actions/complianceActions.ts`)

#### uploadComplianceDocumentAction

Uploads and processes compliance documents.

```typescript
export async function uploadComplianceDocumentAction(
  data: UploadDocumentInput
): Promise<ActionResult<ComplianceDocument>>

// Usage
const result = await uploadComplianceDocumentAction({
  driverId: 'driver-uuid',
  type: 'medical_certificate',
  title: 'DOT Medical Certificate',
  fileUrl: 'https://blob.storage/document.pdf',
  expirationDate: '2025-06-15',
  documentNumber: 'MC123456'
});
```

#### verifyComplianceDocumentAction

Verifies and approves compliance documents.

```typescript
export async function verifyComplianceDocumentAction(
  documentId: string,
  verified: boolean,
  notes?: string
): Promise<ActionResult<ComplianceDocument>>
```

### IFTA Management (`lib/actions/iftaActions.ts`)

#### createIftaReportAction

Generates quarterly IFTA reports.

```typescript
export async function createIftaReportAction(
  data: CreateIftaReportInput
): Promise<ActionResult<IftaReport>>

// Usage
const result = await createIftaReportAction({
  quarter: 1,
  year: 2024,
  dueDate: '2024-04-30'
});
```

#### submitIftaReportAction

Submits IFTA report for filing.

```typescript
export async function submitIftaReportAction(
  reportId: string
): Promise<ActionResult<IftaReport>>
```

## Data Fetchers (Queries)

Data fetchers provide optimized read operations with caching and filtering.

### Dispatch Operations (`lib/fetchers/dispatchFetchers.ts`)

#### listLoadsByOrg

Retrieves loads with filtering and pagination.

```typescript
export async function listLoadsByOrg(
  orgId: string,
  filters: LoadFilterInput = {}
): Promise<Load[]>

// Usage
const loads = await listLoadsByOrg(orgId, {
  status: ['assigned', 'in_transit'],
  driverId: 'driver-uuid',
  dateRange: {
    start: '2024-01-01',
    end: '2024-01-31'
  },
  limit: 50,
  offset: 0
});
```

**Filter Options:**
```typescript
interface LoadFilterInput {
  status?: LoadStatus[];
  priority?: LoadPriority[];
  driverId?: string;
  vehicleId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  limit?: number;
  offset?: number;
}
```

#### getLoadById

Retrieves single load with full details.

```typescript
export async function getLoadById(
  id: string,
  orgId: string
): Promise<LoadWithDetails | null>

// Returns load with related data
interface LoadWithDetails extends Load {
  driver?: Driver;
  vehicle?: Vehicle;
  trailer?: Vehicle;
  statusEvents?: LoadStatusEvent[];
}
```

### Vehicle Operations (`lib/fetchers/vehicleFetchers.ts`)

#### listVehiclesByOrg

Retrieves organization vehicles with filtering.

```typescript
export async function listVehiclesByOrg(
  orgId: string,
  filters: VehicleFilterInput = {}
): Promise<Vehicle[]>

// Usage
const vehicles = await listVehiclesByOrg(orgId, {
  type: ['truck'],
  status: ['active'],
  searchTerm: 'T001'
});
```

#### getVehicleMaintenanceSchedule

Retrieves vehicle maintenance and compliance schedules.

```typescript
export async function getVehicleMaintenanceSchedule(
  vehicleId: string,
  orgId: string
): Promise<MaintenanceSchedule[]>
```

### Driver Operations (`lib/fetchers/driverFetchers.ts`)

#### listDriversByOrg

Retrieves organization drivers with compliance status.

```typescript
export async function listDriversByOrg(
  orgId: string,
  filters: DriverFilterInput = {}
): Promise<DriverWithCompliance[]>

interface DriverWithCompliance extends Driver {
  complianceStatus: {
    licenseExpired: boolean;
    medicalExpired: boolean;
    documentsExpiringSoon: ComplianceDocument[];
  };
}
```

### Compliance Monitoring (`lib/fetchers/complianceFetchers.ts`)

#### getComplianceAlerts

Retrieves active compliance alerts and notifications.

```typescript
export async function getComplianceAlerts(
  orgId: string,
  filters: AlertFilterInput = {}
): Promise<ComplianceAlert[]>

// Usage
const alerts = await getComplianceAlerts(orgId, {
  severity: ['high', 'critical'],
  entityType: ['driver', 'vehicle'],
  acknowledged: false
});
```

#### getExpiringDocuments

Retrieves documents expiring within specified timeframe.

```typescript
export async function getExpiringDocuments(
  orgId: string,
  daysAhead: number = 30
): Promise<ComplianceDocument[]>
```

### Analytics & KPIs (`lib/fetchers/analyticsFetchers.ts`)

#### getOrganizationKPIs

Retrieves key performance indicators for dashboard.

```typescript
export async function getOrganizationKPIs(
  orgId: string,
  dateRange: DateRange
): Promise<OrganizationKPIs>

interface OrganizationKPIs {
  totalLoads: number;
  completedLoads: number;
  revenue: number;
  activeVehicles: number;
  activeDrivers: number;
  complianceAlerts: number;
  utilizationRate: number;
  onTimeDeliveryRate: number;
}
```

## API Routes (REST Endpoints)

### Webhook Handler (`app/api/clerk/webhook-handler/route.ts`)

Processes Clerk.js authentication webhooks for user and organization synchronization.

#### POST /api/clerk/webhook-handler

Handles various Clerk events:

```typescript
// Supported webhook events
- user.created
- user.updated  
- user.deleted
- organization.created
- organization.updated
- organization.deleted
- organizationMembership.created
- organizationMembership.updated
- organizationMembership.deleted
```

**Headers Required:**
```
svix-id: <webhook-id>
svix-timestamp: <timestamp>
svix-signature: <signature>
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  processed?: boolean;
}
```

## Data Schemas & Validation

FleetFusion uses Zod for runtime type validation and TypeScript for compile-time safety.

### Load Schema (`schemas/dispatch.ts`)

```typescript
import { z } from 'zod';

export const loadSchema = z.object({
  loadNumber: z.string().min(1),
  customerName: z.string().optional(),
  originAddress: z.string().min(1),
  originCity: z.string().min(1),
  originState: z.string().length(2),
  originZip: z.string().min(5),
  destinationAddress: z.string().min(1),
  destinationCity: z.string().min(1),
  destinationState: z.string().length(2),
  destinationZip: z.string().min(5),
  rate: z.number().positive().optional(),
  scheduledPickupDate: z.date().optional(),
  scheduledDeliveryDate: z.date().optional(),
  weight: z.number().positive().optional(),
  pieces: z.number().positive().optional(),
  commodity: z.string().optional(),
  hazmat: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

export type LoadInput = z.infer<typeof loadSchema>;
export type UpdateLoadInput = Partial<LoadInput> & { id: string };
```

### Vehicle Schema (`schemas/vehicle.ts`)

```typescript
export const vehicleSchema = z.object({
  type: z.string().min(1),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  vin: z.string().optional(),
  unitNumber: z.string().min(1),
  licensePlate: z.string().optional(),
  licensePlateState: z.string().length(2).optional(),
  fuelType: z.string().optional(),
  currentOdometer: z.number().int().positive().optional()
});
```

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Common Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `CONFLICT`: Resource conflict (duplicate key, etc.)
- `RATE_LIMITED`: Too many requests

### Error Handling Pattern

```typescript
export async function safeAction<T>(
  action: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error('Action failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Rate Limiting & Performance

### Caching Strategy

- **Static Data**: Organization settings, user profiles (1 hour TTL)
- **Dynamic Data**: Load status, vehicle locations (5 minute TTL)
- **Real-time Data**: Compliance alerts, notifications (No cache)

### Performance Optimization

```typescript
// Use Prisma includes for efficient data loading
const loadWithDetails = await prisma.load.findUnique({
  where: { id },
  include: {
    driver: true,
    vehicle: true,
    trailer: true,
    statusEvents: {
      orderBy: { timestamp: 'desc' },
      take: 10
    }
  }
});

// Pagination for large datasets
const loads = await prisma.load.findMany({
  where: { organizationId },
  skip: offset,
  take: limit,
  orderBy: { createdAt: 'desc' }
});
```

## Testing API Endpoints

### Server Action Testing

```typescript
import { updateLoadAction } from '@/lib/actions/loadActions';

describe('updateLoadAction', () => {
  it('should update load successfully', async () => {
    const result = await updateLoadAction('load-id', {
      status: 'completed',
      actualDeliveryDate: new Date()
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('completed');
  });
});
```

### Integration Testing

```typescript
import { POST } from '@/app/api/clerk/webhook-handler/route';

describe('Clerk Webhook Handler', () => {
  it('should process user.created event', async () => {
    const request = new Request('/api/clerk/webhook-handler', {
      method: 'POST',
      headers: {
        'svix-id': 'test-id',
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test-signature'
      },
      body: JSON.stringify({
        type: 'user.created',
        data: { /* user data */ }
      })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```
