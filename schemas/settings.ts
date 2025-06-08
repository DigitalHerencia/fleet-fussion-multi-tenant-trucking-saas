import { z } from 'zod';

export const CompanyProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email(),
});
