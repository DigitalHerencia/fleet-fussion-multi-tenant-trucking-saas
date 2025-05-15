/**
 * Vehicle validation schemas
 * 
 * Aligned with db schema:
 * - Required fields match database structure
 * - Proper validation for vehicle types, statuses, etc.
 * - Appropriate optional fields with proper types
 */
import { z } from "zod";
import { 
  requiredString, 
  optionalString, 
  optionalStateCodeSchema,
  optionalYearSchema,
  optionalIsoDateString,
  optionalIntegerSchema,
  uuidSchema,
  vehicleTypesEnum,
  vehicleStatusesEnum,
  fuelTypesEnum
} from "./common-schemas";

// Core schema for vehicle data - used in both creation and updates
export const vehicleCoreSchema = z.object({
  // Required fields
  unitNumber: requiredString.describe("Unit number"),
  type: vehicleTypesEnum.describe("Vehicle type"),
  
  status: vehicleStatusesEnum.default("active").describe("Vehicle status"),
  
  // Optional fields
  make: optionalString.describe("Make"),
  model: optionalString.describe("Model"),
  year: optionalYearSchema.describe("Year"),
  vin: optionalString.describe("VIN"),
  licensePlate: optionalString.describe("License plate"), // Making optional to match DB schema
  state: optionalStateCodeSchema.describe("State"),
  
  // Additional fields from database
  currentOdometer: optionalIntegerSchema.describe("Current odometer reading"),
  lastOdometerUpdate: optionalIsoDateString.describe("Last odometer update date"),
  fuelType: fuelTypesEnum.optional().describe("Fuel type"),
  
  notes: optionalString.describe("Notes"),
});

// Schema for creating a new vehicle
export const createVehicleSchema = vehicleCoreSchema;

// Schema for updating an existing vehicle
export const updateVehicleSchema = vehicleCoreSchema.extend({
  id: uuidSchema.describe("Vehicle ID to update"),
});

// Simplified schema for search/filter operations
export const vehicleFilterSchema = z.object({
  type: vehicleTypesEnum.optional(),
  status: vehicleStatusesEnum.optional(),
  unitNumber: optionalString,
  make: optionalString,
  model: optionalString,
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleFilterData = z.infer<typeof vehicleFilterSchema>;


