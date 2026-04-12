-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('OFFICIAL_TOURNAMENT', 'INTERNAL_PRACTICE');

-- CreateTable
CREATE TABLE "AcademySession" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL DEFAULT 'TRAINING',
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "AcademySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAttendance" (
    "id" SERIAL NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "SessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchType" "MatchType" NOT NULL DEFAULT 'OFFICIAL_TOURNAMENT',
    "tournamentId" INTEGER,
    "academyId" INTEGER,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAcademyStats" (
    "id" SERIAL NOT NULL,
    "officialCaps" INTEGER NOT NULL DEFAULT 0,
    "officialGoals" INTEGER NOT NULL DEFAULT 0,
    "officialAssists" INTEGER NOT NULL DEFAULT 0,
    "officialMotm" INTEGER NOT NULL DEFAULT 0,
    "officialAvgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "practiceMatches" INTEGER NOT NULL DEFAULT 0,
    "practiceGoals" INTEGER NOT NULL DEFAULT 0,
    "practiceAssists" INTEGER NOT NULL DEFAULT 0,
    "practiceMotm" INTEGER NOT NULL DEFAULT 0,
    "practiceAvgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "playerId" INTEGER NOT NULL,
    "academyId" INTEGER NOT NULL,

    CONSTRAINT "PlayerAcademyStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyInvite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COACH',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "academyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademyInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademySession_academyId_idx" ON "AcademySession"("academyId");

-- CreateIndex
CREATE INDEX "AcademySession_date_idx" ON "AcademySession"("date");

-- CreateIndex
CREATE INDEX "SessionAttendance_playerId_idx" ON "SessionAttendance"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendance_sessionId_playerId_key" ON "SessionAttendance"("sessionId", "playerId");

-- CreateIndex
CREATE INDEX "PlayerAcademyStats_playerId_idx" ON "PlayerAcademyStats"("playerId");

-- CreateIndex
CREATE INDEX "PlayerAcademyStats_academyId_idx" ON "PlayerAcademyStats"("academyId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAcademyStats_playerId_academyId_key" ON "PlayerAcademyStats"("playerId", "academyId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyInvite_email_academyId_key" ON "AcademyInvite"("email", "academyId");

-- AddForeignKey
ALTER TABLE "AcademySession" ADD CONSTRAINT "AcademySession_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademySession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAcademyStats" ADD CONSTRAINT "PlayerAcademyStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAcademyStats" ADD CONSTRAINT "PlayerAcademyStats_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyInvite" ADD CONSTRAINT "AcademyInvite_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
