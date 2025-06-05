-- CreateEnum
CREATE TYPE "LoadPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LoadStatus" ADD VALUE 'draft';
ALTER TYPE "LoadStatus" ADD VALUE 'posted';
ALTER TYPE "LoadStatus" ADD VALUE 'booked';
ALTER TYPE "LoadStatus" ADD VALUE 'confirmed';
ALTER TYPE "LoadStatus" ADD VALUE 'dispatched';
ALTER TYPE "LoadStatus" ADD VALUE 'at_pickup';
ALTER TYPE "LoadStatus" ADD VALUE 'picked_up';
ALTER TYPE "LoadStatus" ADD VALUE 'en_route';
ALTER TYPE "LoadStatus" ADD VALUE 'at_delivery';
ALTER TYPE "LoadStatus" ADD VALUE 'pod_required';
ALTER TYPE "LoadStatus" ADD VALUE 'completed';
ALTER TYPE "LoadStatus" ADD VALUE 'invoiced';
ALTER TYPE "LoadStatus" ADD VALUE 'paid';
ALTER TYPE "LoadStatus" ADD VALUE 'problem';

-- AlterTable
ALTER TABLE "loads" ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "last_modified_by" TEXT,
ADD COLUMN     "priority" "LoadPriority" NOT NULL DEFAULT 'medium',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "load_status_events" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "status" "LoadStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" JSONB,
    "notes" TEXT,
    "automatic_update" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'dispatcher',
    "createdBy" TEXT,

    CONSTRAINT "load_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "load_status_events_load_id_idx" ON "load_status_events"("load_id");

-- AddForeignKey
ALTER TABLE "load_status_events" ADD CONSTRAINT "load_status_events_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
