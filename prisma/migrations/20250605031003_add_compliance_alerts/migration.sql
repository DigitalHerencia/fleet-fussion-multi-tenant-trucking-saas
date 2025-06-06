-- CreateTable
CREATE TABLE "compliance_alerts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT,
    "driver_id" TEXT,
    "vehicle_id" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compliance_alerts_organization_id_idx" ON "compliance_alerts"("organization_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_user_id_idx" ON "compliance_alerts"("user_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_driver_id_idx" ON "compliance_alerts"("driver_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_vehicle_id_idx" ON "compliance_alerts"("vehicle_id");

-- CreateIndex
CREATE INDEX "compliance_alerts_type_idx" ON "compliance_alerts"("type");

-- CreateIndex
CREATE INDEX "compliance_alerts_severity_idx" ON "compliance_alerts"("severity");

-- CreateIndex
CREATE INDEX "compliance_alerts_entityType_idx" ON "compliance_alerts"("entityType");

-- CreateIndex
CREATE INDEX "compliance_alerts_entityId_idx" ON "compliance_alerts"("entityId");

-- CreateIndex
CREATE INDEX "compliance_alerts_due_date_idx" ON "compliance_alerts"("due_date");

-- CreateIndex
CREATE INDEX "compliance_alerts_acknowledged_idx" ON "compliance_alerts"("acknowledged");

-- CreateIndex
CREATE INDEX "compliance_alerts_resolved_idx" ON "compliance_alerts"("resolved");

-- AddForeignKey
ALTER TABLE "compliance_alerts" ADD CONSTRAINT "compliance_alerts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_alerts" ADD CONSTRAINT "compliance_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_alerts" ADD CONSTRAINT "compliance_alerts_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_alerts" ADD CONSTRAINT "compliance_alerts_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
