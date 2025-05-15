/**
 * Customer validation schemas
 * 
 * Validation for customer data with:
 * - Required customer name
 * - Optional contact information
 * - Address fields
 */
import { z } from "zod";
import { 
  uuidSchema,
  requiredString,
  optionalString,
  optionalPhoneSchema,
  optionalStateCodeSchema
} from "./common-schemas";

// Core schema for customer data
export const customerCoreSchema = z.object({
  // Required fields
  name: requiredString.min(2, "Customer name must be at least 2 characters").max(255).describe("Customer name"),
  
  // Contact information
  contactPerson: optionalString.describe("Contact person"),
  email: z.string().email("Invalid email address").max(255).optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Email address"),
  phone: optionalPhoneSchema.describe("Phone number"),
  
  // Address fields
  address: optionalString.describe("Street address"),
  city: optionalString.describe("City"),
  state: optionalStateCodeSchema.describe("State"),
  zip: optionalString.describe("ZIP/Postal code"),
  country: optionalString.default("USA").describe("Country"),
  
  // Additional fields
  taxId: optionalString.describe("Tax ID / EIN"),
  notes: optionalString.describe("Notes"),
});

// Schema for creating a new customer
export const createCustomerSchema = customerCoreSchema;

// Schema for updating an existing customer
export const updateCustomerSchema = customerCoreSchema.extend({
  id: uuidSchema.describe("Customer ID"),
});

// Schema for filtering customers
export const customerFilterSchema = z.object({
  name: optionalString,
  contactPerson: optionalString,
  city: optionalString,
  state: optionalString,
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
