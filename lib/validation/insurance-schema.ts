import { z } from "zod";

export const insurancePolicySchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  policyNumber: z.string().min(1, "Policy number is required"),
  coverageType: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  premium: z.coerce.number().positive("Premium must be positive").optional(),
  status: z.enum(["active", "inactive", "expired"]).default("active"),
  notes: z.string().optional(),
});

export type InsurancePolicyFormValues = z.infer<typeof insurancePolicySchema>;
