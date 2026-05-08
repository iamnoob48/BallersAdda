-- CreateEnum
CREATE TYPE "RankingScope" AS ENUM ('REGIONAL', 'STATE', 'NATIONAL');

-- CreateEnum
CREATE TYPE "PositionGroup" AS ENUM ('OVERALL', 'GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'ATTACKER');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "bracketPosition" INTEGER,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "nextMatchId" INTEGER,
ADD COLUMN     "round" INTEGER;

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'India',
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "PlayerRanking" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "scope" "RankingScope" NOT NULL,
    "scopeValue" TEXT,
    "positionGroup" "PositionGroup" NOT NULL,
    "rank" INTEGER NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalGoals" INTEGER NOT NULL DEFAULT 0,
    "totalAssists" INTEGER NOT NULL DEFAULT 0,
    "totalMotm" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "tournamentsPlayed" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerRanking_scope_scopeValue_positionGroup_rank_idx" ON "PlayerRanking"("scope", "scopeValue", "positionGroup", "rank");

-- CreateIndex
CREATE INDEX "PlayerRanking_playerId_idx" ON "PlayerRanking"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerRanking_playerId_scope_scopeValue_positionGroup_key" ON "PlayerRanking"("playerId", "scope", "scopeValue", "positionGroup");

-- CreateIndex
CREATE INDEX "Match_nextMatchId_idx" ON "Match"("nextMatchId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRanking" ADD CONSTRAINT "PlayerRanking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
