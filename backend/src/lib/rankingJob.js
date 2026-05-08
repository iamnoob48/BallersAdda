// =====================================================================
// RANKING RECOMPUTATION JOB
// =====================================================================
// Runs on a schedule (default: every hour) to recompute the
// PlayerRanking table from live data.
//
// Flow:
//   1. Fetch all players with their tournament + academy stats
//   2. Run the pure ranking engine to produce ranking rows
//   3. Upsert all rows into PlayerRanking (batched)
//   4. Increment the Redis leaderboard version counter
//
// The version counter ensures read-side cache keys naturally expire
// without fragile wildcard deletion.
// =====================================================================

import prisma from "../prismaClient.js";
import redis from "../config/redisClient.js";
import { buildRankings } from "./rankingEngine.js";
import {
  LEADERBOARD_VERSION_KEY,
  RANKING_RECOMPUTE_INTERVAL_MS,
} from "../config/rankingConfig.js";

let isRunning = false;

/**
 * Fetches all players with the data the ranking engine needs.
 */
async function fetchAllPlayerData() {
  return prisma.playerProfile.findMany({
    where: {
      position: { not: null }, // can't rank without a position
    },
    select: {
      id: true,
      position: true,
      city: true,
      state: true,
      country: true,
      tournaments: {
        select: {
          goals: true,
          assists: true,
          rating: true,
        },
      },
      academyStats: {
        select: {
          officialCaps: true,
          officialGoals: true,
          officialAssists: true,
          officialMotm: true,
          officialAvgRating: true,
          practiceMatches: true,
        },
      },
    },
  });
}

/**
 * Upserts ranking rows in batches to avoid overwhelming the DB.
 * Uses Prisma's createMany with skipDuplicates + individual updates
 * for the upsert pattern since createMany doesn't support upsert.
 */
async function upsertRankings(rows) {
  // Batch size — Prisma can handle this efficiently
  const BATCH_SIZE = 100;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    // Use a transaction for each batch
    await prisma.$transaction(
      batch.map((row) =>
        prisma.playerRanking.upsert({
          where: {
            playerId_scope_scopeValue_positionGroup: {
              playerId: row.playerId,
              scope: row.scope,
              scopeValue: row.scopeValue,
              positionGroup: row.positionGroup,
            },
          },
          create: {
            playerId: row.playerId,
            scope: row.scope,
            scopeValue: row.scopeValue,
            positionGroup: row.positionGroup,
            rank: row.rank,
            compositeScore: row.compositeScore,
            totalGoals: row.totalGoals,
            totalAssists: row.totalAssists,
            totalMotm: row.totalMotm,
            avgRating: row.avgRating,
            matchesPlayed: row.matchesPlayed,
            tournamentsPlayed: row.tournamentsPlayed,
            computedAt: new Date(),
          },
          update: {
            rank: row.rank,
            compositeScore: row.compositeScore,
            totalGoals: row.totalGoals,
            totalAssists: row.totalAssists,
            totalMotm: row.totalMotm,
            avgRating: row.avgRating,
            matchesPlayed: row.matchesPlayed,
            tournamentsPlayed: row.tournamentsPlayed,
            computedAt: new Date(),
          },
        })
      )
    );
  }
}

/**
 * Bumps the Redis version counter so read-side versioned cache keys
 * naturally become stale.
 * @returns {number} the new version number
 */
async function bumpLeaderboardVersion() {
  try {
    const newVersion = await redis.incr(LEADERBOARD_VERSION_KEY);
    return newVersion;
  } catch (err) {
    console.error("[RankingJob] Failed to bump leaderboard version:", err.message);
    return null;
  }
}

/**
 * Main recomputation function. Can be called manually or by the scheduler.
 */
export async function recomputeRankings() {
  if (isRunning) {
    console.log("[RankingJob] Already running, skipping...");
    return;
  }

  isRunning = true;
  const start = Date.now();

  try {
    console.log("[RankingJob] Starting recomputation...");

    // 1. Fetch all player data
    const rawPlayers = await fetchAllPlayerData();
    console.log(`[RankingJob] Fetched ${rawPlayers.length} players`);

    if (rawPlayers.length === 0) {
      console.log("[RankingJob] No players to rank, skipping.");
      return;
    }

    // 2. Reshape for the ranking engine
    const players = rawPlayers.map((p) => ({
      id: p.id,
      position: p.position,
      city: p.city,
      state: p.state,
      country: p.country,
      tournamentStats: p.tournaments,
      academyStats: p.academyStats,
    }));

    // 3. Compute all rankings (pure function)
    const rankingRows = buildRankings(players);
    console.log(`[RankingJob] Computed ${rankingRows.length} ranking rows`);

    // 4. Upsert into DB
    await upsertRankings(rankingRows);
    console.log("[RankingJob] Upserted all ranking rows");

    // 5. Bump version counter
    const newVersion = await bumpLeaderboardVersion();
    const durationMs = Date.now() - start;
    console.log(`[RankingJob] Complete in ${durationMs}ms. Leaderboard version: v${newVersion}`);
  } catch (error) {
    console.error("[RankingJob] Recomputation failed:", error);
  } finally {
    isRunning = false;
  }
}

/**
 * Starts the recurring ranking job using setInterval.
 * Called once from server.js on boot.
 */
export function startRankingJob() {
  console.log(
    `[RankingJob] Scheduling recomputation every ${RANKING_RECOMPUTE_INTERVAL_MS / 1000 / 60} minutes`
  );

  // Run once immediately on startup (after a short delay to let DB connect)
  setTimeout(() => {
    recomputeRankings().catch((err) =>
      console.error("[RankingJob] Initial run failed:", err)
    );
  }, 5000);

  // Then run on interval
  setInterval(() => {
    recomputeRankings().catch((err) =>
      console.error("[RankingJob] Scheduled run failed:", err)
    );
  }, RANKING_RECOMPUTE_INTERVAL_MS);
}
