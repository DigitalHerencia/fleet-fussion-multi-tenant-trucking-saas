/**
 * Company validation schemas
 *
 * Aligned with db schema:
 * - UUID for company IDs
 * - Proper validation for contact information
 * - Role-based access control
 */
import { z } from "zod";
import { 
  uuidSchema,
  externalIdSchema,
  requiredString,
  optionalString,
  optionalPhoneSchema,
  optionalStateCodeSchema
} from "./common-schemas";

// Enum for user roles matching database UserRole enum
export const userRoleEnum = z.enum([
  "OWNER",
  "ADMIN",
  "DISPATCHER",
  "SAFETY_MANAGER",
  "ACCOUNTANT",
  "DRIVER",
  "VIEWER",
]);

// Corresponds to the 'companies' table in db/schema.ts
export const companyCoreSchema = z.object({
  name: requiredString.min(2, "Company name must be at least 2 characters").max(255).describe("Company name"),
  
  // Optional fields
  dotNumber: z.string().max(50).optional().describe("DOT number"),
  mcNumber: z.string().max(50).optional().describe("MC number"),
  
  // Address fields
  address: z.string().max(255).optional().describe("Street address"),
  city: z.string().max(100).optional().describe("City"),
  state: optionalStateCodeSchema.describe("State"),
  zip: z.string().max(20).optional().describe("ZIP/Postal code"),
  
  // Contact information
  phone: optionalPhoneSchema.describe("Phone number"),
  email: z.string().email("Invalid email address").max(255).optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Email address"),
  
  // Branding
  logoUrl: z.string().url("Invalid URL for logo").max(1024).optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Logo URL"),
    
  primaryColor: z.string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color code")
    .default("#0f766e")
    .describe("Primary brand color"),
});

// Schema for creating a new company
export const createCompanySchema = companyCoreSchema.extend({
  // User ID of the creator - will become OWNER
  creatorUserId: externalIdSchema.describe("Creator's Clerk user ID"),
});

// Schema for updating an existing company
export const updateCompanySchema = companyCoreSchema.partial().extend({
  id: uuidSchema.describe("Company ID"),
  isActive: z.boolean().optional().describe("Company active status"),
});

// Schema for company settings
export const companySettingsSchema = z.object({
  id: uuidSchema.describe("Company ID"),
  
  primaryColor: z.string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color code")
    .optional()
    .describe("Primary brand color"),
    
  logoUrl: z.string().url("Invalid URL for logo").max(1024).optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Logo URL"),
});

// Schema for inviting users to a company
export const companyUserInviteSchema = z.object({
  companyId: uuidSchema.describe("Company ID"),
  email: z.string().email("Invalid email address").describe("Email address"),
  role: userRoleEnum.describe("User role"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type CompanyUserInviteInput = z.infer<typeof companyUserInviteSchema>;
export type UserRole = z.infer<typeof userRoleEnum>;
