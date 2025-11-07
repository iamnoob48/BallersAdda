/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO');

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "badges" INTEGER DEFAULT 0,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "dominantFoot" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel" DEFAULT 'BEGINNER',
ADD COLUMN     "nationalRank" INTEGER,
ADD COLUMN     "regionalRank" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "tournamentUid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "registrationFee" DOUBLE PRECISION NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "maxTeams" INTEGER,
    "maxPlayersPerTeam" INTEGER,
    "status" "Status" NOT NULL DEFAULT 'UPCOMING',
    "organizerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTournament" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "goals" INTEGER DEFAULT 0,
    "assists" INTEGER DEFAULT 0,
    "yellowCards" INTEGER DEFAULT 0,
    "redCards" INTEGER DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coachName" TEXT,
    "logoUrl" TEXT,
    "tournamentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerProfileToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PlayerProfileToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_tournamentUid_key" ON "Tournament"("tournamentUid");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Tournament_location_idx" ON "Tournament"("location");

-- CreateIndex
CREATE INDEX "PlayerTournament_tournamentId_idx" ON "PlayerTournament"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTournament_playerId_tournamentId_key" ON "PlayerTournament"("playerId", "tournamentId");

-- CreateIndex
CREATE INDEX "Team_tournamentId_idx" ON "Team"("tournamentId");

-- CreateIndex
CREATE INDEX "_PlayerProfileToTeam_B_index" ON "_PlayerProfileToTeam"("B");

-- CreateIndex
CREATE INDEX "PlayerProfile_academyId_idx" ON "PlayerProfile"("academyId");

-- CreateIndex
CREATE INDEX "PlayerProfile_ratings_idx" ON "PlayerProfile"("ratings");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_role_idx" ON "User"("email", "role");

-- AddForeignKey
ALTER TABLE "PlayerTournament" ADD CONSTRAINT "PlayerTournament_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTournament" ADD CONSTRAINT "PlayerTournament_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerProfileToTeam" ADD CONSTRAINT "_PlayerProfileToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerProfileToTeam" ADD CONSTRAINT "_PlayerProfileToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
