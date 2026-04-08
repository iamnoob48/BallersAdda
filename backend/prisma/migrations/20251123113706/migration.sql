/*
  Warnings:

  - You are about to drop the column `pricePerMonth` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerSession` on the `Academy` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerYear` on the `Academy` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'SESSION');

-- AlterTable
ALTER TABLE "Academy" DROP COLUMN "pricePerMonth",
DROP COLUMN "pricePerSession",
DROP COLUMN "pricePerYear";

-- CreateTable
CREATE TABLE "AcademyPlan" (
    "id" SERIAL NOT NULL,
    "academyId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billingCycle" "BillingCycle" NOT NULL,
    "features" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AcademyPlan_slug_key" ON "AcademyPlan"("slug");

-- CreateIndex
CREATE INDEX "AcademyPlan_academyId_idx" ON "AcademyPlan"("academyId");

-- AddForeignKey
ALTER TABLE "AcademyPlan" ADD CONSTRAINT "AcademyPlan_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
