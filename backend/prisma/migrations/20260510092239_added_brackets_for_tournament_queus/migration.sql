-- CreateEnum
CREATE TYPE "BracketStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "bracketError" TEXT,
ADD COLUMN     "bracketStatus" "BracketStatus";
