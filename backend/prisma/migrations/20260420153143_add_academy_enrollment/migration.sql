-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'FORMER', 'CANCELLED', 'FREE_TRIAL');

-- CreateTable
CREATE TABLE "AcademyEnrollment" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "academyId" INTEGER NOT NULL,
    "batchId" INTEGER,
    "planId" INTEGER,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "AcademyEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyEnrollment_playerId_idx" ON "AcademyEnrollment"("playerId");

-- CreateIndex
CREATE INDEX "AcademyEnrollment_academyId_idx" ON "AcademyEnrollment"("academyId");

-- CreateIndex
CREATE INDEX "AcademyEnrollment_batchId_idx" ON "AcademyEnrollment"("batchId");

-- CreateIndex
CREATE INDEX "AcademyEnrollment_planId_idx" ON "AcademyEnrollment"("planId");

-- AddForeignKey
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AcademyBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyEnrollment" ADD CONSTRAINT "AcademyEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AcademyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
