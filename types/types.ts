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
  /** ISO string of last update */
  updatedAt: string;
};

// CompanyUser links a user to a company with a specific role
export type CompanyUser = {
  /** Unique identifier for the company-user relationship */
  id: string;
  /** User ID (foreign key) */
  userId: string;
  /** Company ID (foreign key) */
  companyId: string;
  /** User's role in the company (e.g., Admin, Dispatcher, Driver) */
  role: string;
  /** Whether the user is active in the company */
  isActive: boolean;
  /** ISO string of creation date */
  createdAt: string;
  /** ISO string of last update */
  updatedAt: string;
  /** Optional company object for eager loading */
  company?: Company;
};

// Driver represents a driver employed by a company
export type Driver = {
  /** Unique identifier for the driver */
  id: string;
  /** Driver's first name */
  firstName: string;
  /** Driver's last name */
  lastName: string;
  /** Driver's status (active/inactive) */
  status: "active" | "inactive";
};

// Vehicle represents a vehicle in the fleet
export type Vehicle = {
  /** Unique identifier for the vehicle */
  id: string;
  /** Unit number or fleet number */
  unitNumber: string;
  /** Vehicle type (tractor or trailer) */
  type: "tractor" | "trailer";
  /** Vehicle status (active/inactive) */
  status: "active" | "inactive";
};

// Load represents a shipment or job assigned to a driver/vehicle
export type load = {
  status: string;
  /** Unique identifier for the load */
  id: string;
  /** Scheduled pickup date */
  pickupDate: Date;
  /** Scheduled delivery date */
  deliveryDate: Date;
  /** Assigned driver (optional) */
  driver?: Driver;
  /** Assigned vehicle (optional) */
  vehicle?: Vehicle;
  /** Assigned trailer (optional) */
  trailer?: Vehicle;
  // Add any additional fields (e.g. origin, destination, status, etc.) as needed
};

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

// General Document type for driver/vehicle/load documents
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
