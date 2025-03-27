/*
  Warnings:

  - You are about to drop the `Donation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumSince" TIMESTAMP(3),
ADD COLUMN     "premiumUntil" TIMESTAMP(3);

-- DropTable
DROP TABLE "Donation";

-- CreateTable
CREATE TABLE "PatreonMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patreonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tierName" TEXT,
    "amountCents" INTEGER NOT NULL,
    "lastChargeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatreonMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationIntent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DonationIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatreonMembership_userId_key" ON "PatreonMembership"("userId");

-- CreateIndex
CREATE INDEX "PatreonMembership_userId_idx" ON "PatreonMembership"("userId");

-- CreateIndex
CREATE INDEX "PatreonMembership_status_idx" ON "PatreonMembership"("status");

-- CreateIndex
CREATE INDEX "DonationIntent_userId_idx" ON "DonationIntent"("userId");

-- CreateIndex
CREATE INDEX "DonationIntent_status_idx" ON "DonationIntent"("status");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE INDEX "UserBadge_badgeId_idx" ON "UserBadge"("badgeId");

-- AddForeignKey
ALTER TABLE "PatreonMembership" ADD CONSTRAINT "PatreonMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationIntent" ADD CONSTRAINT "DonationIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
