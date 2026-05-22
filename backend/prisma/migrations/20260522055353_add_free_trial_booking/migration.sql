-- CreateEnum
CREATE TYPE "TrialBookingStatus" AS ENUM ('BOOKED', 'ATTENDED', 'NO_SHOW', 'CANCELLED', 'CONVERTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Academy" ADD COLUMN     "haveFreeTrial" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxTrialsPerDay" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "FreeTrialBooking" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "academyId" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "status" "TrialBookingStatus" NOT NULL DEFAULT 'BOOKED',
    "hasRebooked" BOOLEAN NOT NULL DEFAULT false,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "attendedAt" TIMESTAMP(3),
    "convertedAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreeTrialBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FreeTrialBooking_academyId_idx" ON "FreeTrialBooking"("academyId");

-- CreateIndex
CREATE INDEX "FreeTrialBooking_playerId_idx" ON "FreeTrialBooking"("playerId");

-- CreateIndex
CREATE INDEX "FreeTrialBooking_scheduledDate_idx" ON "FreeTrialBooking"("scheduledDate");

-- CreateIndex
CREATE INDEX "FreeTrialBooking_status_idx" ON "FreeTrialBooking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FreeTrialBooking_playerId_academyId_key" ON "FreeTrialBooking"("playerId", "academyId");

-- AddForeignKey
ALTER TABLE "FreeTrialBooking" ADD CONSTRAINT "FreeTrialBooking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeTrialBooking" ADD CONSTRAINT "FreeTrialBooking_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeTrialBooking" ADD CONSTRAINT "FreeTrialBooking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
