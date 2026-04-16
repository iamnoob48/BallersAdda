/*
  Warnings:

  - You are about to drop the column `noOfStudents` on the `Academy` table. All the data in the column will be lost.
  - The `status` column on the `AcademyInvite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `AcademySession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `firstName` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `badges` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `tournamentsPlayed` on the `PlayerProfile` table. All the data in the column will be lost.
  - The `gender` column on the `PlayerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `position` column on the `PlayerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dominantFoot` column on the `PlayerProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `linkToken` on the `Team` table. All the data in the column will be lost.
  - The `status` column on the `Team` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `TeamInvite` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `price` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `registrationFee` on the `Tournament` table. All the data in the column will be lost.
  - The `category` column on the `Tournament` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[academyId,dayOfWeek]` on the table `AcademySchedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `dayOfWeek` on the `AcademySchedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `kickoffAt` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Made the column `goals` on table `PlayerTournament` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assists` on table `PlayerTournament` required. This step will fail if there are existing NULL values in that column.
  - Made the column `yellowCards` on table `PlayerTournament` required. This step will fail if there are existing NULL values in that column.
  - Made the column `redCards` on table `PlayerTournament` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `PlayerTournament` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "TeamApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('TRAINING', 'MATCH', 'FITNESS', 'TACTICAL', 'RECOVERY', 'TRIAL');

-- CreateEnum
CREATE TYPE "TournamentCategory" AS ENUM ('U10', 'U12', 'U14', 'U16', 'U18', 'U21', 'OPEN', 'VETERANS', 'WOMENS', 'MIXED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD', 'STRIKER', 'WINGER', 'FULLBACK', 'CENTREBACK');

-- CreateEnum
CREATE TYPE "DominantFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- AlterEnum
ALTER TYPE "MatchType" ADD VALUE 'FRIENDLY';

-- DropIndex
DROP INDEX "public"."Team_linkToken_key";

-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "noOfStudents";

-- AlterTable
ALTER TABLE "AcademyInvite" DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "AcademySchedule" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL;

-- AlterTable
ALTER TABLE "AcademySession" DROP COLUMN "type",
ADD COLUMN     "type" "SessionType" NOT NULL DEFAULT 'TRAINING';

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "date",
ADD COLUMN     "awayScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "awayTeamId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "homeScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homeTeamId" INTEGER,
ADD COLUMN     "kickoffAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN "badges",
DROP COLUMN "displayName",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "tournamentsPlayed",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender",
DROP COLUMN "position",
ADD COLUMN     "position" "PlayerPosition",
DROP COLUMN "dominantFoot",
ADD COLUMN     "dominantFoot" "DominantFoot";

-- AlterTable
ALTER TABLE "PlayerTournament" ALTER COLUMN "goals" SET NOT NULL,
ALTER COLUMN "assists" SET NOT NULL,
ALTER COLUMN "yellowCards" SET NOT NULL,
ALTER COLUMN "redCards" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "linkToken",
DROP COLUMN "status",
ADD COLUMN     "status" "TeamApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TeamInvite" DROP COLUMN "status",
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "price",
DROP COLUMN "registrationFee",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "registrationFeeCents" INTEGER,
DROP COLUMN "category",
ADD COLUMN     "category" "TournamentCategory";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "TeamShareLink" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamShareLink_tokenHash_key" ON "TeamShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "TeamShareLink_teamId_idx" ON "TeamShareLink"("teamId");

-- CreateIndex
CREATE INDEX "TeamShareLink_createdById_idx" ON "TeamShareLink"("createdById");

-- CreateIndex
CREATE INDEX "TeamShareLink_expiresAt_idx" ON "TeamShareLink"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AcademySchedule_academyId_dayOfWeek_key" ON "AcademySchedule"("academyId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");

-- CreateIndex
CREATE INDEX "Match_academyId_idx" ON "Match"("academyId");

-- CreateIndex
CREATE INDEX "Match_kickoffAt_idx" ON "Match"("kickoffAt");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "Team_captainId_idx" ON "Team"("captainId");

-- CreateIndex
CREATE INDEX "Team_academyId_idx" ON "Team"("academyId");

-- CreateIndex
CREATE INDEX "Tournament_category_idx" ON "Tournament"("category");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "TeamShareLink" ADD CONSTRAINT "TeamShareLink_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamShareLink" ADD CONSTRAINT "TeamShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
