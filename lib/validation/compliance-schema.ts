import { z } from "zod";

export const complianceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type ComplianceFormData = z.infer<typeof complianceSchema>;

// Enum for HOS Log Status (example, adjust as needed)
export const HosStatusEnum = z.enum([
  "ON_DUTY",
  "OFF_DUTY",
  "SLEEPER_BERTH",
  "DRIVING",
]);

// Schema for creating/updating an HOS Log
// Assuming a simplified structure. You'll need to align this with your actual db schema for HOS logs.
export const hosLogSchema = z.object({
  driverId: z.string().uuid({ message: "Invalid driver ID." }),
  vehicleId: z
    .string()
    .uuid({ message: "Invalid vehicle ID." })
    .optional()
    .nullable(),
  startTime: z.string().datetime({ message: "Invalid start time." }),
  endTime: z
    .string()
    .datetime({ message: "Invalid end time." })
    .optional()
    .nullable(),
  status: HosStatusEnum,
  location: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  // companyId will likely be derived server-side from the authenticated user
});

export type HosLogInput = z.infer<typeof hosLogSchema>;

// Enum for Inspection Type and Status
export const InspectionTypeEnum = z.enum([
  "PRE_TRIP",
  "POST_TRIP",
  "DOT_INSPECTION",
  "ROADSIDE_INSPECTION",
  "ANNUAL_INSPECTION",
  "OTHER",
]);

export const InspectionStatusEnum = z.enum([
  "PASSED",
  "FAILED",
  "PASSED_WITH_DEFECTS",
  "PENDING_REPAIR",
]);

// Schema for a defect found during inspection
export const defectSchema = z.object({
  description: z
    .string()
    .min(3, { message: "Defect description is too short." })
    .max(500),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  repaired: z.boolean().default(false),
  repairNotes: z.string().max(500).optional().nullable(),
});

// Schema for creating/updating a Vehicle Inspection
// Based on 'inspections' table in db/schema.ts
export const vehicleInspectionSchema = z.object({
  vehicleId: z.string().uuid({ message: "Invalid vehicle ID." }),
  driverId: z.string().uuid({ message: "Invalid driver ID." }),
  type: InspectionTypeEnum,
  status: InspectionStatusEnum,
  date: z.string().datetime({ message: "Invalid inspection date." }),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  defects: z.array(defectSchema).optional().default([]), // From 'defects' json column
  // companyId will be derived server-side
});

export type VehicleInspectionInput = z.infer<typeof vehicleInspectionSchema>;

// Enum for Compliance Document Types (example)
export const ComplianceDocumentTypeEnum = z.enum([
  "DRIVER_LICENSE",
  "MEDICAL_CARD",
  "VEHICLE_REGISTRATION",
  "INSURANCE_POLICY",
  "ANNUAL_INSPECTION_CERT",
  "HAZMAT_CERTIFICATION",
  "OTHER_COMPLIANCE_DOC",
]);

// Schema for creating/updating a Compliance Document
// Based on 'complianceDocuments' table in db/schema.ts
export const complianceDocumentSchema = z.object({
  // companyId derived server-side
  driverId: z
    .string()
    .uuid({ message: "Invalid driver ID." })
    .optional()
    .nullable(),
  vehicleId: z
    .string()
    .uuid({ message: "Invalid vehicle ID." })
    .optional()
    .nullable(),
  type: ComplianceDocumentTypeEnum,
  name: z.string().min(3, { message: "Document name is too short." }).max(255),
  description: z.string().max(1000).optional().nullable(),
  issueDate: z
    .string()
    .datetime({ message: "Invalid issue date." })
    .optional()
    .nullable(),
  expiryDate: z
    .string()
    .datetime({ message: "Invalid expiry date." })
    .optional()
    .nullable(),
  fileUrl: z.string().url({ message: "Invalid file URL." }), // Assuming URL is provided after upload
  notes: z.string().max(1000).optional().nullable(),
});

export type ComplianceDocumentInput = z.infer<typeof complianceDocumentSchema>;
