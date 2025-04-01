/*
  Warnings:

  - You are about to drop the column `petImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `petName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `petType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "petImage",
DROP COLUMN "petName",
DROP COLUMN "petType";
