/**
 * FleetFusion Multi-Tenant Database Schema
 * 
 * Comprehensive schema for fleet management with proper tenant isolation
 * and Clerk synchronization support
 */

import { relations, sql } from "drizzle-orm";
import { 
  pgTable, 
  uuid, 
  text, 
  boolean, 
  timestamp, 
  integer, 
  numeric, 
  jsonb, 
  date,
  pgEnum,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";

// Enums for consistent data types
export const userRoleEnum = pgEnum('user_role', [
  'admin', 'dispatcher', 'driver', 'compliance', 'accountant', 'viewer'
]);

export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'free', 'pro', 'enterprise'
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'inactive', 'trial', 'cancelled'
]);

export const vehicleStatusEnum = pgEnum('vehicle_status', [
  'active', 'inactive', 'maintenance', 'decommissioned'
]);

export const driverStatusEnum = pgEnum('driver_status', [
  'active', 'inactive', 'suspended', 'terminated'
]);

export const loadStatusEnum = pgEnum('load_status', [
  'pending', 'assigned', 'in_transit', 'delivered', 'cancelled'
]);

/**
 * ORGANIZATIONS TABLE
 * Stores multi-tenant organization data synchronized with Clerk
 */
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  
  // Business Information
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  
  // Subscription Management
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default('free'),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default('trial'),
  maxUsers: integer("max_users").notNull().default(5),
  billingEmail: text("billing_email"),
  
  // Application Settings
  settings: jsonb("settings").default(sql`'{
    "timezone": "America/Denver",
    "dateFormat": "MM/dd/yyyy",
    "distanceUnit": "miles",
    "fuelUnit": "gallons"
  }'::jsonb`),
  
  // Status & Timestamps
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  clerkIdIdx: index("organizations_clerk_id_idx").on(table.clerkId),
  slugIdx: index("organizations_slug_idx").on(table.slug),
}));

/**
 * USERS TABLE
 * Stores user data synchronized with Clerk, linked to organizations
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkId: text("clerk_id").notNull().unique(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Personal Information
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  
  // Role & Permissions (ABAC)
  role: userRoleEnum("role").notNull().default('viewer'),
  permissions: jsonb("permissions").default(sql`'[]'::jsonb`),
  
  // Status & Metadata
  isActive: boolean("is_active").notNull().default(true),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  lastLogin: timestamp("last_login"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  clerkIdIdx: index("users_clerk_id_idx").on(table.clerkId),
  orgIdIdx: index("users_organization_id_idx").on(table.organizationId),
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
}));

/**
 * VEHICLES TABLE
 * Fleet vehicle management with tenant isolation
 */
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Vehicle Classification
  type: text("type").notNull(), // 'tractor', 'trailer', 'straight_truck'
  status: vehicleStatusEnum("status").notNull().default('active'),
  
  // Vehicle Details
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  licensePlateState: text("license_plate_state"),
  unitNumber: text("unit_number").notNull(),
  
  // Operational Data
  currentOdometer: integer("current_odometer"),
  lastOdometerUpdate: timestamp("last_odometer_update"),
  fuelType: text("fuel_type"), // 'diesel', 'gas'
  
  // Maintenance & Compliance
  lastInspectionDate: date("last_inspection_date"),
  nextInspectionDue: date("next_inspection_due"),
  insuranceExpiration: date("insurance_expiration"),
  registrationExpiration: date("registration_expiration"),
  
  // Metadata
  notes: text("notes"),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  orgIdIdx: index("vehicles_organization_id_idx").on(table.organizationId),
  unitNumberIdx: index("vehicles_unit_number_idx").on(table.unitNumber),
  statusIdx: index("vehicles_status_idx").on(table.status),
  typeIdx: index("vehicles_type_idx").on(table.type),
  orgUnitUnique: uniqueIndex("vehicles_org_unit_unique").on(table.organizationId, table.unitNumber),
}));

/**
 * DRIVERS TABLE
 * Driver management with compliance tracking
 */
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id), // Link to user account if driver has login
  
  // Personal Information
  employeeId: text("employee_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  
  // License Information
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseClass: text("license_class"),
  licenseExpiration: date("license_expiration"),
  
  // Medical & Compliance
  medicalCardExpiration: date("medical_card_expiration"),
  drugTestDate: date("drug_test_date"),
  backgroundCheckDate: date("background_check_date"),
  
  // Employment
  hireDate: date("hire_date"),
  terminationDate: date("termination_date"),
  status: driverStatusEnum("status").notNull().default('active'),
  
  // Emergency Contact
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelation: text("emergency_contact_relation"),
  
  // Metadata
  notes: text("notes"),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  orgIdIdx: index("drivers_organization_id_idx").on(table.organizationId),
  userIdIdx: index("drivers_user_id_idx").on(table.userId),
  statusIdx: index("drivers_status_idx").on(table.status),
  licenseNumberIdx: index("drivers_license_number_idx").on(table.licenseNumber),
  orgEmployeeUnique: uniqueIndex("drivers_org_employee_unique").on(table.organizationId, table.employeeId),
}));

/**
 * LOADS TABLE
 * Load/shipment management with dispatch tracking
 */
export const loads = pgTable("loads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Assignment
  driverId: uuid("driver_id").references(() => drivers.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  trailerId: uuid("trailer_id").references(() => vehicles.id),
  
  // Load Details
  loadNumber: text("load_number").notNull(),
  referenceNumber: text("reference_number"),
  status: loadStatusEnum("status").notNull().default('pending'),
  
  // Customer Information
  customerName: text("customer_name"),
  customerContact: text("customer_contact"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  
  // Origin Information
  originAddress: text("origin_address").notNull(),
  originCity: text("origin_city").notNull(),
  originState: text("origin_state").notNull(),
  originZip: text("origin_zip").notNull(),
  originLat: numeric("origin_lat", { precision: 10, scale: 6 }),
  originLng: numeric("origin_lng", { precision: 10, scale: 6 }),
  
  // Destination Information
  destinationAddress: text("destination_address").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationState: text("destination_state").notNull(),
  destinationZip: text("destination_zip").notNull(),
  destinationLat: numeric("destination_lat", { precision: 10, scale: 6 }),
  destinationLng: numeric("destination_lng", { precision: 10, scale: 6 }),
  
  // Financial
  rate: numeric("rate", { precision: 10, scale: 2 }),
  currency: text("currency").default('USD'),
  
  // Scheduling
  scheduledPickupDate: timestamp("scheduled_pickup_date"),
  actualPickupDate: timestamp("actual_pickup_date"),
  scheduledDeliveryDate: timestamp("scheduled_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  
  // Cargo Information
  weight: integer("weight"),
  pieces: integer("pieces"),
  commodity: text("commodity"),
  hazmat: boolean("hazmat").default(false),
  
  // Distance & Fuel
  estimatedMiles: integer("estimated_miles"),
  actualMiles: integer("actual_miles"),
  
  // Metadata
  notes: text("notes"),
  instructions: text("instructions"),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  orgIdIdx: index("loads_organization_id_idx").on(table.organizationId),
  driverIdIdx: index("loads_driver_id_idx").on(table.driverId),
  statusIdx: index("loads_status_idx").on(table.status),
  loadNumberIdx: index("loads_load_number_idx").on(table.loadNumber),
  scheduledPickupIdx: index("loads_scheduled_pickup_idx").on(table.scheduledPickupDate),
  orgLoadUnique: uniqueIndex("loads_org_load_unique").on(table.organizationId, table.loadNumber),
}));

/**
 * COMPLIANCE_DOCUMENTS TABLE
 * Document management for compliance tracking
 */
export const complianceDocuments = pgTable("compliance_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Document Association
  driverId: uuid("driver_id").references(() => drivers.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  
  // Document Details
  type: text("type").notNull(), // 'license', 'medical', 'insurance', 'registration', etc.
  title: text("title").notNull(),
  documentNumber: text("document_number"),
  issuingAuthority: text("issuing_authority"),
  
  // File Information
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Dates
  issueDate: date("issue_date"),
  expirationDate: date("expiration_date"),
  
  // Status
  status: text("status").notNull().default('active'), // 'active', 'expired', 'pending'
  isVerified: boolean("is_verified").default(false),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  
  // Metadata
  notes: text("notes"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  orgIdIdx: index("compliance_documents_organization_id_idx").on(table.organizationId),
  driverIdIdx: index("compliance_documents_driver_id_idx").on(table.driverId),
  vehicleIdIdx: index("compliance_documents_vehicle_id_idx").on(table.vehicleId),
  typeIdx: index("compliance_documents_type_idx").on(table.type),
  statusIdx: index("compliance_documents_status_idx").on(table.status),
  expirationIdx: index("compliance_documents_expiration_idx").on(table.expirationDate),
}));

/**
 * IFTA_REPORTS TABLE
 * IFTA quarterly reporting management
 */
export const iftaReports = pgTable("ifta_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  // Report Period
  quarter: integer("quarter").notNull(), // 1, 2, 3, 4
  year: integer("year").notNull(),
  
  // Status
  status: text("status").notNull().default('draft'), // 'draft', 'submitted', 'filed'
  
  // Financial Data
  totalMiles: integer("total_miles"),
  totalGallons: numeric("total_gallons", { precision: 10, scale: 3 }),
  totalTaxOwed: numeric("total_tax_owed", { precision: 10, scale: 2 }),
  totalTaxPaid: numeric("total_tax_paid", { precision: 10, scale: 2 }),
  
  // Filing Information
  submittedAt: timestamp("submitted_at"),
  submittedBy: uuid("submitted_by").references(() => users.id),
  dueDate: date("due_date"),
  filedDate: date("filed_date"),
  
  // File Attachments
  reportFileUrl: text("report_file_url"),
  supportingDocsUrl: text("supporting_docs_url"),
  
  // Metadata
  notes: text("notes"),
  calculationData: jsonb("calculation_data").default(sql`'{}'::jsonb`),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  orgIdIdx: index("ifta_reports_organization_id_idx").on(table.organizationId),
  quarterYearIdx: index("ifta_reports_quarter_year_idx").on(table.quarter, table.year),
  statusIdx: index("ifta_reports_status_idx").on(table.status),
  dueDateIdx: index("ifta_reports_due_date_idx").on(table.dueDate),
  orgQuarterYearUnique: uniqueIndex("ifta_reports_org_quarter_year_unique").on(table.organizationId, table.quarter, table.year),
}));

// ========================================
// TABLE RELATIONS
// ========================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  vehicles: many(vehicles),
  drivers: many(drivers),
  loads: many(loads),
  complianceDocuments: many(complianceDocuments),
  iftaReports: many(iftaReports),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  driver: one(drivers, {
    fields: [users.id],
    references: [drivers.userId],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vehicles.organizationId],
    references: [organizations.id],
  }),
  loads: many(loads),
  trailerLoads: many(loads, { relationName: "trailerLoads" }),
  complianceDocuments: many(complianceDocuments),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [drivers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  loads: many(loads),
  complianceDocuments: many(complianceDocuments),
}));

export const loadsRelations = relations(loads, ({ one }) => ({
  organization: one(organizations, {
    fields: [loads.organizationId],
    references: [organizations.id],
  }),
  driver: one(drivers, {
    fields: [loads.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [loads.vehicleId],
    references: [vehicles.id],
  }),
  trailer: one(vehicles, {
    fields: [loads.trailerId],
    references: [vehicles.id],
    relationName: "trailerLoads",
  }),
}));

export const complianceDocumentsRelations = relations(complianceDocuments, ({ one }) => ({
  organization: one(organizations, {
    fields: [complianceDocuments.organizationId],
    references: [organizations.id],
  }),
  driver: one(drivers, {
    fields: [complianceDocuments.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [complianceDocuments.vehicleId],
    references: [vehicles.id],
  }),
  verifiedByUser: one(users, {
    fields: [complianceDocuments.verifiedBy],
    references: [users.id],
  }),
}));

export const iftaReportsRelations = relations(iftaReports, ({ one }) => ({
  organization: one(organizations, {
    fields: [iftaReports.organizationId],
    references: [organizations.id],
  }),
  submittedByUser: one(users, {
    fields: [iftaReports.submittedBy],
    references: [users.id],
  }),
}));
