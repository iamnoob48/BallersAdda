-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ACADEMY_MEMBERSHIP', 'TOURNAMENT_REGISTRATION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PENDING_CASH', 'CASH_COLLECTED', 'SETTLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH');

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "platformCommissionCents" INTEGER NOT NULL,
    "payoutAmountCents" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ONLINE',
    "userId" INTEGER NOT NULL,
    "academyId" INTEGER,
    "planId" INTEGER,
    "batchId" INTEGER,
    "tournamentId" INTEGER,
    "teamId" INTEGER,
    "enrollmentId" INTEGER,
    "receipt" TEXT NOT NULL,
    "failureReason" TEXT,
    "webhookEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_razorpayOrderId_key" ON "PaymentTransaction"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_razorpayPaymentId_key" ON "PaymentTransaction"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_enrollmentId_key" ON "PaymentTransaction"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_receipt_key" ON "PaymentTransaction"("receipt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_webhookEventId_key" ON "PaymentTransaction"("webhookEventId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction"("userId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_academyId_idx" ON "PaymentTransaction"("academyId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_tournamentId_idx" ON "PaymentTransaction"("tournamentId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_type_idx" ON "PaymentTransaction"("type");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_planId_fkey" FOREIGN KEY ("planId") REFERENCES "AcademyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "AcademyEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
