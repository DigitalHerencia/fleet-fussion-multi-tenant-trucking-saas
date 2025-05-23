/**
 * Validation schemas for compliance-related forms
 * Using Zod for runtime validation
 */

import { z } from "zod"

export const createComplianceDocumentSchema = z.object({
  type: z.enum([
    "dot_authority",
    "insurance",
    "ifta_license",
    "ucr_registration",
    "drug_testing",
    "annual_inspection",
    "driver_qualification",
    "other",
  ]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  issuedDate: z.string().min(1, "Issued date is required"),
  expirationDate: z.string().optional(),
  documentNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  notes: z.string().optional(),
})

export const updateComplianceDocumentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
})

export const complianceDocumentFilterSchema = z.object({
  type: z
    .enum([
      "all",
      "dot_authority",
      "insurance",
      "ifta_license",
      "ucr_registration",
      "drug_testing",
      "annual_inspection",
      "driver_qualification",
      "other",
    ])
    .optional(),
  status: z.enum(["all", "valid", "expiring", "expired"]).optional(),
  expiringIn: z.number().optional(), // days
})

export const dvirSchema = z.object({
  vehicleId: z.string(),
  driverId: z.string(),
  date: z.string().min(1, "Date is required"),
  preTrip: z.boolean(),
  postTrip: z.boolean(),
  defects: z.array(
    z.object({
      category: z.enum([
        "brakes",
        "coupling",
        "engine",
        "exhaust",
        "fuel_system",
        "lights",
        "steering",
        "tires",
        "other",
      ]),
      description: z.string().min(1, "Description is required"),
      severity: z.enum(["minor", "major", "critical"]),
    }),
  ),
  safeToOperate: z.boolean(),
  notes: z.string().optional(),
  signature: z.string().min(1, "Signature is required"),
})
