// =====================================================================
// RANKING ENGINE
// =====================================================================
// Pure computation module — no side effects, no DB access, no Redis.
// Takes raw player stats and produces ranked leaderboard entries.
//
// Used by:
//   - rankingJob.js  (cron recomputation)
//   - Tests          (unit-testable without DB)
// =====================================================================

import {
  POSITION_GROUP_MAP,
  PLAYER_RANKING_WEIGHTS,
  computeCompositeScore,
} from "../config/rankingConfig.js";

/**
 * Maps a PlayerPosition enum value (e.g. "STRIKER") to a PositionGroup
 * enum value (e.g. "ATTACKER"). Returns null if position is unknown.
 */
export function resolvePositionGroup(position) {
  return POSITION_GROUP_MAP[position] ?? null;
}

/**
 * Aggregates a player's raw stats from tournament + academy data into
 * the flat shape expected by the ranking weights.
 *
 * @param {Object} player - { id, position, city, state, country, tournamentStats[], academyStats[] }
 *   tournamentStats: array of { goals, assists, rating }
 *   academyStats:    array of { officialGoals, officialAssists, officialMotm, officialAvgRating }
 *
 * @returns {{ goals, assists, motm, rating, tournamentsPlayed, matchesPlayed }}
 */
export function aggregatePlayerStats(player) {
  const ts = player.tournamentStats || [];
  const as = player.academyStats || [];

  // Tournament totals
  let tGoals = 0, tAssists = 0, tRatingSum = 0, tRatingCount = 0;
  for (const t of ts) {
    tGoals += t.goals ?? 0;
    tAssists += t.assists ?? 0;
    if (t.rating > 0) {
      tRatingSum += t.rating;
      tRatingCount++;
    }
  }

  // Academy totals
  let aGoals = 0, aAssists = 0, aMotm = 0, aRatingSum = 0, aRatingCount = 0;
  for (const a of as) {
    aGoals += a.officialGoals ?? 0;
    aAssists += a.officialAssists ?? 0;
    aMotm += a.officialMotm ?? 0;
    if (a.officialAvgRating > 0) {
      aRatingSum += a.officialAvgRating;
      aRatingCount++;
    }
  }

  const totalGoals = tGoals + aGoals;
  const totalAssists = tAssists + aAssists;
  const totalMotm = aMotm; // MOTM currently only tracked in academy stats
  const totalRatingEntries = tRatingCount + aRatingCount;
  const avgRating = totalRatingEntries > 0
    ? (tRatingSum + aRatingSum) / totalRatingEntries
    : 0;

  return {
    goals: totalGoals,
    assists: totalAssists,
    motm: totalMotm,
    rating: Math.round(avgRating * 100) / 100,
    tournamentsPlayed: ts.length,
    matchesPlayed: (player.academyStats || []).reduce(
      (sum, a) => sum + (a.officialCaps ?? 0) + (a.practiceMatches ?? 0), 0
    ) + ts.length,
    // Raw totals kept for the snapshot columns
    totalGoals,
    totalAssists,
    totalMotm,
    avgRating: Math.round(avgRating * 100) / 100,
  };
}

/**
 * Takes an array of { playerId, positionGroup, compositeScore, stats, geo }
 * and produces ranked entries for every (scope × positionGroup) combination.
 *
 * Returns an array of objects ready for PlayerRanking upsert:
 *   { playerId, scope, scopeValue, positionGroup, rank, compositeScore, ...stats }
 *
 * @param {Array} players - enriched player objects from aggregatePlayerStats
 * @returns {Array} ranking rows
 */
export function computeAllRankings(players) {
  const rows = [];

  // Build scope buckets
  // Each player contributes to: NATIONAL, STATE (if known), REGIONAL (if known)
  // And within each scope: OVERALL + their specific positionGroup
  const buckets = new Map(); // key: "scope:scopeValue:positionGroup" → sorted array

  for (const p of players) {
    if (!p.positionGroup) continue; // skip players with unknown position

    const scopes = [
      { scope: "NATIONAL", scopeValue: "India" },
    ];
    if (p.state) scopes.push({ scope: "STATE", scopeValue: p.state });
    if (p.city) scopes.push({ scope: "REGIONAL", scopeValue: p.city });

    for (const { scope, scopeValue } of scopes) {
      // Add to OVERALL bucket
      const overallKey = `${scope}:${scopeValue}:OVERALL`;
      if (!buckets.has(overallKey)) buckets.set(overallKey, []);
      buckets.get(overallKey).push(p);

      // Add to position-specific bucket
      const posKey = `${scope}:${scopeValue}:${p.positionGroup}`;
      if (!buckets.has(posKey)) buckets.set(posKey, []);
      buckets.get(posKey).push(p);
    }
  }

  // Sort each bucket by compositeScore DESC and assign ranks
  for (const [bucketKey, bucketPlayers] of buckets) {
    bucketPlayers.sort((a, b) => b.compositeScore - a.compositeScore);

    const [scope, scopeValue, positionGroup] = bucketKey.split(":");

    for (let i = 0; i < bucketPlayers.length; i++) {
      const p = bucketPlayers[i];
      rows.push({
        playerId: p.playerId,
        scope,
        scopeValue,
        positionGroup,
        rank: i + 1,
        compositeScore: p.compositeScore,
        totalGoals: p.stats.totalGoals,
        totalAssists: p.stats.totalAssists,
        totalMotm: p.stats.totalMotm,
        avgRating: p.stats.avgRating,
        matchesPlayed: p.stats.matchesPlayed,
        tournamentsPlayed: p.stats.tournamentsPlayed,
      });
    }
  }

  return rows;
}

/**
 * Main entry: takes raw player data and produces all ranking rows.
 *
 * @param {Array} rawPlayers - array of player objects with stats + geo
 * @returns {Array} ranking rows ready for DB upsert
 */
export function buildRankings(rawPlayers) {
  const enriched = [];

  for (const player of rawPlayers) {
    const positionGroup = resolvePositionGroup(player.position);
    if (!positionGroup) continue; // can't rank without a position

    const stats = aggregatePlayerStats(player);
    const weights = PLAYER_RANKING_WEIGHTS[positionGroup];
    if (!weights) continue;

    const compositeScore = computeCompositeScore(stats, weights);

    enriched.push({
      playerId: player.id,
      positionGroup,
      compositeScore,
      stats,
      city: player.city || null,
      state: player.state || null,
      country: player.country || "India",
    });
  }

  return computeAllRankings(enriched);
}
