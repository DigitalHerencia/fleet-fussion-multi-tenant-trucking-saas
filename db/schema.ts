import { relations } from "drizzle-orm"
import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    decimal,
    date,
    json
} from "drizzle-orm/pg-core"

// Companies (tenants)
export const companies = pgTable("companies", {
    id: uuid("id").defaultRandom().primaryKey(),
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
    primaryColor: text("primary_color").default("#0f766e"),
    isActive: boolean("is_active").default(true),
    clerkOrgId: text("clerk_org_id").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

// Company users (members of a company with roles)
export const companyUsers = pgTable("company_users", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("viewer"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
    company: one(companies, {
        fields: [companyUsers.companyId],
        references: [companies.id]
    })
}))

export const companyRelations = relations(companies, ({ many }) => ({
    users: many(companyUsers),
    vehicles: many(vehicles),
    drivers: many(drivers),
    loads: many(loads),
    documents: many(documents),
    inspections: many(inspections),
    maintenanceRecords: many(maintenanceRecords),
    iftaTrips: many(iftaTrips)
}))

// Vehicles
export const vehicles = pgTable("vehicles", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // tractor, trailer, etc.
    status: text("status").notNull().default("active"),
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
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const vehicleRelations = relations(vehicles, ({ one, many }) => ({
    company: one(companies, {
        fields: [vehicles.companyId],
        references: [companies.id]
    }),
    maintenanceRecords: many(maintenanceRecords),
    inspections: many(inspections),
    iftaTrips: many(iftaTrips)
}))

// Drivers
export const drivers = pgTable("drivers", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
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
    status: text("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const driverRelations = relations(drivers, ({ one, many }) => ({
    company: one(companies, {
        fields: [drivers.companyId],
        references: [companies.id]
    }),
    loads: many(loads),
    inspections: many(inspections),
    documents: many(documents)
}))

// Loads
export const loads = pgTable("loads", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id").references(() => drivers.id),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    trailerId: uuid("trailer_id").references(() => vehicles.id),
    status: text("status").notNull().default("pending"),
    referenceNumber: text("reference_number"),
    customerName: text("customer_name"),
    customerContact: text("customer_contact"),
    customerPhone: text("customer_phone"),
    customerEmail: text("customer_email"),
    originAddress: text("origin_address").notNull(),
    originCity: text("origin_city").notNull(),
    originState: text("origin_state").notNull(),
    originZip: text("origin_zip").notNull(),
    originLat: decimal("origin_lat", { precision: 10, scale: 6 }),
    originLng: decimal("origin_lng", { precision: 10, scale: 6 }),
    destinationAddress: text("destination_address").notNull(),
    destinationCity: text("destination_city").notNull(),
    destinationState: text("destination_state").notNull(),
    destinationZip: text("destination_zip").notNull(),
    destinationLat: decimal("destination_lat", { precision: 10, scale: 6 }),
    destinationLng: decimal("destination_lng", { precision: 10, scale: 6 }),
    pickupDate: timestamp("pickup_date"),
    deliveryDate: timestamp("delivery_date"),
    actualPickupDate: timestamp("actual_pickup_date"),
    actualDeliveryDate: timestamp("actual_delivery_date"),
    commodity: text("commodity"),
    weight: decimal("weight", { precision: 10, scale: 2 }),
    rate: decimal("rate", { precision: 10, scale: 2 }),
    miles: integer("miles"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const loadRelations = relations(loads, ({ one, many }) => ({
    company: one(companies, {
        fields: [loads.companyId],
        references: [companies.id]
    }),
    driver: one(drivers, {
        fields: [loads.driverId],
        references: [drivers.id]
    }),
    vehicle: one(vehicles, {
        fields: [loads.vehicleId],
        references: [vehicles.id]
    }),
    trailer: one(vehicles, {
        fields: [loads.trailerId],
        references: [vehicles.id]
    }),
    documents: many(documents)
}))

// Documents
export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id").references(() => drivers.id),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    loadId: uuid("load_id").references(() => loads.id),
    type: text("type").notNull(), // BOL, POD, invoice, etc.
    name: text("name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const documentRelations = relations(documents, ({ one }) => ({
    company: one(companies, {
        fields: [documents.companyId],
        references: [companies.id]
    }),
    driver: one(drivers, {
        fields: [documents.driverId],
        references: [drivers.id]
    }),
    vehicle: one(vehicles, {
        fields: [documents.vehicleId],
        references: [vehicles.id]
    }),
    load: one(loads, {
        fields: [documents.loadId],
        references: [loads.id]
    })
}))

// Inspections
export const inspections = pgTable("inspections", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    driverId: uuid("driver_id").references(() => drivers.id),
    type: text("type").notNull(), // pre-trip, post-trip, DOT, etc.
    status: text("status").notNull(), // passed, failed, pending
    date: timestamp("date").notNull(),
    location: text("location"),
    notes: text("notes"),
    defects: json("defects"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const inspectionRelations = relations(inspections, ({ one }) => ({
    company: one(companies, {
        fields: [inspections.companyId],
        references: [companies.id]
    }),
    vehicle: one(vehicles, {
        fields: [inspections.vehicleId],
        references: [vehicles.id]
    }),
    driver: one(drivers, {
        fields: [inspections.driverId],
        references: [drivers.id]
    })
}))

// Maintenance Records
export const maintenanceRecords = pgTable("maintenance_records", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id")
        .notNull()
        .references(() => vehicles.id),
    type: text("type").notNull(), // preventive, repair, etc.
    status: text("status").notNull(), // scheduled, in-progress, completed
    description: text("description").notNull(),
    odometer: integer("odometer"),
    cost: decimal("cost", { precision: 10, scale: 2 }),
    vendor: text("vendor"),
    completedDate: timestamp("completed_date"),
    scheduledDate: timestamp("scheduled_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const maintenanceRecordRelations = relations(maintenanceRecords, ({ one }) => ({
    company: one(companies, {
        fields: [maintenanceRecords.companyId],
        references: [companies.id]
    }),
    vehicle: one(vehicles, {
        fields: [maintenanceRecords.vehicleId],
        references: [vehicles.id]
    })
}))

// IFTA Trips
export const iftaTrips = pgTable("ifta_trips", {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
        .notNull()
        .references(() => companies.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id")
        .notNull()
        .references(() => vehicles.id),
    driverId: uuid("driver_id").references(() => drivers.id),
    loadId: uuid("load_id").references(() => loads.id),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    startOdometer: integer("start_odometer"),
    endOdometer: integer("end_odometer"),
    totalMiles: decimal("total_miles", { precision: 10, scale: 2 }),
    jurisdictionData: json("jurisdiction_data"), // miles per state/province
    fuelPurchases: json("fuel_purchases"), // fuel purchases during trip
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
})

export const iftaTripRelations = relations(iftaTrips, ({ one }) => ({
    company: one(companies, {
        fields: [iftaTrips.companyId],
        references: [companies.id]
    }),
    vehicle: one(vehicles, {
        fields: [iftaTrips.vehicleId],
        references: [vehicles.id]
    }),
    driver: one(drivers, {
        fields: [iftaTrips.driverId],
        references: [drivers.id]
    }),
    load: one(loads, {
        fields: [iftaTrips.loadId],
        references: [loads.id]
    })
}))
