/*
  Warnings:

  - A unique constraint covering the columns `[linkToken]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "linkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Team_linkToken_key" ON "Team"("linkToken");
