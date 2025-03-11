/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `issuedDate` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `issuingCountry` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `microchipNumber` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `passportNumber` on the `Passport` table. All the data in the column will be lost.
  - Added the required column `breed` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicAddress` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicCity` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicCountry` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicEmail` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicPhone` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicPostalCode` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportIssueDate` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petName` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `species` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `veterinarianName` to the `Passport` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Passport_passportNumber_key";

-- AlterTable
ALTER TABLE "Passport" DROP COLUMN "expiryDate",
DROP COLUMN "issuedDate",
DROP COLUMN "issuingCountry",
DROP COLUMN "microchipNumber",
DROP COLUMN "passportNumber",
ADD COLUMN     "breed" TEXT NOT NULL,
ADD COLUMN     "clinicAddress" TEXT NOT NULL,
ADD COLUMN     "clinicCity" TEXT NOT NULL,
ADD COLUMN     "clinicCountry" TEXT NOT NULL,
ADD COLUMN     "clinicEmail" TEXT NOT NULL,
ADD COLUMN     "clinicPhone" TEXT NOT NULL,
ADD COLUMN     "clinicPostalCode" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passportIssueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "petName" TEXT NOT NULL,
ADD COLUMN     "sex" TEXT NOT NULL,
ADD COLUMN     "species" TEXT NOT NULL,
ADD COLUMN     "tattooCode" TEXT,
ADD COLUMN     "tattooDate" TIMESTAMP(3),
ADD COLUMN     "tattooLocation" TEXT,
ADD COLUMN     "transponderCode" TEXT,
ADD COLUMN     "transponderLocation" TEXT,
ADD COLUMN     "transponderReadDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "veterinarianName" TEXT NOT NULL;
