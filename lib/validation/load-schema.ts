/**
 * Load validation schemas
 * 
 * Aligned with db schema:
 * - UUID for IDs
 * - Required origin/destination fields
 * - Optional driver/vehicle IDs (can be assigned later)
 * - Proper types for all fields based on database structure
 */
import { z } from "zod";
import { 
  uuidSchema, 
  optionalUuidSchema, 
  requiredString, 
  optionalString,
  optionalEmailSchema,
  optionalPhoneSchema,
  optionalIsoDateString,
  optionalPositiveNumber,
  optionalNonNegativeNumber,
  optionalIntegerSchema,
  loadStatusesEnum,
  moneySchema,
  optionalMoneySchema
} from "./common-schemas";

// Core schema for load data - used in both creation and updates
export const loadCoreSchema = z.object({
  // Required fields
  originAddress: requiredString.describe("Origin address"),
  originCity: requiredString.describe("Origin city"),
  originState: requiredString.describe("Origin state"),
  originZip: requiredString.describe("Origin ZIP code"),
  
  destinationAddress: requiredString.describe("Destination address"),
  destinationCity: requiredString.describe("Destination city"),
  destinationState: requiredString.describe("Destination state"),
  destinationZip: requiredString.describe("Destination ZIP code"),
  
  // Optional fields
  driverId: optionalUuidSchema.describe("Driver ID"),
  vehicleId: optionalUuidSchema.describe("Vehicle (tractor) ID"),
  trailerId: optionalUuidSchema.describe("Trailer ID"),
  
  status: loadStatusesEnum.default("pending").describe("Load status"),
  
  referenceNumber: optionalString.describe("Reference number"),
  customerName: optionalString.describe("Customer name"),
  customerContact: optionalString.describe("Customer contact name"),
  customerPhone: optionalPhoneSchema.describe("Customer phone"),
  customerEmail: optionalEmailSchema.describe("Customer email"),
  
  pickupDate: optionalIsoDateString.describe("Scheduled pickup date"),
  deliveryDate: optionalIsoDateString.describe("Scheduled delivery date"),
  actualPickupDate: optionalIsoDateString.describe("Actual pickup date"),
  actualDeliveryDate: optionalIsoDateString.describe("Actual delivery date"),
  
  commodity: optionalString.describe("Commodity"),
  weight: optionalPositiveNumber.describe("Weight"),
  rate: optionalMoneySchema.describe("Rate"),
  miles: optionalIntegerSchema.describe("Miles"),
  
  notes: optionalString.describe("Notes"),
});

// Schema for creating a new load
export const createLoadSchema = loadCoreSchema;

// Schema for updating an existing load
export const updateLoadSchema = loadCoreSchema.extend({
  id: uuidSchema.describe("Load ID to update"),
});

// Simplified schema for search/filter operations
export const loadFilterSchema = z.object({
  status: loadStatusesEnum.optional(),
  driverId: optionalUuidSchema,
  vehicleId: optionalUuidSchema,
  trailerId: optionalUuidSchema,
  dateFrom: optionalIsoDateString,
  dateTo: optionalIsoDateString,
});

export type CreateLoadInput = z.infer<typeof createLoadSchema>;
export type UpdateLoadInput = z.infer<typeof updateLoadSchema>;
export type LoadFilterData = z.infer<typeof loadFilterSchema>;
