/**
 * Validation schemas for compliance-related forms
 * Using Zod for runtime validation
 */

import * as z from "zod"

// Compliance document validation schemas
export const createComplianceDocumentSchema = z.object({
  entityType: z.enum(["driver", "vehicle", "trailer", "company"]),
  entityId: z.string().min(1, "Entity ID is required"),
  type: z.enum([
    // Company documents
    "dot_authority",
    "operating_authority",
    "business_license",
    "insurance_general",
    "insurance_cargo",
    "insurance_liability",
    "workers_comp",
    "ifta_license",
    "irs_form_2290",
    "ucr_registration",
    "drug_testing_program",
    "safety_management_cert",
    // Driver documents
    "cdl_license",
    "medical_certificate",
    "drug_test_results",
    "alcohol_test_results",
    "background_check",
    "mvr_report",
    "employment_verification",
    "road_test_certificate",
    "hazmat_endorsement",
    "twic_card",
    "passport",
    "driver_qualification_file",
    // Vehicle documents
    "vehicle_registration",
    "vehicle_title",
    "annual_inspection",
    "emission_test",
    "apportioned_registration",
    "vehicle_insurance",
    "lease_agreement",
    "maintenance_contract",
    "warranty_info",
    // Trailer documents
    "trailer_registration",
    "trailer_title",
    "trailer_inspection",
    "trailer_insurance",
    "trailer_lease",
    // Other
    "permit",
    "contract",
    "other",
  ]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  issuedDate: z.string().min(1, "Issued date is required"),
  expirationDate: z.string().optional(),
  documentNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  reminderDays: z.array(z.number().min(1)).default([30, 7, 1]),
  autoRenewal: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateComplianceDocumentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  status: z.enum(["valid", "expiring", "expired", "pending", "rejected"]).optional(),
  expirationDate: z.string().optional(),
  documentNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  reminderDays: z.array(z.number().min(1)).optional(),
  autoRenewal: z.boolean().optional(),
  renewalStatus: z.enum(["not_applicable", "pending", "in_progress", "completed", "failed"]).optional(),
  renewalNotes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const complianceDocumentFilterSchema = z.object({
  entityType: z.array(z.enum(["driver", "vehicle", "trailer", "company"])).optional(),
  entityId: z.string().optional(),
  type: z.array(z.string()).optional(),
  status: z.array(z.enum(["valid", "expiring", "expired", "pending", "rejected"])).optional(),
  expiringIn: z.number().min(1).optional(), // days
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "type", "expirationDate", "status", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// HOS validation schemas
export const hosEntrySchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(["driving", "on_duty", "off_duty", "sleeper_berth", "personal_conveyance", "yard_moves"]),
  location: z.string().min(1, "Location is required"),
  odometer: z.number().min(0).optional(),
  engineHours: z.number().min(0).optional(),
  notes: z.string().optional(),
  automaticEntry: z.boolean().default(false),
  source: z.enum(["manual", "eld", "driver_app", "gps"]).default("manual"),
})

export const hosBreakSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  type: z.enum(["30_minute", "8_hour", "10_hour", "34_hour", "other"]),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
})

export const createHosLogSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  hoursWorked: z.number(),
  notes: z.string().optional(),
})

export const updateHosLogSchema = z.object({
  id: z.string(),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  hoursWorked: z.number(),
  notes: z.string().optional(),
})

export const hosViolationSchema = z.object({
  hosLogId: z.string().min(1, "HOS Log ID is required"),
  type: z.enum(["11_hour", "14_hour", "70_hour", "8_hour_break", "30_minute_break", "34_hour_restart", "60_70_hour", "other"]),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["minor", "major", "critical"]),
  timestamp: z.string().min(1, "Timestamp is required"),
  resolved: z.boolean().default(false),
  resolutionNotes: z.string().optional(),
  fineAmount: z.number().min(0).optional(),
  courtDate: z.string().optional(),
})

export const hosFilterSchema = z.object({
  driverId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.array(z.enum(["compliant", "violation", "pending_review"])).optional(),
  hasViolations: z.boolean().optional(),
  sortBy: z.enum(["date", "status", "totalDriveTime", "violations"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// DVIR validation schemas
export const dvirDefectSchema = z.object({
  category: z.enum([
    "brakes",
    "coupling",
    "engine",
    "exhaust",
    "fuel_system",
    "lights",
    "steering",
    "tires",
    "suspension",
    "electrical",
    "body",
    "other",
  ]),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["minor", "major", "critical", "out_of_service"]),
  location: z.string().min(1, "Location is required"),
  repaired: z.boolean().default(false),
  repairDescription: z.string().optional(),
  partNumber: z.string().optional(),
  laborHours: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  requiresInspection: z.boolean().default(false),
  notes: z.string().optional(),
})

export const dvirImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  caption: z.string().optional(),
})

export const createDvirSchema = z.object({
  date: z.date(),
  vehicle: z.string(),
  driver: z.string(),
  location: z.string(),
  inspectionResult: z.array(z.string()),
  notes: z.string().optional(),
})

export const updateDvirSchema = z.object({
  id: z.string(),
  date: z.date(),
  vehicle: z.string(),
  driver: z.string(),
  location: z.string(),
  inspectionResult: z.array(z.string()),
  notes: z.string().optional(),
})

export const dvirFilterSchema = z.object({
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.array(z.enum(["pre_trip", "post_trip", "en_route"])).optional(),
  status: z.array(z.enum(["pending", "approved", "requires_attention", "out_of_service"])).optional(),
  safeToOperate: z.boolean().optional(),
  defectsFound: z.boolean().optional(),
  sortBy: z.enum(["date", "vehicle", "driver", "status", "defects"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// Maintenance validation schemas
export const maintenancePartSchema = z.object({
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Unit cost must be positive"),
  supplier: z.string().optional(),
  warranty: z.object({
    type: z.enum(["parts", "labor", "both"]),
    duration: z.number().int().min(1),
    mileage: z.number().int().min(0).optional(),
    description: z.string().optional(),
    startDate: z.string(),
    warrantyNumber: z.string().optional(),
    terms: z.string().optional(),
  }).optional(),
})

export const maintenanceVendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Vendor name is required"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
  preferredVendor: z.boolean().default(false),
})

export const createMaintenanceSchema = z.object({
  date: z.date(),
  vehicle: z.string(),
  mechanic: z.string(),
  location: z.string(),
  description: z.string(),
  cost: z.number(),
  notes: z.string().optional(),
})

export const updateMaintenanceSchema = z.object({
  id: z.string(),
  date: z.date(),
  vehicle: z.string(),
  mechanic: z.string(),
  location: z.string(),
  description: z.string(),
  cost: z.number(),
  notes: z.string().optional(),
})

export const complianceAlertSchema = z.object({
  type: z.enum(["expiring_document", "hos_violation", "maintenance_due", "inspection_due", "safety_event", "audit_finding"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  entityType: z.enum(["driver", "vehicle", "trailer", "company", "load"]),
  entityId: z.string().min(1, "Entity ID is required"),
  dueDate: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateComplianceAlertSchema = z.object({
  id: z.string(),
  acknowledged: z.boolean().optional(),
  resolved: z.boolean().optional(),
  resolutionNotes: z.string().optional(),
})

export const complianceAlertFilterSchema = z.object({
  type: z.array(z.enum(["expiring_document", "hos_violation", "maintenance_due", "inspection_due", "safety_event", "audit_finding"])).optional(),
  severity: z.array(z.enum(["low", "medium", "high", "critical"])).optional(),
  entityType: z.array(z.enum(["driver", "vehicle", "trailer", "company", "load"])).optional(),
  entityId: z.string().optional(),
  acknowledged: z.boolean().optional(),
  resolved: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "dueDate", "severity", "type"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// Safety Event validation schemas
export const createSafetyEventSchema = z.object({
  eventType: z.string().min(1, "Event type is required"),
  date: z.string().min(1, "Date is required"),
  entityType: z.enum(["driver", "vehicle", "trailer", "company"]),
  entityId: z.string().min(1, "Entity ID is required"),
  description: z.string().optional(),
  severity: z.enum(["minor", "major", "critical"]).optional(),
  location: z.string().optional(),
  reportedBy: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateSafetyEventSchema = z.object({
  id: z.string(),
  eventType: z.string().min(1, "Event type is required").optional(),
  date: z.string().optional(),
  entityType: z.enum(["driver", "vehicle", "trailer", "company"]).optional(),
  entityId: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(["minor", "major", "critical"]).optional(),
  location: z.string().optional(),
  reportedBy: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(["open", "in_review", "closed", "rejected"]).optional(),
  resolutionNotes: z.string().optional(),
})

export const safetyEventFilterSchema = z.object({
  eventType: z.array(z.string()).optional(),
  entityType: z.array(z.enum(["driver", "vehicle", "trailer", "company"])).optional(),
  entityId: z.string().optional(),
  severity: z.array(z.enum(["minor", "major", "critical"])).optional(),
  status: z.array(z.enum(["open", "in_review", "closed", "rejected"])).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["date", "severity", "status", "eventType"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

// Bulk operations validation schemas
export const bulkComplianceOperationSchema = z.object({
  operation: z.enum(["delete", "update_status", "acknowledge_alerts", "resolve_alerts", "bulk_reminder"]),
  ids: z.array(z.string()).min(1, "At least one item must be selected"),
  data: z.record(z.any()).optional(),
})

// Export types from schemas
export type CreateComplianceDocumentInput = z.infer<typeof createComplianceDocumentSchema>
export type UpdateComplianceDocumentInput = z.infer<typeof updateComplianceDocumentSchema>
export type ComplianceDocumentFilterInput = z.infer<typeof complianceDocumentFilterSchema>
export type CreateHosLogInput = z.infer<typeof createHosLogSchema>
export type UpdateHosLogInput = z.infer<typeof updateHosLogSchema>
export type HosViolationInput = z.infer<typeof hosViolationSchema>
export type HosFilterInput = z.infer<typeof hosFilterSchema>
export type CreateDvirInput = z.infer<typeof createDvirSchema>
export type UpdateDvirInput = z.infer<typeof updateDvirSchema>
export type DvirFilterInput = z.infer<typeof dvirFilterSchema>
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>
export type MaintenanceFilterInput = z.infer<typeof maintenancePartSchema>
export type CreateSafetyEventInput = z.infer<typeof createSafetyEventSchema>
export type UpdateSafetyEventInput = z.infer<typeof updateSafetyEventSchema>
export type SafetyEventFilterInput = z.infer<typeof safetyEventFilterSchema>
export type ComplianceAlertInput = z.infer<typeof complianceAlertSchema>
export type UpdateComplianceAlertInput = z.infer<typeof updateComplianceAlertSchema>
export type ComplianceAlertFilterInput = z.infer<typeof complianceAlertFilterSchema>
export type BulkComplianceOperationInput = z.infer<typeof bulkComplianceOperationSchema>
