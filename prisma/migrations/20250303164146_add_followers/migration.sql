/*
  Warnings:

  - You are about to drop the column `passportIssueDate` on the `Passport` table. All the data in the column will be lost.
  - You are about to drop the column `petName` on the `Passport` table. All the data in the column will be lost.
  - Added the required column `issuedDate` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuingCountry` to the `Passport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passportNumber` to the `Passport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Passport" DROP COLUMN "passportIssueDate",
DROP COLUMN "petName",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "issuedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "issuingCountry" TEXT NOT NULL,
ADD COLUMN     "microchipNumber" TEXT,
ADD COLUMN     "passportNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PetFollows" (
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetFollows_pkey" PRIMARY KEY ("userId","petId")
);

-- AddForeignKey
ALTER TABLE "PetFollows" ADD CONSTRAINT "PetFollows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetFollows" ADD CONSTRAINT "PetFollows_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
