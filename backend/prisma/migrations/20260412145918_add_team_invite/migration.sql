/*
  Warnings:

  - You are about to drop the column `coachName` on the `Team` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ORGANIZER';

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "coachName",
ADD COLUMN     "academyId" INTEGER,
ADD COLUMN     "captainId" INTEGER,
ADD COLUMN     "kitColour" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "formatAndRules" TEXT;

-- CreateTable
CREATE TABLE "TeamInvite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_email_teamId_key" ON "TeamInvite"("email", "teamId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
