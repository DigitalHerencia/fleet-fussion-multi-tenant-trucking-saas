import { z } from "zod";
import {
  idSchema,
  optionalIsoDateString,
  phoneRegex,
} from "./common-schemas";

export const DriverStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ON_LEAVE",
  "TERMINATED",
  // Add other relevant statuses
]);

export const driverCoreSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(255),
  lastName: z.string().min(1, "Last name is required.").max(255),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .max(255)
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(phoneRegex, { message: "Invalid phone number format." })
    .optional()
    .nullable(),
  licenseNumber: z
    .string()
    .max(50, "License number is too long.")
    .optional()
    .nullable(),
  licenseState: z
    .string()
    .max(50, "License state is too long.")
    .optional()
    .nullable(),
  licenseExpiration: optionalIsoDateString,
  medicalCardExpiration: optionalIsoDateString,
  hireDate: optionalIsoDateString,
  terminationDate: optionalIsoDateString,
  status: DriverStatusEnum.default("ACTIVE"),
  notes: z.string().max(2000, "Notes are too long.").optional().nullable(),
  // companyId will be added server-side based on the authenticated user's company
  // clerkUserId will be linked server-side if the driver is also a system user
});

export const createDriverSchema = driverCoreSchema.extend({
  clerkUserId: idSchema.optional().nullable(), // Optional: if inviting an existing Clerk user to be a driver
});

export const updateDriverSchema = driverCoreSchema.extend({
  id: idSchema, // Driver ID to update
  clerkUserId: idSchema.optional().nullable(),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type DriverStatus = z.infer<typeof DriverStatusEnum>;
