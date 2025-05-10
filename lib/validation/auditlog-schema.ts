import { z } from "zod"
import { UserRole } from "@/db/schema" // Assuming UserRole is defined and exported from your schema

export const AuditLogActionEnum = z.enum([
    // User/Auth Actions
    "USER_LOGIN",
    "USER_LOGOUT",
    "USER_REGISTER",
    "USER_PASSWORD_RESET_REQUEST",
    "USER_PASSWORD_RESET_SUCCESS",
    "USER_PROFILE_UPDATE",
    "USER_ROLE_CHANGE",

    // Company Actions
    "COMPANY_CREATE",
    "COMPANY_UPDATE",
    "COMPANY_SETTINGS_UPDATE",
    "COMPANY_USER_INVITE",
    "COMPANY_USER_REMOVE",
    "COMPANY_SUBSCRIPTION_UPDATE",

    // Vehicle Actions
    "VEHICLE_CREATE",
    "VEHICLE_UPDATE",
    "VEHICLE_DELETE",
    "VEHICLE_ASSIGN_DRIVER",
    "VEHICLE_STATUS_UPDATE", // e.g., active, inactive, maintenance

    // Driver Actions
    "DRIVER_CREATE",
    "DRIVER_UPDATE",
    "DRIVER_DELETE",
    "DRIVER_STATUS_UPDATE", // e.g., active, inactive, on_leave
    "DRIVER_LICENSE_UPDATE",
    "DRIVER_MEDICAL_UPDATE",

    // Load Actions
    "LOAD_CREATE",
    "LOAD_UPDATE",
    "LOAD_DELETE",
    "LOAD_ASSIGN_DRIVER_VEHICLE",
    "LOAD_STATUS_UPDATE", // e.g., pending, dispatched, in_transit, delivered, cancelled
    "LOAD_DOCUMENT_UPLOAD", // BOL, POD

    // Document Actions
    "DOCUMENT_UPLOAD",
    "DOCUMENT_DELETE",
    "DOCUMENT_VIEW", // If tracking views is important

    // Compliance Actions
    "COMPLIANCE_HOS_LOG_CREATE",
    "COMPLIANCE_HOS_LOG_UPDATE",
    "COMPLIANCE_INSPECTION_CREATE",
    "COMPLIANCE_INSPECTION_UPDATE",
    "COMPLIANCE_DOCUMENT_UPLOAD", // e.g., registration, insurance

    // IFTA Actions
    "IFTA_TRIP_CREATE",
    "IFTA_TRIP_UPDATE",
    "IFTA_TRIP_DELETE",
    "IFTA_REPORT_GENERATE",

    // Settings Actions
    "SETTINGS_APP_UPDATE",
    "SETTINGS_USER_PREFERENCES_UPDATE",

    // Generic CRUD
    "ENTITY_CREATE",
    "ENTITY_UPDATE",
    "ENTITY_DELETE",

    // Other specific actions
    "WEBHOOK_RECEIVED_CLERK"
])

export const AuditLogEntityTypeEnum = z.enum([
    "USER",
    "COMPANY",
    "VEHICLE",
    "DRIVER",
    "LOAD",
    "DOCUMENT",
    "INSPECTION",
    "MAINTENANCE_RECORD",
    "IFTA_TRIP",
    "IFTA_REPORT",
    "COMPLIANCE_DOCUMENT",
    "HOS_LOG",
    "SETTINGS",
    "NOTIFICATION",
    "WEBHOOK_EVENT",
    "CUSTOMER",
    "INVOICE",
    "SETTLEMENT",
    "INSURANCE_POLICY",
    "AUDIT_LOG", // Meta, if needed
    "OTHER"
])

export const auditLogSchema = z.object({
    userId: z.string().optional(),
    action: z.string().min(1, "Action is required"),
    targetTable: z.string().optional(),
    targetId: z.string().uuid().optional(),
    details: z.any().optional(),
    createdAt: z.coerce.date().optional()
})

export const createAuditLogSchema = z.object({
    companyId: z.string().uuid({ message: "Invalid company ID" }),
    userId: z.string({ message: "User ID is required" }), // Clerk User ID
    action: AuditLogActionEnum,
    entityType: AuditLogEntityTypeEnum.optional(),
    entityId: z.string().uuid().optional(),
    details: z.record(z.unknown()).optional() // For any additional JSON details
    // timestamp is usually added by the server/db
})

// Example: If you have a specific structure for some details
export const updateLoadStatusDetailsSchema = z.object({
    oldStatus: z.string(),
    newStatus: z.string(),
    loadNumber: z.string().optional()
})

export type AuditLogFormValues = z.infer<typeof auditLogSchema>
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>
