import { z } from "zod";
import { 
  requiredString,
  optionalString,
  uuidSchema
} from "./common-schemas";

// Core schema for company settings
export const settingsCoreSchema = z.object({
  companyName: requiredString.describe("Company name"),
  dotNumber: optionalString.describe("DOT number"),
  address: optionalString.describe("Address"),
  phone: optionalString.describe("Phone"),
  email: z.string().email("Invalid email address").optional()
    .or(z.literal("").transform(() => undefined))
    .describe("Email address"),
});

// Schema for updating settings
export const settingsUpdateSchema = settingsCoreSchema.extend({
  id: uuidSchema.describe("Company ID"),
});

export type SettingsFormData = z.infer<typeof settingsCoreSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
