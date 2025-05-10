import { z } from "zod"

export const phoneRegex = new RegExp(/^\+?[1-9]\d{1,14}$/) // Basic E.164-like regex, ensure to escape backslashes in strings for RegExp constructor if used

export const addressSchema = z.object({
    street: z.string().min(1, "Street address is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State/Province is required."),
    zipCode: z.string().min(1, "ZIP/Postal code is required."),
    country: z.string().min(1, "Country is required.")
})

// For dates that are expected to be full ISO 8601 datetime strings
export const isoDateString = z.string().datetime({
    message: "Invalid ISO 8601 date format, e.g., YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss.sssZ"
})

// For optional dates that might come as empty strings from forms, or be null/undefined
export const optionalIsoDateString = z
    .union([
        z.literal(""), // Allow empty string
        isoDateString.optional().nullable() // Allow valid ISO string, undefined, or null
    ])
    .transform(value => (value === "" ? undefined : value)) // Transform empty string to undefined for easier handling

export const positiveNumber = z.coerce.number().positive("Must be a positive number.")
export const nonNegativeNumber = z.coerce.number().nonnegative("Must be a non-negative number.")

// Schema for IDs (e.g., CUIDs or UUIDs) - adjust regex if a specific format like CUID is enforced everywhere
export const idSchema = z.string().min(1, "ID cannot be empty.")
// Example for CUID: z.string().cuid("Invalid CUID format.");
// Example for UUID: z.string().uuid("Invalid UUID format.");

export const fileSchema = z.custom<File>(val => val instanceof File, "Invalid file provided.")

export const optionalFileSchema = z
    .custom<File>(val => val instanceof File, "Invalid file provided.")
    .optional()
    .nullable()
