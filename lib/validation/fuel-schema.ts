/**
 * Fuel purchase validation schemas
 * 
 * Schemas for tracking fuel purchases:
 * - Vehicle and driver associations
 * - Purchase details
 * - IFTA reporting data
 */
import { z } from "zod";
import { 
  uuidSchema,
  optionalUuidSchema,
  requiredString,
  optionalString,
  positiveNumber,
  calendarDateSchema,
  optionalStateCodeSchema
} from "./common-schemas";

// Fuel types available in the system
const fuelTypeEnum = z.enum([
  "diesel",
  "gasoline",
  "def",
  "cng",
  "lpg",
  "electric",
  "other"
]);

// Schema for fuel purchases
export const fuelPurchaseSchema = z.object({
  // Entity references
  vehicleId: uuidSchema.describe("Vehicle ID"),
  driverId: optionalUuidSchema.describe("Driver ID"),
  
  // Purchase details
  date: calendarDateSchema.describe("Purchase date"),
  location: requiredString.describe("Location name"),
  address: optionalString.describe("Address"),
  city: optionalString.describe("City"),
  state: optionalStateCodeSchema.describe("State/Province"),
  
  // IFTA data
  jurisdiction: requiredString.describe("Tax jurisdiction"),
  
  // Fuel details
  fuelType: fuelTypeEnum.default("diesel").describe("Fuel type"),
  gallons: positiveNumber.describe("Gallons"),
  pricePerGallon: positiveNumber.describe("Price per gallon"),
  totalAmount: positiveNumber.describe("Total amount"),
  
  // Optional data
  odometer: z.coerce.number().positive().optional().describe("Current odometer"),
  receiptId: optionalString.describe("Receipt ID/number"),
  isIfta: z.boolean().default(true).describe("Relevant for IFTA"),
  notes: optionalString.describe("Notes"),
});

// Schema for filtering fuel purchases
export const fuelFilterSchema = z.object({
  vehicleId: optionalUuidSchema,
  driverId: optionalUuidSchema,
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  fuelType: fuelTypeEnum.optional(),
  state: optionalStateCodeSchema,
});

export type FuelPurchaseFormData = z.infer<typeof fuelPurchaseSchema>;
export type FuelFilterData = z.infer<typeof fuelFilterSchema>;
