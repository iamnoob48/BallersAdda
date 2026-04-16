-- CreateEnum
CREATE TYPE "TournamentStyle" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'HYBRID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlayerPosition" ADD VALUE 'CENTRAL_MIDFIELDER';
ALTER TYPE "PlayerPosition" ADD VALUE 'ATTACKING_MIDFIELDER';
ALTER TYPE "PlayerPosition" ADD VALUE 'DEFENSIVE_MIDFIELDER';

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "tournamentStyle" "TournamentStyle";
