// Shared types for compliance feature
// DEPRECATED: All types have been consolidated into types/types.ts. Please import from there.

export interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  status: string;
  assignedTo: string;
  expirationDate?: string;
  fileUrl?: string;
}

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
