/**
 * Type definitions for the drivers module
 */

export interface Driver {
  id: string
  tenantId: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  licenseNumber: string
  licenseState: string
  licenseExpiration: Date
  medicalCardExpiration: Date
  hireDate: Date
  status: DriverStatus
  currentLocation?: {
    latitude: number
    longitude: number
    lastUpdated: Date
  }
  homeTerminal: string
  notes?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  documents?: DriverDocument[]
  createdAt: Date
  updatedAt: Date
}

export type DriverStatus = "available" | "on_duty" | "driving" | "off_duty" | "inactive"

export interface DriverDocument {
  id: string
  type: "license" | "medical_card" | "training" | "other"
  name: string
  url: string
  expirationDate?: Date
  uploadedAt: Date
}

export interface HoursOfService {
  driverId: string
  date: Date
  status: DriverStatus
  location: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  notes?: string
}

export interface DriverPerformance {
  driverId: string
  period: "daily" | "weekly" | "monthly"
  startDate: Date
  endDate: Date
  metrics: {
    totalMiles: number
    totalHours: number
    fuelEfficiency: number
    onTimeDelivery: number
    safetyScore: number
    violations: number
  }
}
