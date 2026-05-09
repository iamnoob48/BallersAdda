import prisma from "../prismaClient.js";
import { cacheGet, cacheDel } from "../config/cacheUtils.js";
import {
  MATCH_POINTS,
  TOURNAMENT_TIEBREAKERS,
  CACHE_TTL,
  ACADEMY_RANKING_WEIGHTS,
  LEADERBOARD_VERSION_KEY,
  computeCompositeScore,
} from "../config/rankingConfig.js";
import redis from "../config/redisClient.js";
import { createLogger } from "../config/logger.js";

const logger = createLogger("leaderboardController");

// =====================================================================
// Helpers
// =====================================================================

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const VALID_PLAYER_SORTS = ["goals", "assists", "rating", "yellowCards", "redCards"];

// ── Tiebreaker comparator ───────────────────────────────────────────
// Builds a multi-key comparator from the centralised TOURNAMENT_TIEBREAKERS
// config so standings are always deterministic.
function standingsComparator(a, b) {
  for (const { field, order } of TOURNAMENT_TIEBREAKERS) {
    const valA = a[field] ?? 0;
    const valB = b[field] ?? 0;
    if (valA !== valB) {
      return order === "desc" ? valB - valA : valA - valB;
    }
  }
  // Absolute last resort: alphabetical by team name for stability
  return (a.team?.name ?? "").localeCompare(b.team?.name ?? "");
}

// ── Compute round-robin standings from match records ────────────────
// Pure function — takes an array of completed matches and the list of
// teams in the tournament, returns sorted standings.
function computeStandings(matches, teams, groupName = null) {
  // Init every team with zeroed stats
  const map = new Map();
  for (const team of teams) {
    map.set(team.id, {
      team: { id: team.id, name: team.name, logoUrl: team.logoUrl },
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  // Accumulate stats from completed matches
  const relevantMatches = matches.filter(
    (m) => m.status === "COMPLETED" && (groupName == null || m.groupName === groupName)
  );

  for (const match of relevantMatches) {
    const home = map.get(match.homeTeamId);
    const away = map.get(match.awayTeamId);
    if (!home || !away) continue; // safety — orphaned match

    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += MATCH_POINTS.WIN;
      away.lost++;
      away.points += MATCH_POINTS.LOSS;
    } else if (match.homeScore < match.awayScore) {
      away.won++;
      away.points += MATCH_POINTS.WIN;
      home.lost++;
      home.points += MATCH_POINTS.LOSS;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += MATCH_POINTS.DRAW;
      away.points += MATCH_POINTS.DRAW;
    }
  }

  // Compute goal difference and sort
  const standings = [...map.values()].map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  standings.sort(standingsComparator);

  // Assign ranks (1-indexed)
  return standings.map((row, i) => ({ rank: i + 1, ...row }));
}

// ── Build knockout bracket tree from matches ────────────────────────
function buildBracket(matches) {
  // Only include knockout matches (no groupName) or all matches in a
  // pure-knockout tournament.
  const knockoutMatches = matches
    .filter((m) => m.groupName == null)
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0) || (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0));

  // Group by round
  const roundMap = new Map();
  for (const match of knockoutMatches) {
    const round = match.round ?? 1;
    if (!roundMap.has(round)) roundMap.set(round, []);
    roundMap.get(round).push(formatBracketMatch(match));
  }

  const totalRounds = roundMap.size;

  // Label rounds (best-effort: final, semi-final, quarter-final, etc.)
  const roundLabels = (round) => {
    const fromEnd = totalRounds - round + 1;
    if (fromEnd === 1) return "Final";
    if (fromEnd === 2) return "Semi-Finals";
    if (fromEnd === 3) return "Quarter-Finals";
    if (fromEnd === 4) return "Round of 16";
    return `Round ${round}`;
  };

  const rounds = [...roundMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, roundMatches]) => ({
      round,
      name: roundLabels(round),
      matches: roundMatches,
    }));

  return { totalRounds, rounds };
}

function formatBracketMatch(match) {
  const winner =
    match.status !== "COMPLETED"
      ? null
      : match.homeScore > match.awayScore
        ? "HOME"
        : match.homeScore < match.awayScore
          ? "AWAY"
          : "DRAW";

  return {
    id: match.id,
    round: match.round,
    bracketPosition: match.bracketPosition,
    status: match.status,
    kickoffAt: match.kickoffAt,
    homeTeam: match.homeTeam
      ? { id: match.homeTeam.id, name: match.homeTeam.name, logoUrl: match.homeTeam.logoUrl }
      : null,
    awayTeam: match.awayTeam
      ? { id: match.awayTeam.id, name: match.awayTeam.name, logoUrl: match.awayTeam.logoUrl }
      : null,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winner,
    nextMatchId: match.nextMatchId,
  };
}

// =====================================================================
//  GET /tournament/:id/leaderboard
//  Returns standings (ROUND_ROBIN), bracket (KNOCKOUT), or both (HYBRID).
// =====================================================================
export const getTournamentLeaderboard = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid tournament ID." });
    }

    const cacheKey = `tournament:leaderboard:${id}`;
    const { data: result, fromCache } = await cacheGet(
      cacheKey,
      CACHE_TTL.TOURNAMENT_LEADERBOARD,
      async () => {
        const tournament = await prisma.tournament.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            tournamentStyle: true,
            status: true,
            teams: {
              select: { id: true, name: true, logoUrl: true },
            },
            matches: {
              select: {
                id: true,
                status: true,
                homeScore: true,
                awayScore: true,
                round: true,
                groupName: true,
                bracketPosition: true,
                nextMatchId: true,
                kickoffAt: true,
                homeTeamId: true,
                awayTeamId: true,
                homeTeam: { select: { id: true, name: true, logoUrl: true } },
                awayTeam: { select: { id: true, name: true, logoUrl: true } },
              },
            },
          },
        });

        if (!tournament) return null;

        const style = tournament.tournamentStyle || "ROUND_ROBIN";
        const response = {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          tournamentStyle: style,
          status: tournament.status,
        };

        if (style === "KNOCKOUT") {
          response.bracket = buildBracket(tournament.matches);
        } else if (style === "ROUND_ROBIN") {
          response.standings = computeStandings(tournament.matches, tournament.teams);
        } else if (style === "HYBRID") {
          // Group stage: matches that have a groupName
          const groupMatches = tournament.matches.filter((m) => m.groupName != null);
          const groupNames = [...new Set(groupMatches.map((m) => m.groupName))].sort();

          const groups = {};
          for (const gn of groupNames) {
            // Only include teams that played in this group
            const teamIdsInGroup = new Set();
            for (const m of groupMatches) {
              if (m.groupName === gn) {
                if (m.homeTeamId) teamIdsInGroup.add(m.homeTeamId);
                if (m.awayTeamId) teamIdsInGroup.add(m.awayTeamId);
              }
            }
            const groupTeams = tournament.teams.filter((t) => teamIdsInGroup.has(t.id));
            groups[gn] = computeStandings(tournament.matches, groupTeams, gn);
          }

          response.groupStage = { groups };
          response.knockoutStage = buildBracket(tournament.matches);
        }

        return response;
      }
    );

    if (!result) {
      logger.warn("Tournament not found", { tournamentId: id });
      return res.status(404).json({ message: "Tournament not found." });
    }

    logger.debug("Tournament leaderboard served", { tournamentId: id, fromCache });
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Failed to fetch tournament leaderboard", { err: error, tournamentId: Number(req.params.id) });
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /tournament/:id/leaderboard/players
//  Top scorers / assisters / rated players within a tournament.
//  Query: ?sortBy=goals|assists|rating&limit=10&page=1
// =====================================================================
export const getTournamentPlayerLeaderboard = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid tournament ID." });
    }

    const sortBy = VALID_PLAYER_SORTS.includes(req.query.sortBy)
      ? req.query.sortBy
      : "goals";

    const { page, limit, skip } = parsePagination(req.query);

    const cacheKey = `tournament:leaderboard:players:${id}:${sortBy}:p${page}:l${limit}`;

    const { data: result, fromCache: playerFromCache } = await cacheGet(
      cacheKey,
      CACHE_TTL.TOURNAMENT_PLAYER_LEADERBOARD,
      async () => {
        // Verify tournament exists
        const tournament = await prisma.tournament.findUnique({
          where: { id },
          select: { id: true, name: true },
        });
        if (!tournament) return null;

        const [totalItems, playerStats] = await Promise.all([
          prisma.playerTournament.count({ where: { tournamentId: id } }),
          prisma.playerTournament.findMany({
            where: { tournamentId: id },
            orderBy: { [sortBy]: "desc" },
            skip,
            take: limit,
            select: {
              goals: true,
              assists: true,
              yellowCards: true,
              redCards: true,
              rating: true,
              player: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  position: true,
                  user: {
                    select: { profilePic: true },
                  },
                },
              },
              team: {
                select: { id: true, name: true, logoUrl: true },
              },
            },
          }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const leaderboard = playerStats.map((ps, index) => ({
          rank: skip + index + 1,
          player: {
            id: ps.player.id,
            displayName: ps.player.displayName || `${ps.player.firstName || ""} ${ps.player.lastName || ""}`.trim(),
            position: ps.player.position,
            profilePic: ps.player.user?.profilePic || null,
          },
          team: ps.team,
          stats: {
            goals: ps.goals,
            assists: ps.assists,
            yellowCards: ps.yellowCards,
            redCards: ps.redCards,
            rating: ps.rating,
          },
        }));

        return {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          sortBy,
          leaderboard,
          pagination: {
            currentPage: page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      }
    );

    if (!result) {
      logger.warn("Tournament not found for player leaderboard", { tournamentId: id });
      return res.status(404).json({ message: "Tournament not found." });
    }

    logger.debug("Tournament player leaderboard served", { tournamentId: id, sortBy, page, fromCache: playerFromCache });
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Failed to fetch tournament player leaderboard", { err: error, tournamentId: Number(req.params.id), sortBy: req.query.sortBy });
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
// Valid academy leaderboard sort keys
// =====================================================================
const VALID_ACADEMY_SORTS = [
  "composite", "officialGoals", "officialAssists", "officialMotm",
  "officialAvgRating", "practiceGoals", "attendance",
];

// =====================================================================
//  GET /leaderboard/academy/:id
//  Academy player leaderboard ranked by composite score or a single stat.
//  Query: ?sortBy=composite|officialGoals|...|attendance&page=1&limit=20
// =====================================================================
export const getAcademyLeaderboard = async (req, res) => {
  try {
    const academyId = Number(req.params.id);
    if (!Number.isInteger(academyId) || academyId <= 0) {
      return res.status(400).json({ message: "Invalid academy ID." });
    }

    const sortBy = VALID_ACADEMY_SORTS.includes(req.query.sortBy)
      ? req.query.sortBy
      : "composite";

    const { page, limit, skip } = parsePagination(req.query);
    const cacheKey = `academy:leaderboard:${academyId}:${sortBy}:p${page}:l${limit}`;

    const { data: result } = await cacheGet(
      cacheKey,
      CACHE_TTL.ACADEMY_LEADERBOARD,
      async () => {
        // Verify academy exists
        const academy = await prisma.academy.findUnique({
          where: { id: academyId },
          select: { id: true, name: true },
        });
        if (!academy) return null;

        // Fetch all player stats for this academy
        const allStats = await prisma.playerAcademyStats.findMany({
          where: { academyId },
          select: {
            officialCaps: true,
            officialGoals: true,
            officialAssists: true,
            officialMotm: true,
            officialAvgRating: true,
            practiceMatches: true,
            practiceGoals: true,
            practiceAssists: true,
            practiceMotm: true,
            practiceAvgRating: true,
            player: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                position: true,
                user: { select: { profilePic: true } },
              },
            },
          },
        });

        // Compute attendance rate per player
        // Total sessions for this academy
        const totalSessions = await prisma.academySession.count({
          where: { academyId },
        });

        let attendanceMap = new Map();
        if (totalSessions > 0) {
          // Count attended sessions per player
          const attendanceCounts = await prisma.sessionAttendance.groupBy({
            by: ["playerId"],
            where: {
              isPresent: true,
              session: { academyId },
            },
            _count: { id: true },
          });

          for (const row of attendanceCounts) {
            attendanceMap.set(row.playerId, row._count.id / totalSessions);
          }
        }

        // Build leaderboard rows with composite scores
        const rows = allStats.map((ps) => {
          const attendanceRate = attendanceMap.get(ps.player.id) ?? 0;

          const compositeScore = computeCompositeScore(
            {
              officialGoals: ps.officialGoals,
              officialAssists: ps.officialAssists,
              officialMotm: ps.officialMotm,
              officialAvgRating: ps.officialAvgRating,
              practiceGoals: ps.practiceGoals,
              practiceAssists: ps.practiceAssists,
              practiceMotm: ps.practiceMotm,
              practiceAvgRating: ps.practiceAvgRating,
              attendanceRate,
            },
            ACADEMY_RANKING_WEIGHTS
          );

          return {
            player: {
              id: ps.player.id,
              displayName:
                ps.player.displayName ||
                `${ps.player.firstName || ""} ${ps.player.lastName || ""}`.trim() ||
                "Unknown",
              position: ps.player.position,
              profilePic: ps.player.user?.profilePic || null,
            },
            stats: {
              officialCaps: ps.officialCaps,
              officialGoals: ps.officialGoals,
              officialAssists: ps.officialAssists,
              officialMotm: ps.officialMotm,
              officialAvgRating: ps.officialAvgRating,
              practiceMatches: ps.practiceMatches,
              practiceGoals: ps.practiceGoals,
              practiceAssists: ps.practiceAssists,
              practiceMotm: ps.practiceMotm,
              practiceAvgRating: ps.practiceAvgRating,
              attendanceRate: Math.round(attendanceRate * 1000) / 1000,
              compositeScore,
            },
          };
        });

        // Sort by the requested field
        if (sortBy === "composite") {
          rows.sort((a, b) => b.stats.compositeScore - a.stats.compositeScore);
        } else if (sortBy === "attendance") {
          rows.sort((a, b) => b.stats.attendanceRate - a.stats.attendanceRate);
        } else {
          rows.sort((a, b) => (b.stats[sortBy] ?? 0) - (a.stats[sortBy] ?? 0));
        }

        // Assign ranks, then paginate
        const ranked = rows.map((row, i) => ({ rank: i + 1, ...row }));
        const totalItems = ranked.length;
        const totalPages = Math.ceil(totalItems / limit);
        const paginated = ranked.slice(skip, skip + limit);

        return {
          academyId: academy.id,
          academyName: academy.name,
          sortBy,
          totalSessions,
          leaderboard: paginated,
          pagination: {
            currentPage: page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      }
    );

    if (!result) {
      return res.status(404).json({ message: "Academy not found." });
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Failed to fetch academy leaderboard", { err: error, academyId: Number(req.params.id) });
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
// Valid player leaderboard query params
// =====================================================================
const VALID_SCOPES = ["NATIONAL", "STATE", "REGIONAL"];
const VALID_POSITION_GROUPS = ["OVERALL", "GOALKEEPER", "DEFENDER", "MIDFIELDER", "ATTACKER"];

// =====================================================================
//  GET /leaderboard/players
//  Platform-wide player leaderboard from the materialized PlayerRanking
//  table. Uses versioned Redis cache keys.
//  Query: ?scope=STATE&scopeValue=Maharashtra&position=ATTACKER&page=1&limit=20
// =====================================================================
export const getPlayerLeaderboard = async (req, res) => {
  try {
    // Parse and validate scope
    const scope = VALID_SCOPES.includes(req.query.scope?.toUpperCase())
      ? req.query.scope.toUpperCase()
      : "NATIONAL";

    const scopeValue = req.query.scopeValue?.trim() || "India";

    const positionGroup = VALID_POSITION_GROUPS.includes(req.query.position?.toUpperCase())
      ? req.query.position.toUpperCase()
      : "OVERALL";

    const { page, limit, skip } = parsePagination(req.query);

    // Versioned cache key — stale keys expire naturally when version bumps
    let version = 0;
    try {
      version = (await redis.get(LEADERBOARD_VERSION_KEY)) || 0;
    } catch (_) { /* Redis down — skip caching */ }

    const cacheKey = `leaderboard:player:v${version}:${scope}:${scopeValue}:${positionGroup}:p${page}:l${limit}`;

    const { data: result } = await cacheGet(
      cacheKey,
      CACHE_TTL.PLAYER_LEADERBOARD,
      async () => {
        const where = {
          scope,
          scopeValue,
          positionGroup,
        };

        const [totalItems, rankings] = await Promise.all([
          prisma.playerRanking.count({ where }),
          prisma.playerRanking.findMany({
            where,
            orderBy: { rank: "asc" },
            skip,
            take: limit,
            select: {
              rank: true,
              compositeScore: true,
              totalGoals: true,
              totalAssists: true,
              totalMotm: true,
              avgRating: true,
              matchesPlayed: true,
              tournamentsPlayed: true,
              computedAt: true,
              player: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  position: true,
                  city: true,
                  state: true,
                  user: { select: { profilePic: true } },
                  academy: { select: { id: true, name: true } },
                },
              },
            },
          }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const leaderboard = rankings.map((r) => ({
          rank: r.rank,
          player: {
            id: r.player.id,
            displayName:
              r.player.displayName ||
              `${r.player.firstName || ""} ${r.player.lastName || ""}`.trim() ||
              "Unknown",
            position: r.player.position,
            city: r.player.city,
            state: r.player.state,
            profilePic: r.player.user?.profilePic || null,
            academy: r.player.academy
              ? { id: r.player.academy.id, name: r.player.academy.name }
              : null,
          },
          stats: {
            compositeScore: r.compositeScore,
            totalGoals: r.totalGoals,
            totalAssists: r.totalAssists,
            totalMotm: r.totalMotm,
            avgRating: r.avgRating,
            matchesPlayed: r.matchesPlayed,
            tournamentsPlayed: r.tournamentsPlayed,
          },
          computedAt: r.computedAt,
        }));

        return {
          scope,
          scopeValue,
          positionFilter: positionGroup,
          leaderboard,
          pagination: {
            currentPage: page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      }
    );

    // Fetch the requesting user's own rank (not cached — user-specific)
    let myEntry = null;
    if (req.user?.id) {
      try {
        const me = await prisma.playerProfile.findUnique({
          where: { userId: req.user.id },
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            position: true,
            city: true,
            state: true,
            user: { select: { profilePic: true } },
            academy: { select: { id: true, name: true } },
          },
        });
        if (me) {
          const myRanking = await prisma.playerRanking.findUnique({
            where: {
              playerId_scope_scopeValue_positionGroup: {
                playerId: me.id,
                scope,
                scopeValue,
                positionGroup,
              },
            },
          });
          if (myRanking) {
            myEntry = {
              rank: myRanking.rank,
              player: {
                id: me.id,
                displayName:
                  me.displayName ||
                  `${me.firstName || ""} ${me.lastName || ""}`.trim() ||
                  "Unknown",
                position: me.position,
                city: me.city,
                state: me.state,
                profilePic: me.user?.profilePic || null,
                academy: me.academy ? { id: me.academy.id, name: me.academy.name } : null,
              },
              stats: {
                compositeScore: myRanking.compositeScore,
                totalGoals: myRanking.totalGoals,
                totalAssists: myRanking.totalAssists,
                totalMotm: myRanking.totalMotm,
                avgRating: myRanking.avgRating,
                matchesPlayed: myRanking.matchesPlayed,
                tournamentsPlayed: myRanking.tournamentsPlayed,
              },
            };
          }
        }
      } catch (_) {
        // non-critical — don't fail the whole request if myEntry lookup fails
      }
    }

    return res.status(200).json({ ...result, myEntry });
  } catch (error) {
    logger.error("Failed to fetch player leaderboard", { err: error });
    return res.status(500).json({ message: "Server error" });
  }
};

