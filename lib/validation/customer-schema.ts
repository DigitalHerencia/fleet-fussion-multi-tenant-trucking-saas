import { z } from "zod";

// Schema for creating a customer
// This is a generic customer schema, adjust if you have a specific table in db/schema.ts
// If customers are tied to companies (multi-tenancy), companyId will be added server-side.
export const customerCoreSchema = z.object({
  name: z.string().min(2, { message: "Customer name must be at least 2 characters." }).max(255),
  contactPerson: z.string().max(255).optional().nullable(),
  email: z.string().email({ message: "Invalid email address." }).max(255).optional().nullable(),
  phone: z.string().max(30).optional().nullable(), // Consider more specific phone validation
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  country: z.string().max(50).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(), // e.g., VAT ID, EIN
  notes: z.string().max(2000).optional().nullable(),
});

export const createCustomerSchema = customerCoreSchema;
export const updateCustomerSchema = customerCoreSchema.extend({
  id: z.string().uuid({ message: "Invalid customer ID for update." }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
