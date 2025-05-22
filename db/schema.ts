import { relations, sql } from "drizzle-orm";
import { pgTable, uuid, text, boolean, timestamp, integer, numeric, jsonb, date } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default('#0f766e'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., 'tractor', 'trailer'
  status: text("status").notNull().default('active'),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vin: text("vin"),
  licensePlate: text("license_plate"),
  state: text("state"),
  unitNumber: text("unit_number").notNull(),
  currentOdometer: integer("current_odometer"),
  lastOdometerUpdate: timestamp("last_odometer_update"),
  fuelType: text("fuel_type"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  clerkUserId: text("clerk_user_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  licenseNumber: text("license_number"),
  licenseState: text("license_state"),
  licenseExpiration: date("license_expiration"),
  medicalCardExpiration: date("medical_card_expiration"),
  hireDate: date("hire_date"),
  terminationDate: date("termination_date"),
  status: text("status").notNull().default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const loads = pgTable("loads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id").references(() => drivers.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id), // Tractor
  trailerId: uuid("trailer_id").references(() => vehicles.id), // Trailer (assuming trailers are in vehicles table with type 'trailer')
  status: text("status").notNull().default('pending'),
  referenceNumber: text("reference_number"),
  customerName: text("customer_name"),
  customerContact: text("customer_contact"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  originAddress: text("origin_address").notNull(),
  originCity: text("origin_city").notNull(),
  originState: text("origin_state").notNull(),
  originZip: text("origin_zip").notNull(),
  originLat: numeric("origin_lat", { precision: 10, scale: 6 }),
  originLng: numeric("origin_lng", { precision: 10, scale: 6 }),
  destinationAddress: text("destination_address").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationState: text("destination_state").notNull(), // Assumed field
  destinationZip: text("destination_zip").notNull(), // Assumed field
  destinationLat: numeric("destination_lat", { precision: 10, scale: 6 }), // Assumed field
  destinationLng: numeric("destination_lng", { precision: 10, scale: 6 }), // Assumed field
  rate: numeric("rate", { precision: 10, scale: 2 }), // Assumed field
  notes: text("notes"), // Assumed field
  scheduledPickupDate: timestamp("scheduled_pickup_date"),
  actualPickupDate: timestamp("actual_pickup_date"),
  scheduledDeliveryDate: timestamp("scheduled_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  createdAt: timestamp("created_at").default(sql`now()`), // Assumed field
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Inferred table from the second part of 'loads' DDL in db/seed.ts
export const inspections = pgTable("inspections", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  type: text("type").notNull(), // e.g., 'pre-trip', 'post-trip', 'roadside'
  status: text("status").notNull(), // e.g., 'passed', 'failed', 'passed_with_defects'
  date: timestamp("date").notNull(),
  location: text("location"),
  notes: text("notes"),
  defects: jsonb("defects"), // JSONB to store defect details
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., 'preventive', 'repair', 'inspection'
  status: text("status").notNull(), // e.g., 'scheduled', 'in_progress', 'completed', 'cancelled'
  description: text("description").notNull(),
  odometer: integer("odometer"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  vendor: text("vendor"),
  completedDate: timestamp("completed_date"),
  scheduledDate: timestamp("scheduled_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const iftaTrips = pgTable("ifta_trips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  driverId: uuid("driver_id").references(() => drivers.id),
  loadId: uuid("load_id").references(() => loads.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  startOdometer: integer("start_odometer"),
  endOdometer: integer("end_odometer"),
  totalMiles: numeric("total_miles", { precision: 10, scale: 2 }),
  jurisdictionData: jsonb("jurisdiction_data"), // To store miles per jurisdiction
  fuelPurchases: jsonb("fuel_purchases"), // To store fuel purchase records for the trip
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Relations

export const companiesRelations = relations(companies, ({ many }) => ({
  vehicles: many(vehicles),
  drivers: many(drivers),
  loads: many(loads),
  inspections: many(inspections),
  maintenanceRecords: many(maintenanceRecords),
  iftaTrips: many(iftaTrips),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  company: one(companies, {
    fields: [vehicles.companyId],
    references: [companies.id],
  }),
  loadsByVehicle: many(loads, { relationName: "loadsByVehicle" }),
  loadsByTrailer: many(loads, { relationName: "loadsByTrailer" }),
  inspections: many(inspections),
  maintenanceRecords: many(maintenanceRecords),
  iftaTrips: many(iftaTrips),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  company: one(companies, {
    fields: [drivers.companyId],
    references: [companies.id],
  }),
  loads: many(loads),
  inspections: many(inspections),
  iftaTrips: many(iftaTrips),
}));

export const loadsRelations = relations(loads, ({ one, many }) => ({
  company: one(companies, {
    fields: [loads.companyId],
    references: [companies.id],
  }),
  driver: one(drivers, {
    fields: [loads.driverId],
    references: [drivers.id],
  }),
  vehicle: one(vehicles, {
    fields: [loads.vehicleId],
    references: [vehicles.id],
    relationName: "loadsByVehicle",
  }),
  trailer: one(vehicles, {
    fields: [loads.trailerId],
    references: [vehicles.id],
    relationName: "loadsByTrailer",
  }),
  iftaTrips: many(iftaTrips),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  company: one(companies, {
    fields: [inspections.companyId],
    references: [companies.id],
  }),
  vehicle: one(vehicles, {
    fields: [inspections.vehicleId],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [inspections.driverId],
    references: [drivers.id],
  }),
}));

export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
  company: one(companies, {
    fields: [maintenanceRecords.companyId],
    references: [companies.id],
  }),
  vehicle: one(vehicles, {
    fields: [maintenanceRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

export const iftaTripsRelations = relations(iftaTrips, ({ one }) => ({
  company: one(companies, {
    fields: [iftaTrips.companyId],
    references: [companies.id],
  }),
  vehicle: one(vehicles, {
    fields: [iftaTrips.vehicleId],
    references: [vehicles.id],
  }),
  driver: one(drivers, {
    fields: [iftaTrips.driverId],
    references: [drivers.id],
  }),
  load: one(loads, {
    fields: [iftaTrips.loadId],
    references: [loads.id],
  }),
}));

// Export all schema components for Drizzle
export const schema = {
  companies,
  vehicles,
  drivers,
  loads,
  inspections,
  maintenanceRecords,
  iftaTrips,
  // relations
  companiesRelations,
  vehiclesRelations,
  driversRelations,
  loadsRelations,
  inspectionsRelations,
  maintenanceRecordsRelations,
  iftaTripsRelations,
};
