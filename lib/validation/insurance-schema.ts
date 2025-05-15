/**
 * Insurance policy validation schemas
 * 
 * Schemas for tracking insurance policies:
 * - Policy details and coverage
 * - Effective dates
 * - Vehicle/driver associations
 */
import { z } from "zod";
import { 
  uuidSchema,
  optionalUuidSchema,
  requiredString,
  optionalString,
  optionalPositiveNumber,
  calendarDateSchema,
  optionalCalendarDateSchema
} from "./common-schemas";

// Insurance coverage types
const coverageTypeEnum = z.enum([
  "primary_liability",
  "physical_damage",
  "cargo",
  "general_liability",
  "non_trucking_liability",
  "workers_comp",
  "occupational_accident",
  "other"
]);

// Insurance policy status
const policyStatusEnum = z.enum([
  "active",
  "pending",
  "inactive",
  "expired",
  "cancelled"
]);

// Schema for insurance policies
export const insurancePolicySchema = z.object({
  // Basic policy information
  provider: requiredString.describe("Insurance provider"),
  policyNumber: requiredString.describe("Policy number"),
  
  // Coverage details
  coverageType: coverageTypeEnum.describe("Coverage type"),
  coverageDescription: optionalString.describe("Coverage description"),
  coverageAmount: optionalPositiveNumber.describe("Coverage amount"),
  deductible: optionalPositiveNumber.describe("Deductible amount"),
  
  // Dates
  startDate: calendarDateSchema.describe("Policy start date"),
  endDate: optionalCalendarDateSchema.describe("Policy end date"),
  
  // Financial details
  premium: optionalPositiveNumber.describe("Premium amount"),
  paymentFrequency: z.enum(["monthly", "quarterly", "semi_annual", "annual"]).optional().describe("Payment frequency"),
  
  // Status
  status: policyStatusEnum.default("active").describe("Policy status"),
  
  // Associated entities
  vehicleIds: z.array(uuidSchema).optional().describe("Covered vehicles"),
  driverIds: z.array(uuidSchema).optional().describe("Covered drivers"),
  
  // Additional information
  agentName: optionalString.describe("Agent name"),
  agentContact: optionalString.describe("Agent contact information"),
  notes: optionalString.describe("Notes"),
  documentUrl: optionalString.describe("Policy document URL"),
});

// Schema for filtering insurance policies
export const insuranceFilterSchema = z.object({
  status: policyStatusEnum.optional(),
  coverageType: coverageTypeEnum.optional(),
  vehicleId: optionalUuidSchema,
  driverId: optionalUuidSchema,
  expiringBefore: optionalCalendarDateSchema,
});

export type InsurancePolicyFormValues = z.infer<typeof insurancePolicySchema>;
export type InsuranceFilterValues = z.infer<typeof insuranceFilterSchema>;
