/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `TeamInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `TeamInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamInvite" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");
