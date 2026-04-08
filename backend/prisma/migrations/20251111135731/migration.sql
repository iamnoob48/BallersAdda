/*
  Warnings:

  - You are about to drop the column `academy` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `ratings` on the `PlayerProfile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."PlayerProfile_ratings_idx";

-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN "academy",
DROP COLUMN "ratings",
ADD COLUMN     "tournamentRatings" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "trainingRatings" DOUBLE PRECISION DEFAULT 0.0;

-- CreateTable
CREATE TABLE "Academy" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "academyLogoURL" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "state" TEXT,
    "pinCode" TEXT,
    "licenseNo" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "noOfStudents" INTEGER,
    "pricePerMonth" DOUBLE PRECISION,
    "pricePerYear" DOUBLE PRECISION,
    "pricePerSession" DOUBLE PRECISION,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "establishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Academy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademySchedule" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "coach_id" INTEGER NOT NULL,
    "profilePicLogo" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "bio" TEXT,
    "coachEmail" TEXT,
    "experienceYears" INTEGER,
    "certifications" TEXT,
    "academyId" INTEGER,
    "coachLicenceNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Academy_academy_id_key" ON "Academy"("academy_id");

-- CreateIndex
CREATE UNIQUE INDEX "Academy_licenseNo_key" ON "Academy"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "Academy_contactEmail_key" ON "Academy"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Academy_contactPhone_key" ON "Academy"("contactPhone");

-- CreateIndex
CREATE INDEX "Academy_name_idx" ON "Academy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_coach_id_key" ON "Coach"("coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_coachEmail_key" ON "Coach"("coachEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_coachLicenceNo_key" ON "Coach"("coachLicenceNo");

-- CreateIndex
CREATE INDEX "Coach_academyId_idx" ON "Coach"("academyId");

-- CreateIndex
CREATE INDEX "PlayerProfile_tournamentRatings_idx" ON "PlayerProfile"("tournamentRatings");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademySchedule" ADD CONSTRAINT "AcademySchedule_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
