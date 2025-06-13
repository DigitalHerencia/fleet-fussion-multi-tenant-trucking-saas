# FleetFusion Type Definitions

This document provides a comprehensive reference for all TypeScript types, interfaces, and
validation schemas used throughout the FleetFusion application.

## Table of Contents

- [Core Types](#core-types)
- [Authentication Types](#authentication-types)
- [Database Types](#database-types)
- [API Types](#api-types)
- [Validation Schemas](#validation-schemas)
- [Component Props](#component-props)
- [Utility Types](#utility-types)
- [Type Guards](#type-guards)

---

## Core Types

### Base Entity Types

```typescript
// types/base.ts
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export interface Auditable {
  createdBy: string;
  updatedBy: string;
}

export interface TenantScoped {
  organizationId: string;
}
```

### Organization Types

```typescript
// types/organization.ts
export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  dotNumber?: string;
  mcNumber?: string;
  address?: Address;
  phone?: string;
  email?: string;
  website?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  settings: OrganizationSettings;
  members: OrganizationMember[];
}

export interface OrganizationSettings {
  timezone: string;
  dateFormat: string;
  distanceUnit: 'miles' | 'kilometers';
  fuelUnit: 'gallons' | 'liters';
  enableHOS: boolean;
  enableIFTA: boolean;
  enableCompliance: boolean;
  logo?: string;
  primaryColor?: string;
}

export interface OrganizationMember extends BaseEntity, TenantScoped {
  userId: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  invitedAt?: Date;
  joinedAt?: Date;
  user: User;
}
```

### User Types

```typescript
// types/user.ts
export interface User extends BaseEntity {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  isOnboarded: boolean;
  lastLoginAt?: Date;
  memberships: OrganizationMember[];
  profile?: UserProfile;
}

export interface UserProfile extends BaseEntity {
  userId: string;
  phone?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}
```

---

## Authentication Types

### Clerk Integration Types

```typescript
// types/auth.ts
export interface ClerkUserMetadata {
  role?: UserRole;
  organizationId?: string;
  permissions?: string[];
  onboardingCompleted?: boolean;
  lastLoginAt?: string;
}

export interface ClerkOrganizationMetadata {
  dotNumber?: string;
  mcNumber?: string;
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  settings?: Partial<OrganizationSettings>;
}

export interface UserContext {
  user: {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    role: UserRole;
    permissions: Permission[];
  };
  session: {
    createdAt: Date;
    lastActivity: Date;
  };
}
```

### RBAC Types

```typescript
// types/rbac.ts
export type SystemRole =
  | 'admin'
  | 'manager'
  | 'dispatcher'
  | 'driver'
  | 'compliance'
  | 'accountant'
  | 'viewer';

export interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'lt' | 'lte' | 'gt' | 'gte';
  value: unknown;
}

export interface RoleDefinition {
  name: SystemRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  hierarchy: number;
}
```

---

## Database Types

### Vehicle Management Types

```typescript
// types/vehicle.ts
export interface Vehicle extends BaseEntity, TenantScoped, Auditable {
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate: string;
  state: string;
  fuelType: FuelType;
  maxWeight: number;
  currentOdometer: number;
  status: VehicleStatus;
  assignedDriverId?: string;
  assignedDriver?: Driver;
  inspections: VehicleInspection[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
}

export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'out_of_service';

export type FuelType = 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'cng' | 'lpg';

export interface VehicleInspection extends BaseEntity, TenantScoped {
  vehicleId: string;
  inspectorId: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate: Date;
  completedDate?: Date;
  odometer: number;
  items: InspectionItem[];
  notes?: string;
  signature?: string;
  vehicle: Vehicle;
  inspector: User;
}
```

### Driver Management Types

```typescript
// types/driver.ts
export interface Driver extends BaseEntity, TenantScoped, Auditable {
  userId: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiry: Date;
  medicalCertExpiry?: Date;
  hireDate: Date;
  terminationDate?: Date;
  status: DriverStatus;
  assignedVehicleId?: string;
  emergencyContact: EmergencyContact;
  documents: DriverDocument[];
  hosRecords: HOSRecord[];
  assignedVehicle?: Vehicle;
  user: User;
}

export type DriverStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface HOSRecord extends BaseEntity, TenantScoped {
  driverId: string;
  date: Date;
  onDutyTime: number;
  drivingTime: number;
  restTime: number;
  violations: HOSViolation[];
  driver: Driver;
}

export interface HOSViolation {
  type: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  resolvedAt?: Date;
}
```

### Load Management Types

```typescript
// types/load.ts
export interface Load extends BaseEntity, TenantScoped, Auditable {
  loadNumber: string;
  customerId?: string;
  status: LoadStatus;
  priority: LoadPriority;
  pickupLocation: Location;
  deliveryLocation: Location;
  scheduledPickup: Date;
  scheduledDelivery: Date;
  actualPickup?: Date;
  actualDelivery?: Date;
  distance: number;
  rate: number;
  assignedDriverId?: string;
  assignedVehicleId?: string;
  cargo: CargoItem[];
  documents: LoadDocument[];
  customer?: Customer;
  assignedDriver?: Driver;
  assignedVehicle?: Vehicle;
}

export type LoadStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export type LoadPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}
```

---

## API Types

### Server Action Types

```typescript
// types/actions.ts
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateVehicleParams {
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate: string;
  state: string;
  fuelType: FuelType;
  maxWeight: number;
  currentOdometer: number;
}

export interface UpdateVehicleParams extends Partial<CreateVehicleParams> {
  id: string;
}
```

### API Route Types

```typescript
// types/api.ts
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface WebhookPayload {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

export interface ClerkWebhookEvent {
  type:
    | 'user.created'
    | 'user.updated'
    | 'user.deleted'
    | 'organization.created'
    | 'organization.updated';
  data: {
    id: string;
    [key: string]: unknown;
  };
}
```

---

## Validation Schemas

### Zod Schemas

```typescript
// validations/vehicle.ts
import { z } from 'zod';

export const createVehicleSchema = z.object({
  vin: z.string().length(17, 'VIN must be exactly 17 characters'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  licensePlate: z.string().min(1, 'License plate is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  fuelType: z.enum(['diesel', 'gasoline', 'electric', 'hybrid', 'cng', 'lpg']),
  maxWeight: z.number().positive('Max weight must be positive'),
  currentOdometer: z.number().min(0, 'Odometer cannot be negative'),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  id: z.string().uuid(),
});

// validations/driver.ts
export const createDriverSchema = z.object({
  userId: z.string().uuid(),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseClass: z.string().min(1, 'License class is required'),
  licenseExpiry: z.date().min(new Date(), 'License cannot be expired'),
  medicalCertExpiry: z.date().optional(),
  hireDate: z.date(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(1, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Relationship is required'),
  }),
});

// validations/load.ts
export const createLoadSchema = z.object({
  loadNumber: z.string().min(1, 'Load number is required'),
  customerId: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  pickupLocation: z.object({
    address: z.string().min(1, 'Pickup address is required'),
    city: z.string().min(1, 'Pickup city is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: z.string().min(5, 'Valid zip code is required'),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
  }),
  deliveryLocation: z.object({
    address: z.string().min(1, 'Delivery address is required'),
    city: z.string().min(1, 'Delivery city is required'),
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: z.string().min(5, 'Valid zip code is required'),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
  }),
  scheduledPickup: z.date(),
  scheduledDelivery: z.date(),
  rate: z.number().positive('Rate must be positive'),
  cargo: z.array(
    z.object({
      description: z.string().min(1, 'Cargo description is required'),
      weight: z.number().positive('Weight must be positive'),
      quantity: z.number().int().positive('Quantity must be positive'),
      hazmat: z.boolean().default(false),
    })
  ),
});
```

---

## Component Props

### UI Component Props

```typescript
// types/components.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (row: T) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}
```

### Page Component Props

```typescript
// types/pages.ts
export interface DashboardPageProps {
  params: {
    orgId: string;
    userId?: string;
  };
  searchParams?: {
    tab?: string;
    filter?: string;
    sort?: string;
  };
}

export interface VehiclePageProps {
  params: {
    orgId: string;
    vehicleId?: string;
  };
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export interface DriverPageProps {
  params: {
    orgId: string;
    driverId?: string;
  };
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
  };
}
```

---

## Utility Types

### Custom Utility Types

```typescript
// types/utils.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never;

export type NoInfer<T> = [T][T extends unknown ? 0 : never];

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
```

### Database Utility Types

```typescript
// types/database.ts
export type EntityWithRelations<T, R extends keyof T = never> = T & {
  [K in R]: T[K] extends (infer U)[] ? U[] : T[K] extends infer U | null ? U : T[K];
};

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export type FilterInput<T> = {
  [K in keyof T]?: T[K] extends string
    ? string | { contains?: string; startsWith?: string; endsWith?: string }
    : T[K] extends number
      ? number | { gte?: number; lte?: number; gt?: number; lt?: number }
      : T[K] extends Date
        ? Date | { gte?: Date; lte?: Date; gt?: Date; lt?: Date }
        : T[K];
};
```

---

## Type Guards

### Runtime Type Checking

```typescript
// types/guards.ts
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard);
}

export function hasProperty<T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}

export function isValidEmail(email: unknown): email is string {
  return isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: unknown): phone is string {
  return isString(phone) && /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
}

export function isValidVIN(vin: unknown): vin is string {
  return isString(vin) && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

export function isUserRole(value: unknown): value is UserRole {
  return (
    isString(value) &&
    ['admin', 'manager', 'dispatcher', 'driver', 'compliance', 'accountant', 'viewer'].includes(
      value
    )
  );
}

export function isVehicleStatus(value: unknown): value is VehicleStatus {
  return isString(value) && ['active', 'inactive', 'maintenance', 'out_of_service'].includes(value);
}

export function isLoadStatus(value: unknown): value is LoadStatus {
  return (
    isString(value) &&
    ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled'].includes(value)
  );
}
```

### Entity Type Guards

```typescript
// types/entity-guards.ts
export function isUser(obj: unknown): obj is User {
  return (
    isObject(obj) &&
    hasProperty(obj, 'id') &&
    hasProperty(obj, 'clerkId') &&
    hasProperty(obj, 'email') &&
    isString(obj.id) &&
    isString(obj.clerkId) &&
    isValidEmail(obj.email)
  );
}

export function isVehicle(obj: unknown): obj is Vehicle {
  return (
    isObject(obj) &&
    hasProperty(obj, 'id') &&
    hasProperty(obj, 'vin') &&
    hasProperty(obj, 'make') &&
    hasProperty(obj, 'model') &&
    hasProperty(obj, 'year') &&
    isString(obj.id) &&
    isValidVIN(obj.vin) &&
    isString(obj.make) &&
    isString(obj.model) &&
    isNumber(obj.year)
  );
}

export function isDriver(obj: unknown): obj is Driver {
  return (
    isObject(obj) &&
    hasProperty(obj, 'id') &&
    hasProperty(obj, 'userId') &&
    hasProperty(obj, 'licenseNumber') &&
    hasProperty(obj, 'status') &&
    isString(obj.id) &&
    isString(obj.userId) &&
    isString(obj.licenseNumber) &&
    isString(obj.status)
  );
}
```

---

## Type Exports

### Central Type Exports

```typescript
// types/index.ts
// Base types
export type * from './base';
export type * from './utils';
export type * from './guards';

// Entity types
export type * from './user';
export type * from './organization';
export type * from './vehicle';
export type * from './driver';
export type * from './load';
export type * from './customer';
export type * from './compliance';

// API types
export type * from './auth';
export type * from './rbac';
export type * from './actions';
export type * from './api';

// Component types
export type * from './components';
export type * from './pages';

// Validation types
export type * from '../validations';

// Database types
export type * from './database';
```

---

## TypeScript Configuration

### Strict Type Checking

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

### Path Mapping

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/types/*": ["./types/*"],
      "@/lib/*": ["./lib/*"],
      "@/components/*": ["./components/*"],
      "@/features/*": ["./features/*"],
      "@/validations/*": ["./validations/*"]
    }
  }
}
```

---

_This type reference is automatically updated as the codebase evolves. For specific implementation
details, consult the source files in the `types/` directory._
