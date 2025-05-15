// --- Company & User Types ---
// Company represents a trucking company entity with core details and branding info
export type Company = {
  /** Unique identifier for the company */
  id: string;
  /** Company name */
  name: string;
  /** USDOT number (optional) */
  dotNumber?: string | null;
  /** MC number (optional) */
  mcNumber?: string | null;
  /** Street address (optional) */
  address?: string | null;
  /** City (optional) */
  city?: string | null;
  /** State abbreviation (optional) */
  state?: string | null;
  /** Postal code (optional) */
  zip?: string | null;
  /** Company phone number (optional) */
  phone?: string | null;
  /** Company email address (optional) */
  email?: string | null;
  /** URL to company logo (optional) */
  logoUrl?: string | null;
  /** Primary brand color (optional) */
  primaryColor?: string | null;
  /** Whether the company is active */
  isActive: boolean;
  /** ISO string of creation date */
  createdAt: string;
  updatedAt: string;
};

// CompanyUser links a user to a company with a specific role
export type CompanyUser = {
  id: string;
  userId: string;
  companyId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
};

// --- Driver & Vehicle Types ---
// Driver represents a driver employed by a company


export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  email?: string;
  phone?: string;
}

// Vehicle represents a vehicle in the fleet

export interface Vehicle {
  id: string;
  unitNumber: string;
  make: string | null;
  model: string | null;
  year: number | null; // Allow null for compatibility with DB and validation schema
  status: string;
  type: string;
  vin?: string | null;
  licensePlate?: string | null;
  state?: string | null;
  currentOdometer?: number | null;
  lastOdometerUpdate?: Date | null;
  lastInspection?: string;
  nextInspection?: string;
  defects?: string;
  registrationExpiry?: string;
  maintenanceRecords?: {
    id: string;
    scheduledDate: Date;
    status: string;
    type: string;
    notes?: string;
  }[];
  documents?: {
    id: string;
    name: string;
    type: string;
    lastUpdated: string;
    status: string;
    assignedTo: string;
   expirationDate?: string;
   fileUrl?: string;
  }[];
  companyId: string;
}

// VehicleStatus represents the status of a vehicle
export interface VehicleStatus {
  id: string;
  name: string;
  description: string;
}

// Dispatch and Load Types
// DispatchBoardProps represents the props for the dispatch board component

export interface DispatchBoardProps {
  loads: Load[];
  drivers: Driver[];
  vehicles: Vehicle[];
  loadStatuses: LoadStatus[];
  vehicleStatuses: VehicleStatus[];
  loadStatusUpdates: LoadStatusUpdate[];
  documents: Document[];
  complianceDocuments: ComplianceDocument[];
  complianceDrivers: ComplianceDriver[];
  complianceVehicles: ComplianceVehicle[];
  iftaReports: RawIftaReport[];
}

export interface LoadStatus {
  id: string;
  name: string;
  description: string;
}
export interface LoadStatusUpdate {
  id: string;
  status: string;
}

export interface Load {
  id: string;
  referenceNumber: string;
  status: string;
  customerName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: Date;
  deliveryDate: Date;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicle?: {
    id: string;
    unitNumber: string;
  } | null;
  trailer?: {
    id: string;
    unitNumber: string;
  } | null;
  commodity?: string;
  weight?: number;
  rate?: number;
  miles?: number;
}

/// --- Document Types ---
/// General Document type for driver/vehicle/load documents
export type Document = {
  id: string;
  companyId: string;
  driverId?: string;
  vehicleId?: string;
  loadId?: string;
  type: string;
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// --- Compliance Types ---
// ComplianceDocument represents a compliance-related document for a company, driver, or vehicle
export type ComplianceDocument = {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  status: string;
  assignedTo: string;
  expirationDate?: string;
  fileUrl?: string;
};

export interface ComplianceDriver {
  id: string;
  name: string;
  status: string;
  licenseExpiry: string;
  medicalExpiry: string;
  lastHosViolation: string;
  dutyStatus: string;
  availableHours: number;
}

export interface ComplianceVehicle {
  id: string;
  unitNumber: string;
  unit: string;
  status: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  state: string | null;
  currentOdometer: number | null;
  lastOdometerUpdate: Date | null;
  lastInspection: string;
  nextInspection: string;
  defects: string;
  registrationExpiry: string;
}

// --- IFTA Types ---
export interface RawIftaReport {
  id: string;
  quarter: number;
  dueDate: string;
  status: string | null;
  totalMiles: number | null;
  totalGallons: number | null;
  reportData?: {
    taxPaid?: number;
  };
}

// --- Notification Types ---
export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  type: string; // e.g. 'dispatch', 'compliance', 'system', etc.
  title: string;
  body: string;
  data?: any;
  read: boolean;
  delivered: boolean;
  channel: "in-app" | "email" | "push" | "sms";
  createdAt: string | Date;
  updatedAt: string | Date;
}

// --- Dashboard KPI Type ---
export interface KPI {
  activeVehicles: number;
  activeDrivers: number;
  totalLoads: number;
  completedLoads: number;
  pendingLoads: number;
  inTransitLoads: number;
  totalMiles: number;
  totalRevenue: number;
  upcomingMaintenance: number;
  recentInspections: number;
  failedInspections: number;
  utilizationRate: string | number;
  revenuePerMile: string | number;
}

// --- Clerk Webhook Types ---
export type ClerkWebhookEventType =
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "organizationMembership.created"
  | "organizationMembership.updated"
  | "organizationMembership.deleted";

export interface ClerkWebhookBaseEvent<
  TType extends ClerkWebhookEventType,
  TData = Record<string, unknown>
> {
  object: "event";
  type: TType;
  data: TData;
}

export interface ClerkUserEventData {
  id: string;
  email_addresses?: Array<{ id: string; email_address: string }>;
  first_name?: string;
  last_name?: string;
}

export interface ClerkOrganizationEventData {
  id: string;
  name: string;
}

export interface ClerkOrganizationMembershipEventData {
  organization: { id: string };
  publicUserData: { userId: string };
  role: string;
}

export type ClerkWebhookEvent =
  | ClerkWebhookBaseEvent<"user.created", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"user.updated", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"user.deleted", ClerkUserEventData>
  | ClerkWebhookBaseEvent<"organization.created", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<"organization.updated", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<"organization.deleted", ClerkOrganizationEventData>
  | ClerkWebhookBaseEvent<
      "organizationMembership.created",
      ClerkOrganizationMembershipEventData
    >
  | ClerkWebhookBaseEvent<
      "organizationMembership.updated",
      ClerkOrganizationMembershipEventData
    >
  | ClerkWebhookBaseEvent<
      "organizationMembership.deleted",
      ClerkOrganizationMembershipEventData
    >;

// --- API Result Type ---
export type ApiResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; errors?: Record<string, unknown> };

// --- JWT/Session Claims ---
export type Roles = "admin" | "moderator";

export interface CustomJwtSessionClaims {
  metadata: {
    onboardingComplete?: boolean;
    applicationName?: string;
    applicationType?: string;
    role?: Roles;
  };
}
