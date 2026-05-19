/*
  Warnings:

  - Made the column `userId` on table `AcademyReview` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Coach` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `PaymentTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `PlayerProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `PushSubscription` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `TeamShareLink` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AcademyReview" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Coach" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PlayerProfile" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PushSubscription" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TeamShareLink" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "Verification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "Team_captainId_idx" ON "Team"("captainId");

-- CreateIndex
CREATE INDEX "TeamShareLink_createdById_idx" ON "TeamShareLink"("createdById");
