// =====================================================================
// RANKING & LEADERBOARD CONFIGURATION
// =====================================================================
// Single source of truth for all scoring weights, tiebreaker rules,
// and position mappings used across leaderboard queries, the ranking
// cron job, and any future analytics.
//
// Why centralise?
//   - Formulas are never scattered across queries/jobs/controllers.
//   - Changing a weight is a one-line edit, not a grep-and-pray.
//   - Future: expose these via an admin panel without touching code.
// =====================================================================

// ─── Position grouping ──────────────────────────────────────────────
// Maps every PlayerPosition enum value to a fair-comparison group.
// Used by the player leaderboard so goalkeepers aren't penalised for
// fewer goals, and attackers aren't penalised for fewer clean sheets.

export const POSITION_GROUP_MAP = {
  GOALKEEPER:            "GOALKEEPER",
  DEFENDER:              "DEFENDER",
  FULLBACK:              "DEFENDER",
  CENTREBACK:            "DEFENDER",
  MIDFIELDER:            "MIDFIELDER",
  CENTRAL_MIDFIELDER:    "MIDFIELDER",
  ATTACKING_MIDFIELDER:  "MIDFIELDER",
  DEFENSIVE_MIDFIELDER:  "MIDFIELDER",
  FORWARD:               "ATTACKER",
  STRIKER:               "ATTACKER",
  WINGER:                "ATTACKER",
};

// ─── Player leaderboard weights (platform-wide) ─────────────────────
// Position-adjusted scoring for the national/state/regional rankings.
// Each key maps to a PositionGroup enum value.
//
// The composite score for a player is:
//   Σ (stat × weight)   for each stat in the player's position group
//
// Design note: rating amplification is intentionally kept moderate
// (10–15) because ratings can be subjective. Objective stats (goals,
// assists, MOTM) carry proportional weight.

export const PLAYER_RANKING_WEIGHTS = {
  ATTACKER: {
    goals:             4,
    assists:           2,
    rating:            10,
    motm:              5,
    tournamentsPlayed: 2,
  },
  MIDFIELDER: {
    goals:             2,
    assists:           3,
    rating:            12,
    motm:              5,
    tournamentsPlayed: 2,
  },
  DEFENDER: {
    goals:             1,
    assists:           1,
    rating:            15,
    motm:              8,
    tournamentsPlayed: 2,
  },
  GOALKEEPER: {
    goals:             0,
    assists:           0,
    rating:            15,
    motm:              8,
    tournamentsPlayed: 2,
  },
};

// ─── Academy leaderboard weights ────────────────────────────────────
// Used to compute the composite score for ranking players within a
// single academy.  Weights favour official-match performance over
// practice, and reward consistent attendance.

export const ACADEMY_RANKING_WEIGHTS = {
  officialGoals:     3,
  officialAssists:   2,
  officialMotm:      5,
  officialAvgRating: 10,
  practiceGoals:     1,
  practiceAssists:   0.5,
  practiceMotm:      2,
  practiceAvgRating: 5,
  attendanceRate:    20,   // attendance % as 0–1 float, multiplied by this
};

// ─── Tournament standings tiebreakers ───────────────────────────────
// Defines the deterministic order in which ties are broken for
// round-robin / hybrid group-stage standings.
//
// Each entry has:
//   field  – the computed property name on a standings row
//   order  – "desc" (higher is better) or "asc" (lower is better)
//
// For MVP we implement the first 3.  Head-to-head, fair play, and
// random draw are defined here for documentation/future use.

export const TOURNAMENT_TIEBREAKERS = [
  { field: "points",         order: "desc" },   // 1. Most points
  { field: "goalDifference", order: "desc" },   // 2. Best goal difference
  { field: "goalsFor",       order: "desc" },   // 3. Most goals scored
  // ── Below: not implemented in MVP, but the order is locked ──
  // { field: "headToHead",  order: "desc" },   // 4. Head-to-head record
  // { field: "fairPlay",    order: "asc"  },   // 5. Fewest cards
  // { field: "randomDraw",  order: "desc" },   // 6. Coin toss / draw
];

// Match points awarded for tournament standings computation.
export const MATCH_POINTS = {
  WIN:  3,
  DRAW: 1,
  LOSS: 0,
};

// ─── Cache versioning ───────────────────────────────────────────────
// Redis key used to store the current leaderboard version counter.
// When the ranking cron job completes, this value is INCRemented.
// All leaderboard read keys embed the version so stale data expires
// naturally instead of relying on fragile wildcard deletion.

export const LEADERBOARD_VERSION_KEY = "leaderboard:version";

// ─── Cache TTLs (seconds) ──────────────────────────────────────────
// Centralised so cache durations aren't magic numbers in controllers.

export const CACHE_TTL = {
  TOURNAMENT_LEADERBOARD:        60,   // 1 min  – invalidated on match result
  TOURNAMENT_PLAYER_LEADERBOARD: 60,   // 1 min
  ACADEMY_LEADERBOARD:           120,  // 2 min  – invalidated on stat update
  PLAYER_LEADERBOARD:            900,  // 15 min – versioned key, safe
};

// ─── Recomputation interval ─────────────────────────────────────────
// How often (in ms) the player ranking cron job runs.
// Default: every hour.

export const RANKING_RECOMPUTE_INTERVAL_MS = 60 * 60 * 1000;

// ─── Helper: compute composite score ────────────────────────────────
// Pure function — takes a stats object and a weights object, returns
// the weighted sum.  Used by both the academy leaderboard query and
// the player ranking cron job so the formula lives in exactly one
// place.

export function computeCompositeScore(stats, weights) {
  let score = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = stats[key];
    if (typeof value === "number" && typeof weight === "number") {
      score += value * weight;
    }
  }
  return Math.round(score * 100) / 100; // avoid floating-point dust
}
