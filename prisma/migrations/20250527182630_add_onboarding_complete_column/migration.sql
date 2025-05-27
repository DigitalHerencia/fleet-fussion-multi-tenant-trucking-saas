/*
  Warnings:

  - You are about to drop the column `background_check_date` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_name` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_phone` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_relation` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `medical_card_expiration` on the `drivers` table. All the data in the column will be lost.
  - You are about to drop the column `supporting_docs_url` on the `ifta_reports` table. All the data in the column will be lost.
  - You are about to drop the column `onboarding_completed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `next_inspection_due` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the column `registration_expiration` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "drivers" DROP COLUMN "background_check_date",
DROP COLUMN "emergency_contact_name",
DROP COLUMN "emergency_contact_phone",
DROP COLUMN "emergency_contact_relation",
DROP COLUMN "medical_card_expiration",
ADD COLUMN     "background_check" DATE,
ADD COLUMN     "emergency_contact_1" TEXT,
ADD COLUMN     "emergency_contact_2" TEXT,
ADD COLUMN     "emergency_contact_3" TEXT,
ADD COLUMN     "medical_card_exp" DATE;

-- AlterTable
ALTER TABLE "ifta_reports" DROP COLUMN "supporting_docs_url",
ADD COLUMN     "supporting_docs" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "onboarding_completed",
ADD COLUMN     "onboarding_complete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "next_inspection_due",
DROP COLUMN "registration_expiration",
ADD COLUMN     "next_inspection_date" DATE,
ADD COLUMN     "registration_expiry" DATE;
