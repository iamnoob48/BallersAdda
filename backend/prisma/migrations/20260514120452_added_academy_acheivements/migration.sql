-- CreateEnum
CREATE TYPE "ReviewerRole" AS ENUM ('PARENT', 'PLAYER', 'COACH', 'OTHER');

-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "tournamentsWon" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "AcademyReview" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "text" TEXT NOT NULL,
    "reviewerRole" "ReviewerRole" NOT NULL DEFAULT 'PARENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademyReview_academyId_idx" ON "AcademyReview"("academyId");

-- CreateIndex
CREATE INDEX "AcademyReview_academyId_rating_idx" ON "AcademyReview"("academyId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyReview_userId_academyId_key" ON "AcademyReview"("userId", "academyId");

-- AddForeignKey
ALTER TABLE "AcademyReview" ADD CONSTRAINT "AcademyReview_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyReview" ADD CONSTRAINT "AcademyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
