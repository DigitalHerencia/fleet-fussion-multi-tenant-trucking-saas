/**
 * Settlement validation schemas
 * 
 * Schemas for driver/load settlements with:
 * - UUIDs for entity references
 * - Proper validation for monetary values
 * - Date handling for settlement dates
 */
import { z } from "zod";
import { 
  optionalUuidSchema,
  positiveNumber,
  optionalCalendarDateSchema,
  optionalString
} from "./common-schemas";

// Settlement status options
const settlementStatusEnum = z.enum([
  "pending",
  "processing",
  "paid",
  "cancelled",
  "disputed"
]);

// Schema for creating/updating a settlement
export const settlementSchema = z.object({
  // Entity references
  driverId: optionalUuidSchema.describe("Driver ID"),
  loadId: optionalUuidSchema.describe("Load ID"),
  
  // Settlement details
  amount: positiveNumber.describe("Settlement amount"),
  status: settlementStatusEnum.default("pending").describe("Settlement status"),
  
  // Dates
  issuedDate: optionalCalendarDateSchema.describe("Date issued"),
  paidDate: optionalCalendarDateSchema.describe("Date paid"),
  
  // Additional fields
  paymentMethod: z.enum(["direct_deposit", "check", "cash", "other"]).optional().describe("Payment method"),
  referenceNumber: optionalString.describe("Payment reference number"),
  notes: optionalString.describe("Notes"),
});

// Schema for filtering settlements
export const settlementFilterSchema = z.object({
  driverId: optionalUuidSchema,
  loadId: optionalUuidSchema,
  status: settlementStatusEnum.optional(),
  dateFrom: optionalCalendarDateSchema,
  dateTo: optionalCalendarDateSchema,
});

export type SettlementFormValues = z.infer<typeof settlementSchema>;
export type SettlementFilterValues = z.infer<typeof settlementFilterSchema>;
