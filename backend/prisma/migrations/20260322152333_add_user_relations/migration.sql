/*
  Warnings:

  - The values [MONTHLY,YEARLY] on the enum `BillingCycle` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `academy_id` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `coach_id` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `user_Id` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Tournament` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `registrationFee` on the `Tournament` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Academy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[primaryPictureId]` on the table `Academy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Coach` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `PlayerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Academy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- AlterEnum
BEGIN;
CREATE TYPE "BillingCycle_new" AS ENUM ('MONTH', 'YEAR', 'SESSION');
ALTER TABLE "AcademyPlan" ALTER COLUMN "billingCycle" TYPE "BillingCycle_new" USING ("billingCycle"::text::"BillingCycle_new");
ALTER TYPE "BillingCycle" RENAME TO "BillingCycle_old";
ALTER TYPE "BillingCycle_new" RENAME TO "BillingCycle";
DROP TYPE "public"."BillingCycle_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."PlayerProfile" DROP CONSTRAINT "PlayerProfile_user_Id_fkey";

-- DropIndex
DROP INDEX "public"."Academy_academy_id_key";

-- DropIndex
DROP INDEX "public"."AcademyPicture_academyId_isPrimary_key";

-- DropIndex
DROP INDEX "public"."Coach_coach_id_key";

-- DropIndex
DROP INDEX "public"."PlayerProfile_user_Id_key";

-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "academy_id",
ADD COLUMN     "primaryPictureId" INTEGER,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "coach_id",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN "user_Id",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlayerTournament" ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "coachId" INTEGER;

-- AlterTable
ALTER TABLE "Tournament" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "registrationFee" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "Academy_userId_key" ON "Academy"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Academy_primaryPictureId_key" ON "Academy"("primaryPictureId");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userId_key" ON "Coach"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTournament" ADD CONSTRAINT "PlayerTournament_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Academy" ADD CONSTRAINT "Academy_primaryPictureId_fkey" FOREIGN KEY ("primaryPictureId") REFERENCES "AcademyPicture"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
