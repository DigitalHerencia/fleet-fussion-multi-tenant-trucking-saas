/**
 * Validation schemas for vehicle-related forms
 * Using Zod for runtime validation
 */

import { z } from "zod"

export const createVehicleSchema = z.object({
  type: z.enum(["truck", "van", "trailer"]),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  licensePlate: z.string().min(1, "License plate is required"),
  fuelType: z.enum(["diesel", "gasoline", "electric", "hybrid"]),
  currentOdometer: z.number().min(0, "Odometer must be a positive number").optional(),
})

export const createTrailerSchema = z.object({
  type: z.enum(["dry_van", "reefer", "flatbed", "step_deck", "other"]),
  length: z.number().min(1, "Length is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  licensePlate: z.string().min(1, "License plate is required"),
})

export const updateVehicleSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "maintenance", "out_of_service"]).optional(),
  currentOdometer: z.number().min(0, "Odometer must be a positive number").optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  notes: z.string().optional(),
})

export const vehicleFilterSchema = z.object({
  status: z.enum(["all", "active", "maintenance", "out_of_service"]).optional(),
  type: z.enum(["all", "truck", "van", "trailer"]).optional(),
  search: z.string().optional(),
  maintenanceDueIn: z.number().optional(), // days
})

export const maintenanceRecordSchema = z.object({
  vehicleId: z.string(),
  date: z.string().min(1, "Date is required"),
  odometer: z.number().min(0, "Odometer must be a positive number"),
  type: z.enum(["preventive", "repair", "inspection", "other"]),
  description: z.string().min(1, "Description is required"),
  cost: z.number().min(0, "Cost must be a positive number"),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})
