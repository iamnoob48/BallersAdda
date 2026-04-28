-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "noOfReviews" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "AcademyPlan" ADD COLUMN     "haveFreeTrial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "batchId" INTEGER;

-- CreateTable
CREATE TABLE "AcademyBatch" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 20,
    "ageGroup" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coachId" INTEGER,

    CONSTRAINT "AcademyBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyBatch_academyId_idx" ON "AcademyBatch"("academyId");

-- CreateIndex
CREATE INDEX "AcademyBatch_coachId_idx" ON "AcademyBatch"("coachId");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "AcademyBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyBatch" ADD CONSTRAINT "AcademyBatch_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyBatch" ADD CONSTRAINT "AcademyBatch_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;
