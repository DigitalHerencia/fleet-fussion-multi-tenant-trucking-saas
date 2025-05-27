/**
 * Type definitions for the dispatch module
 */

import type { User } from "./index"

export interface Load {
  id: string
  tenantId: string
  referenceNumber: string
  status: LoadStatus
  customer: Customer
  origin: Location
  destination: Location
  pickupDate: Date
  deliveryDate: Date
  driver?: User
  vehicle?: Vehicle
  trailer?: Trailer
  rate: Rate
  notes?: string
  documents?: Document[]
  createdAt: Date
  updatedAt: Date
}

export type LoadStatus = "pending" | "assigned" | "in_transit" | "delivered" | "completed" | "cancelled"

export interface Customer {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
}

export interface Location {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
  contactName?: string
  contactPhone?: string
  notes?: string
}

export interface Rate {
  total: number
  currency: string
  type: "flat" | "per_mile"
  detention?: number
  additionalStops?: number
  fuelSurcharge?: number
  other?: number
}

export interface Document {
  id: string
  name: string
  type: "bol" | "pod" | "invoice" | "other"
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface Vehicle {
  id: string
  tenantId: string
  type: "truck" | "van" | "trailer"
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: "active" | "maintenance" | "out_of_service"
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  fuelType: "diesel" | "gasoline" | "electric" | "hybrid"
  currentOdometer?: number
}

export interface Trailer {
  id: string
  tenantId: string
  type: "dry_van" | "reefer" | "flatbed" | "step_deck" | "other"
  length: number
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  status: "active" | "maintenance" | "out_of_service"
}
