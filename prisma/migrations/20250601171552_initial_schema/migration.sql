-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager', 'user', 'dispatcher', 'driver', 'compliance', 'accountant', 'viewer');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'inactive', 'trial', 'cancelled');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('active', 'inactive', 'maintenance', 'decommissioned');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('active', 'inactive', 'suspended', 'terminated');

-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('pending', 'assigned', 'in_transit', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mc_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logo_url" TEXT,
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'free',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "billing_email" TEXT,
    "settings" JSONB DEFAULT '{"fuelUnit": "gallons", "timezone": "America/Denver", "dateFormat": "MM/dd/yyyy", "distanceUnit": "miles"}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "dotNumber" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "profile_image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "permissions" JSONB DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "onboarding_steps" JSONB DEFAULT '{}',
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'active',
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "vin" TEXT,
    "license_plate" TEXT,
    "license_plate_state" TEXT,
    "unit_number" TEXT NOT NULL,
    "current_odometer" INTEGER,
    "last_odometer_update" TIMESTAMP(3),
    "fuel_type" TEXT,
    "last_inspection_date" DATE,
    "insurance_expiration" DATE,
    "notes" TEXT,
    "custom_fields" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "next_inspection_date" DATE,
    "registration_expiry" DATE,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "employee_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "license_number" TEXT,
    "license_state" TEXT,
    "license_class" TEXT,
    "license_expiration" DATE,
    "drug_test_date" DATE,
    "hire_date" DATE,
    "termination_date" DATE,
    "status" "DriverStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "custom_fields" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "background_check" DATE,
    "emergency_contact_1" TEXT,
    "emergency_contact_2" TEXT,
    "emergency_contact_3" TEXT,
    "medical_card_exp" DATE,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loads" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "vehicle_id" TEXT,
    "trailer_id" TEXT,
    "load_number" TEXT NOT NULL,
    "reference_number" TEXT,
    "status" "LoadStatus" NOT NULL DEFAULT 'pending',
    "customer_name" TEXT,
    "customer_contact" TEXT,
    "customer_phone" TEXT,
    "customer_email" TEXT,
    "origin_address" TEXT NOT NULL,
    "origin_city" TEXT NOT NULL,
    "origin_state" TEXT NOT NULL,
    "origin_zip" TEXT NOT NULL,
    "origin_lat" DECIMAL(10,6),
    "origin_lng" DECIMAL(10,6),
    "destination_address" TEXT NOT NULL,
    "destination_city" TEXT NOT NULL,
    "destination_state" TEXT NOT NULL,
    "destination_zip" TEXT NOT NULL,
    "destination_lat" DECIMAL(10,6),
    "destination_lng" DECIMAL(10,6),
    "rate" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "scheduled_pickup_date" TIMESTAMP(3),
    "actual_pickup_date" TIMESTAMP(3),
    "scheduled_delivery_date" TIMESTAMP(3),
    "actual_delivery_date" TIMESTAMP(3),
    "weight" INTEGER,
    "pieces" INTEGER,
    "commodity" TEXT,
    "hazmat" BOOLEAN DEFAULT false,
    "estimated_miles" INTEGER,
    "actual_miles" INTEGER,
    "notes" TEXT,
    "instructions" TEXT,
    "custom_fields" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "vehicle_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "document_number" TEXT,
    "issuing_authority" TEXT,
    "file_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "issue_date" DATE,
    "expiration_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_verified" BOOLEAN DEFAULT false,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "tags" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ifta_reports" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_miles" INTEGER,
    "total_gallons" DECIMAL(10,3),
    "total_tax_owed" DECIMAL(10,2),
    "total_tax_paid" DECIMAL(10,2),
    "submitted_at" TIMESTAMP(3),
    "submitted_by" TEXT,
    "due_date" DATE,
    "filed_date" DATE,
    "report_file_url" TEXT,
    "notes" TEXT,
    "calculation_data" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "supporting_docs" TEXT,

    CONSTRAINT "ifta_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "user_id" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processing_error" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ifta_trips" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "distance" INTEGER NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "fuel_used" DECIMAL(10,3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ifta_trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ifta_fuel_purchases" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "gallons" DECIMAL(10,3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "vendor" TEXT,
    "receipt_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ifta_fuel_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_clerk_id_key" ON "organizations"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_clerk_id_idx" ON "organizations"("clerk_id");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "vehicles_organization_id_idx" ON "vehicles"("organization_id");

-- CreateIndex
CREATE INDEX "vehicles_unit_number_idx" ON "vehicles"("unit_number");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_organization_id_unit_number_key" ON "vehicles"("organization_id", "unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");

-- CreateIndex
CREATE INDEX "drivers_organization_id_idx" ON "drivers"("organization_id");

-- CreateIndex
CREATE INDEX "drivers_user_id_idx" ON "drivers"("user_id");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_license_number_idx" ON "drivers"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_organization_id_employee_id_key" ON "drivers"("organization_id", "employee_id");

-- CreateIndex
CREATE INDEX "loads_organization_id_idx" ON "loads"("organization_id");

-- CreateIndex
CREATE INDEX "loads_driver_id_idx" ON "loads"("driver_id");

-- CreateIndex
CREATE INDEX "loads_vehicle_id_idx" ON "loads"("vehicle_id");

-- CreateIndex
CREATE INDEX "loads_trailer_id_idx" ON "loads"("trailer_id");

-- CreateIndex
CREATE INDEX "loads_status_idx" ON "loads"("status");

-- CreateIndex
CREATE INDEX "loads_load_number_idx" ON "loads"("load_number");

-- CreateIndex
CREATE INDEX "loads_scheduled_pickup_idx" ON "loads"("scheduled_pickup_date");

-- CreateIndex
CREATE UNIQUE INDEX "loads_organization_id_load_number_key" ON "loads"("organization_id", "load_number");

-- CreateIndex
CREATE INDEX "compliance_documents_organization_id_idx" ON "compliance_documents"("organization_id");

-- CreateIndex
CREATE INDEX "compliance_documents_driver_id_idx" ON "compliance_documents"("driver_id");

-- CreateIndex
CREATE INDEX "compliance_documents_vehicle_id_idx" ON "compliance_documents"("vehicle_id");

-- CreateIndex
CREATE INDEX "compliance_documents_verified_by_idx" ON "compliance_documents"("verified_by");

-- CreateIndex
CREATE INDEX "compliance_documents_type_idx" ON "compliance_documents"("type");

-- CreateIndex
CREATE INDEX "compliance_documents_status_idx" ON "compliance_documents"("status");

-- CreateIndex
CREATE INDEX "compliance_documents_expiration_idx" ON "compliance_documents"("expiration_date");

-- CreateIndex
CREATE INDEX "ifta_reports_organization_id_idx" ON "ifta_reports"("organization_id");

-- CreateIndex
CREATE INDEX "ifta_reports_submitted_by_idx" ON "ifta_reports"("submitted_by");

-- CreateIndex
CREATE INDEX "ifta_reports_quarter_year_idx" ON "ifta_reports"("quarter", "year");

-- CreateIndex
CREATE INDEX "ifta_reports_status_idx" ON "ifta_reports"("status");

-- CreateIndex
CREATE INDEX "ifta_reports_due_date_idx" ON "ifta_reports"("due_date");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs"("organization_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_event_id_unique" ON "webhook_events"("event_id");

-- CreateIndex
CREATE INDEX "webhook_events_event_type_idx" ON "webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "webhook_events_organization_id_idx" ON "webhook_events"("organization_id");

-- CreateIndex
CREATE INDEX "webhook_events_user_id_idx" ON "webhook_events"("user_id");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "webhook_events"("status");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "webhook_events"("created_at");

-- CreateIndex
CREATE INDEX "ifta_trips_organization_id_idx" ON "ifta_trips"("organization_id");

-- CreateIndex
CREATE INDEX "ifta_trips_vehicle_id_idx" ON "ifta_trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "ifta_trips_date_idx" ON "ifta_trips"("date");

-- CreateIndex
CREATE INDEX "ifta_fuel_purchases_organization_id_idx" ON "ifta_fuel_purchases"("organization_id");

-- CreateIndex
CREATE INDEX "ifta_fuel_purchases_vehicle_id_idx" ON "ifta_fuel_purchases"("vehicle_id");

-- CreateIndex
CREATE INDEX "ifta_fuel_purchases_date_idx" ON "ifta_fuel_purchases"("date");

-- CreateIndex
CREATE INDEX "organization_memberships_organization_id_idx" ON "organization_memberships"("organization_id");

-- CreateIndex
CREATE INDEX "organization_memberships_user_id_idx" ON "organization_memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_organization_id_user_id_key" ON "organization_memberships"("organization_id", "user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_documents" ADD CONSTRAINT "compliance_documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_reports" ADD CONSTRAINT "ifta_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_reports" ADD CONSTRAINT "ifta_reports_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_trips" ADD CONSTRAINT "ifta_trips_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_trips" ADD CONSTRAINT "ifta_trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_fuel_purchases" ADD CONSTRAINT "ifta_fuel_purchases_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ifta_fuel_purchases" ADD CONSTRAINT "ifta_fuel_purchases_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
