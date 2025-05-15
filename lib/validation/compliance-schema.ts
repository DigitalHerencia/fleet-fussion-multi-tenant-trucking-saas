/**
 * Compliance validation schemas
 *
 * Aligned with db schema:
 * - HOS logs
 * - Vehicle inspections
 * - Compliance documents
 */
import { z } from "zod";
import { 
  uuidSchema,
  optionalUuidSchema,
  requiredString,
  optionalString,
  isoDateString,
  optionalIsoDateString,
  optionalCalendarDateSchema
} from "./common-schemas";

// Basic compliance item schema
export const complianceSchema = z.object({
  title: requiredString.describe("Title"),
  description: requiredString.describe("Description"),
  dueDate: isoDateString.describe("Due date"),
});

export type ComplianceFormData = z.infer<typeof complianceSchema>;

// ============ HOS (Hours of Service) Logs ============

// Enum for HOS Log Status
export const hosStatusEnum = z.enum([
  "on_duty",
  "off_duty",
  "sleeper_berth",
  "driving",
]);

// Schema for creating/updating an HOS Log
export const hosLogSchema = z.object({
  driverId: uuidSchema.describe("Driver ID"),
  vehicleId: optionalUuidSchema.describe("Vehicle ID"),
  
  startTime: isoDateString.describe("Start time"),
  endTime: optionalIsoDateString.describe("End time"),
  
  status: hosStatusEnum.describe("HOS status"),
  location: z.string().max(255).optional().describe("Location"),
  notes: z.string().max(1000).optional().describe("Notes"),
});

export type HosLogInput = z.infer<typeof hosLogSchema>;

// ============ Vehicle Inspections ============

// Enum for Inspection Type
export const inspectionTypeEnum = z.enum([
  "pre_trip",
  "post_trip",
  "dot_inspection",
  "roadside_inspection",
  "annual_inspection",
  "other",
]);

// Enum for Inspection Status
export const inspectionStatusEnum = z.enum([
  "passed",
  "failed",
  "passed_with_defects",
  "pending_repair",
]);

// Schema for defects found during inspection
export const defectSchema = z.object({
  description: requiredString
    .min(3, "Defect description is too short")
    .max(500)
    .describe("Defect description"),
    
  severity: z.enum(["low", "medium", "high", "critical"])
    .optional()
    .describe("Severity level"),
    
  repaired: z.boolean().default(false).describe("Repair status"),
  repairNotes: z.string().max(500).optional().describe("Repair notes"),
});

// Schema for vehicle inspection
export const vehicleInspectionSchema = z.object({
  vehicleId: uuidSchema.describe("Vehicle ID"),
  driverId: uuidSchema.describe("Driver ID"),
  
  type: inspectionTypeEnum.describe("Inspection type"),
  status: inspectionStatusEnum.describe("Inspection status"),
  date: isoDateString.describe("Inspection date"),
  
  location: z.string().max(255).optional().describe("Location"),
  notes: z.string().max(1000).optional().describe("Notes"),
  defects: z.array(defectSchema).optional().default([]).describe("Defects found"),
});

export type VehicleInspectionInput = z.infer<typeof vehicleInspectionSchema>;

// ============ Compliance Documents ============

// Enum for Document Types
export const complianceDocumentTypeEnum = z.enum([
  "driver_license",
  "medical_card",
  "vehicle_registration",
  "insurance_policy",
  "annual_inspection_cert",
  "hazmat_certification",
  "other",
]);

// Schema for compliance documents
export const complianceDocumentSchema = z.object({
  driverId: optionalUuidSchema.describe("Driver ID"),
  vehicleId: optionalUuidSchema.describe("Vehicle ID"),
  
  type: complianceDocumentTypeEnum.describe("Document type"),
  name: requiredString.min(3, "Document name is too short").max(255).describe("Document name"),
  
  description: z.string().max(1000).optional().describe("Description"),
  issueDate: optionalCalendarDateSchema.describe("Issue date"),
  expiryDate: optionalCalendarDateSchema.describe("Expiry date"),
  
  fileUrl: z.string().url("Invalid file URL").describe("Document file URL"),
  notes: z.string().max(1000).optional().describe("Notes"),
});

export type ComplianceDocumentInput = z.infer<typeof complianceDocumentSchema>;
