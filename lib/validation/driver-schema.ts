/**
 * Driver validation schemas
 *
 * Aligned with db schema:
 * - Proper date handling for license/medical card expiration
 * - Standardized status values
 * - Clerk user ID for driver accounts
 */
import { z } from "zod";
import {
  uuidSchema,
  externalIdSchema,
  requiredString,
  optionalString,
  phoneSchema,
  optionalPhoneSchema,
  optionalCalendarDateSchema,
  optionalStateCodeSchema,
} from "./common-schemas";

// Driver statuses aligned with database values (lowercase to match db convention)
export const driverStatusEnum = z.enum([
  "active",
  "inactive",
  "on_leave",
  "terminated",
]);

export const driverCoreSchema = z.object({
  // Required fields
  firstName: requiredString.max(255, "First name is too long").describe("First name"),
  lastName: requiredString.max(255, "Last name is too long").describe("Last name"),
  
  // Optional fields
  email: z.string().max(255).optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Email address"),
    
  phone: optionalPhoneSchema.describe("Phone number"),
  
  licenseNumber: z.string().max(50, "License number is too long").optional().describe("Driver license number"),
  licenseState: optionalStateCodeSchema.describe("License issuing state"),
  licenseExpiration: optionalCalendarDateSchema.describe("License expiration date"),
  
  medicalCardExpiration: optionalCalendarDateSchema.describe("Medical card expiration date"),
  hireDate: optionalCalendarDateSchema.describe("Hire date"),
  terminationDate: optionalCalendarDateSchema.describe("Termination date"),
  
  status: driverStatusEnum.default("active").describe("Driver status"),
  notes: z.string().max(2000, "Notes are too long").optional().describe("Notes"),

  // Optional linking to Clerk user (if driver is also a system user)
  clerkUserId: externalIdSchema.optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Clerk user ID"),
});

// Schema for creating a new driver
export const createDriverSchema = driverCoreSchema;

// Schema for updating an existing driver
export const updateDriverSchema = driverCoreSchema.extend({
  id: uuidSchema.describe("Driver ID to update"),
});

// Schema for filtering drivers
export const driverFilterSchema = z.object({
  status: driverStatusEnum.optional(),
  name: optionalString,
  licenseExpiringBefore: optionalCalendarDateSchema,
  medicalCardExpiringBefore: optionalCalendarDateSchema,
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type DriverFilterInput = z.infer<typeof driverFilterSchema>;
export type DriverStatus = z.infer<typeof driverStatusEnum>;
