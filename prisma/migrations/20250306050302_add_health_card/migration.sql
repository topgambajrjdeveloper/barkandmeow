/*
  Warnings:

  - You are about to drop the column `veterinarian` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `nextDueDate` on the `Vaccination` table. All the data in the column will be lost.
  - You are about to drop the column `veterinarian` on the `Vaccination` table. All the data in the column will be lost.
  - Added the required column `clinicAddress` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicEmail` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicName` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicPhone` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veterinarianName` to the `HealthCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vaccination` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MedicalRecord" DROP CONSTRAINT "MedicalRecord_healthCardId_fkey";

-- DropForeignKey
ALTER TABLE "Medication" DROP CONSTRAINT "Medication_healthCardId_fkey";

-- DropForeignKey
ALTER TABLE "Vaccination" DROP CONSTRAINT "Vaccination_healthCardId_fkey";

-- AlterTable
ALTER TABLE "HealthCard" ADD COLUMN     "clinicAddress" TEXT NOT NULL,
ADD COLUMN     "clinicEmail" TEXT NOT NULL,
ADD COLUMN     "clinicName" TEXT NOT NULL,
ADD COLUMN     "clinicPhone" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastCheckupDate" TIMESTAMP(3),
ADD COLUMN     "nextCheckupDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "veterinarianName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "veterinarian",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "treatment" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "veterinarianName" TEXT;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Vaccination" DROP COLUMN "nextDueDate",
DROP COLUMN "veterinarian",
ADD COLUMN     "batchNumber" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "veterinarianName" TEXT;

-- AddForeignKey
ALTER TABLE "Vaccination" ADD CONSTRAINT "Vaccination_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_healthCardId_fkey" FOREIGN KEY ("healthCardId") REFERENCES "HealthCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
