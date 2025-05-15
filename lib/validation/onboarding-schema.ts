import { z } from "zod";

export const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
