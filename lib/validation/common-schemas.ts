/**
 * Common validation schemas for FleetFusion
 * 
 * This file defines standard validation patterns used across the application:
 * - UUIDs for IDs
 * - Date formats (ISO, calendar dates)
 * - Phone numbers, addresses, and other common data types
 * - Numbers (positive, non-negative, percentages, etc.)
 * - Status enums for different entities
 */

import { z } from "zod";

// ============ ID Schemas ============
// UUID is the standard ID format for all database records
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Optional UUID (for filters, partial updates, etc.)
export const optionalUuidSchema = uuidSchema.optional()
  .or(z.literal("").transform(() => undefined));

// For Clerk user/org IDs which are strings but not UUIDs
export const externalIdSchema = z.string().min(1, "ID cannot be empty");

// ============ String Schemas ============
export const requiredString = z.string().min(1, "This field is required");
export const optionalString = z.string().optional();
export const trimmedString = z.string().trim();
export const emailSchema = z.string().email("Invalid email address").max(255);
export const optionalEmailSchema = emailSchema.optional()
  .or(z.literal("").transform(() => undefined));

// Phone number (E.164 standard format)
export const phoneRegex = new RegExp(/^\+?[1-9]\d{1,14}$/);
export const phoneSchema = z.string().regex(phoneRegex, "Invalid phone number format");
export const optionalPhoneSchema = phoneSchema.optional()
  .or(z.literal("").transform(() => undefined));

// State code (US/CA)
export const stateCodeSchema = z.string().length(2, "State must be a 2-character code");
export const optionalStateCodeSchema = stateCodeSchema.optional()
  .or(z.literal("").transform(() => undefined));

// ============ Address Schemas ============
export const addressSchema = z.object({
  street: requiredString,
  city: requiredString,
  state: requiredString,
  zipCode: requiredString,
  country: requiredString.default("USA"),
});

// ============ Date Schemas ============
// For dates that need full timestamp precision (timestamps in DB)
export const isoDateString = z.string().datetime({
  message: "Invalid date format (YYYY-MM-DDTHH:mm:ssZ)",
});

// For optional dates that might come as empty strings from forms
export const optionalIsoDateString = z
  .union([
    z.literal(""),
    isoDateString.optional().nullable(),
  ])
  .transform((value) => (value === "" ? undefined : value));

// For calendar dates without time (like license expiration)
export const calendarDateSchema = z.coerce.date();

export const optionalCalendarDateSchema = z
  .union([
    z.literal(""),
    z.coerce.date().optional().nullable(),
  ])
  .transform((value) => (value === "" ? undefined : value));

// Consistent date handling for both string and Date objects
export const flexibleDateSchema = z.union([
  z.string().transform((val) => new Date(val)),
  z.date()
]);

export const optionalFlexibleDateSchema = flexibleDateSchema.optional()
  .or(z.literal("").transform(() => undefined));

// ============ Number Schemas ============
export const positiveNumber = z.coerce
  .number()
  .positive("Must be a positive number");

export const nonNegativeNumber = z.coerce
  .number()
  .nonnegative("Must be a non-negative number");

export const optionalPositiveNumber = positiveNumber.optional()
  .or(z.literal("").transform(() => undefined));

export const optionalNonNegativeNumber = nonNegativeNumber.optional()
  .or(z.literal("").transform(() => undefined));

export const integerSchema = z.coerce.number().int();
export const optionalIntegerSchema = integerSchema.optional()
  .or(z.literal("").transform(() => undefined));

export const yearSchema = z.coerce
  .number()
  .int()
  .min(1900, "Year must be 1900 or later")
  .max(new Date().getFullYear() + 1, "Year cannot be in the future");

export const optionalYearSchema = yearSchema.optional()
  .or(z.literal("").transform(() => undefined));

export const moneySchema = z.coerce
  .number()
  .nonnegative("Amount must be non-negative")
  .transform((val) => Number(val.toFixed(2))); // Format for currency

export const optionalMoneySchema = moneySchema.optional()
  .or(z.literal("").transform(() => undefined));

// ============ Status Enums ============
// Vehicle types
export const vehicleTypesEnum = z.enum([
  "tractor",
  "trailer", 
  "box_truck", 
  "cargo_van", 
  "sprinter", 
  "other"
]);

export type VehicleType = z.infer<typeof vehicleTypesEnum>;

// Vehicle statuses
export const vehicleStatusesEnum = z.enum([
  "active", 
  "inactive", 
  "maintenance", 
  "out_of_service"
]);

export type VehicleStatus = z.infer<typeof vehicleStatusesEnum>;

// Load statuses
export const loadStatusesEnum = z.enum([
  "pending",
  "assigned",
  "in_transit", 
  "delivered", 
  "completed", 
  "cancelled"
]);

export type LoadStatus = z.infer<typeof loadStatusesEnum>;

// Driver statuses
export const driverStatusesEnum = z.enum([
  "active",
  "inactive",
  "on_leave",
  "terminated",
]);

export type DriverStatus = z.infer<typeof driverStatusesEnum>;

// Fuel types
export const fuelTypesEnum = z.enum([
  "diesel",
  "gasoline",
  "electric",
  "hybrid",
  "cng",
  "lpg",
  "other"
]);

export type FuelType = z.infer<typeof fuelTypesEnum>;

// User roles (matching db schema)
export const userRolesEnum = z.enum([
  "OWNER",
  "ADMIN",
  "DISPATCHER",
  "SAFETY_MANAGER",
  "ACCOUNTANT",
  "DRIVER",
  "VIEWER",
]);

export type UserRole = z.infer<typeof userRolesEnum>;

// ============ Other Schemas ============
export const fileSchema = z.custom<File>(
  (val) => val instanceof File,
  "Invalid file provided"
);

export const optionalFileSchema = z
  .custom<File>((val) => val instanceof File, "Invalid file provided.")
  .optional()
  .nullable();
