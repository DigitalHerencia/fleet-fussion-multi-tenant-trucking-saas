import { z } from "zod";

// Corresponds to the 'companies' table in db/schema.ts
export const companyCoreSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }).max(255),
  dotNumber: z.string().max(50).optional().nullable(),
  mcNumber: z.string().max(50).optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(), // Could be an enum if you have a fixed list
  zip: z.string().max(20).optional().nullable(),
  phone: z.string().max(30).optional().nullable(), // Consider more specific phone validation if needed
  email: z.string().email({ message: "Invalid email address." }).max(255).optional().nullable(),
  logoUrl: z.string().url({ message: "Invalid URL for logo." }).max(1024).optional().nullable(),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }).optional().nullable(),
  // clerkOrgId is usually system-assigned, not part of user input for creation/update directly by typical users
});

export const createCompanySchema = companyCoreSchema.extend({
  // userId of the creator, will be associated with Clerk user and become OWNER
  creatorUserId: z.string({ required_error: "Creator user ID is required." }),
  // clerkOrgId might be created by a backend process after successful company creation
  // and Clerk organization creation. Or, if an org exists, it could be linked.
});

export const updateCompanySchema = companyCoreSchema.partial().extend({
  id: z.string().uuid({ message: "Invalid company ID for update." }),
  isActive: z.boolean().optional(),
});

export const companySettingsSchema = z.object({
  id: z.string().uuid(),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { message: "Invalid hex color code." }).optional(),
  logoUrl: z.string().url({ message: "Invalid URL for logo." }).max(1024).optional().nullable(),
  // Add other company-specific settings here
});

export const companyUserInviteSchema = z.object({
  companyId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "DISPATCHER", "SAFETY_MANAGER", "ACCOUNTANT", "DRIVER", "VIEWER"]), // From your UserRole enum
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
export type CompanyUserInviteInput = z.infer<typeof companyUserInviteSchema>;
