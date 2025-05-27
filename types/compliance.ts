/**
 * Type definitions for the compliance module
 */

export interface ComplianceDocument {
  lastUpdated: string | number | Date
  id: string
  tenantId: string
  type: ComplianceDocumentType
  name: string
  description?: string
  status: "valid" | "expiring" | "expired"
  issuedDate: Date
  expirationDate?: Date
  documentNumber?: string
  issuingAuthority?: string
  url?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ComplianceDocumentType =
  | "dot_authority"
  | "insurance"
  | "ifta_license"
  | "ucr_registration"
  | "drug_testing"
  | "annual_inspection"
  | "driver_qualification"
  | "other"

export interface HosLog {
  id: string
  driverId: string
  date: Date
  status: "compliant" | "violation"
  logs: HosEntry[]
  totalDriveTime: number // in minutes
  totalOnDutyTime: number // in minutes
  totalOffDutyTime: number // in minutes
  violations?: HosViolation[]
}

export interface HosEntry {
  startTime: Date
  endTime: Date
  status: "driving" | "on_duty" | "off_duty" | "sleeper_berth"
  location: string
  notes?: string
}

export interface HosViolation {
  type: "11_hour" | "14_hour" | "70_hour" | "break"
  description: string
  severity: "minor" | "major"
  timestamp: Date
}

export interface DvirReport {
  id: string
  vehicleId: string
  driverId: string
  date: Date
  preTrip: boolean
  postTrip: boolean
  defects: DvirDefect[]
  safeToOperate: boolean
  notes?: string
  signature: string
  createdAt: Date
}

export interface DvirDefect {
  category: "brakes" | "coupling" | "engine" | "exhaust" | "fuel_system" | "lights" | "steering" | "tires" | "other"
  description: string
  severity: "minor" | "major" | "critical"
  repaired: boolean
  repairedBy?: string
  repairedDate?: Date
}
