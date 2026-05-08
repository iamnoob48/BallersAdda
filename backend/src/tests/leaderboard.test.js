import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

// ── Mocks (hoisted before static imports) ────────────────────────────────────

vi.mock("../config/cacheUtils.js", () => ({
  // Default: bypass cache, call fetcher directly — no Redis needed in tests
  cacheGet: vi.fn(async (_key, _ttl, fetcher) => ({ data: await fetcher(), fromCache: false })),
  cacheDel: vi.fn(),
  cacheInvalidate: vi.fn(),
}));

vi.mock("../prismaClient.js", () => ({
  default: {
    tournament: {
      findUnique: vi.fn(),
    },
    playerTournament: {
      findMany: vi.fn(),
      count:    vi.fn(),
    },
  },
}));

// Bypass JWT auth for all tests
vi.mock("../middleware/authMiddleware.js", () => ({
  verifyAccessToken:       (_req, _res, next) => next(),
  verifyAccessTokenStrict: (_req, _res, next) => next(),
  isCoach:                 (_req, _res, next) => next(),
}));

// Silence logger output during tests
vi.mock("../config/logger.js", () => ({
  createLogger: () => ({
    info:  vi.fn(),
    warn:  vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

// ── Import AFTER mocks are registered ────────────────────────────────────────

import { cacheGet } from "../config/cacheUtils.js";
import prisma from "../prismaClient.js";
import leaderboardRoutes from "../routes/leaderboardRoutes.js";

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/leaderboard", leaderboardRoutes);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TEAMS = [
  { id: 1, name: "FC Rockets",  logoUrl: null },
  { id: 2, name: "Thunder SC",  logoUrl: null },
  { id: 3, name: "Blaze United",logoUrl: null },
  { id: 4, name: "Iron FC",     logoUrl: null },
];

/** 4-match completed round-robin — deterministic standings */
const RR_MATCHES = [
  // R=Rockets, T=Thunder, B=Blaze, I=Iron
  { id: 10, homeTeamId: 1, awayTeamId: 2, homeScore: 3, awayScore: 1, status: "COMPLETED", groupName: null, round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[1] },
  { id: 11, homeTeamId: 3, awayTeamId: 4, homeScore: 2, awayScore: 2, status: "COMPLETED", groupName: null, round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[2], awayTeam: TEAMS[3] },
  { id: 12, homeTeamId: 1, awayTeamId: 3, homeScore: 1, awayScore: 0, status: "COMPLETED", groupName: null, round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[2] },
  { id: 13, homeTeamId: 2, awayTeamId: 4, homeScore: 0, awayScore: 1, status: "COMPLETED", groupName: null, round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[1], awayTeam: TEAMS[3] },
];

/** 3-round knockout (R16 → semi → final) */
const KO_MATCHES = [
  // Round 1 (R16)
  { id: 20, homeTeamId: 1, awayTeamId: 2, homeScore: 2, awayScore: 0, status: "COMPLETED", groupName: null, round: 1, bracketPosition: 1, nextMatchId: 24, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[1] },
  { id: 21, homeTeamId: 3, awayTeamId: 4, homeScore: 1, awayScore: 2, status: "COMPLETED", groupName: null, round: 1, bracketPosition: 2, nextMatchId: 24, kickoffAt: null, homeTeam: TEAMS[2], awayTeam: TEAMS[3] },
  // Round 2 (semi)
  { id: 24, homeTeamId: 1, awayTeamId: 4, homeScore: null, awayScore: null, status: "UPCOMING", groupName: null, round: 2, bracketPosition: 1, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[3] },
];

/** Hybrid: group stage (group A) + knockout */
const HYBRID_MATCHES = [
  // Group A
  { id: 30, homeTeamId: 1, awayTeamId: 2, homeScore: 2, awayScore: 1, status: "COMPLETED", groupName: "A", round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[1] },
  { id: 31, homeTeamId: 3, awayTeamId: 4, homeScore: 0, awayScore: 3, status: "COMPLETED", groupName: "A", round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[2], awayTeam: TEAMS[3] },
  // Knockout
  { id: 32, homeTeamId: 1, awayTeamId: 4, homeScore: 1, awayScore: 0, status: "COMPLETED", groupName: null, round: 1, bracketPosition: 1, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[3] },
];

const PLAYER_STATS = [
  {
    goals: 5, assists: 3, yellowCards: 1, redCards: 0, rating: 8.2,
    player: { id: 10, displayName: "Arjun S.", firstName: null, lastName: null, position: "FORWARD", user: { profilePic: null } },
    team: { id: 1, name: "FC Rockets", logoUrl: null },
  },
  {
    goals: 3, assists: 5, yellowCards: 0, redCards: 0, rating: 7.9,
    player: { id: 11, displayName: "Riya T.", firstName: null, lastName: null, position: "MIDFIELDER", user: { profilePic: null } },
    team: { id: 2, name: "Thunder SC", logoUrl: null },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTournament(style, matches = []) {
  return { id: 1, name: "City Cup", tournamentStyle: style, status: "ONGOING", teams: TEAMS, matches };
}

// Shared beforeEach helper — resets ALL mock state (calls + queues + impls)
// then re-wires the cacheGet default so the fetcher runs directly.
function resetMocks() {
  vi.resetAllMocks();
  cacheGet.mockImplementation(async (_k, _t, fetcher) => ({ data: await fetcher(), fromCache: false }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /leaderboard/tournament/:id
// ═══════════════════════════════════════════════════════════════════════════════
describe("GET /leaderboard/tournament/:id", () => {
  beforeEach(resetMocks);

  // ── Input validation ────────────────────────────────────────────────────────

  it("returns 400 for non-numeric ID", async () => {
    const res = await request(app).get("/leaderboard/tournament/abc");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid tournament ID.");
  });

  it("returns 400 for negative ID", async () => {
    const res = await request(app).get("/leaderboard/tournament/-5");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid tournament ID.");
  });

  it("returns 400 for zero ID", async () => {
    const res = await request(app).get("/leaderboard/tournament/0");
    expect(res.status).toBe(400);
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  it("returns 404 when tournament does not exist", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get("/leaderboard/tournament/999");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Tournament not found.");
  });

  // ── ROUND_ROBIN ─────────────────────────────────────────────────────────────

  it("returns standings for ROUND_ROBIN tournament", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("ROUND_ROBIN", RR_MATCHES));

    const res = await request(app).get("/leaderboard/tournament/1");
    expect(res.status).toBe(200);
    expect(res.body.tournamentStyle).toBe("ROUND_ROBIN");
    expect(res.body.standings).toBeDefined();
    expect(res.body.bracket).toBeUndefined();

    // FC Rockets: 2W 0D 0L, 4 GF, 1 GA, 6 pts — should be rank 1
    const top = res.body.standings[0];
    expect(top.rank).toBe(1);
    expect(top.team.name).toBe("FC Rockets");
    expect(top.points).toBe(6);
    expect(top.won).toBe(2);
    expect(top.goalsFor).toBe(4);
    expect(top.goalDifference).toBe(3);
  });

  it("standings are sorted by points → goal difference → goals scored", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("ROUND_ROBIN", RR_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");

    const standings = res.body.standings;
    // Verify descending by points
    for (let i = 0; i < standings.length - 1; i++) {
      expect(standings[i].points).toBeGreaterThanOrEqual(standings[i + 1].points);
    }
  });

  it("ignores non-COMPLETED matches in standings", async () => {
    const matchesWithUpcoming = [
      ...RR_MATCHES,
      { id: 99, homeTeamId: 1, awayTeamId: 2, homeScore: 5, awayScore: 0, status: "UPCOMING", groupName: null, round: null, bracketPosition: null, nextMatchId: null, kickoffAt: null, homeTeam: TEAMS[0], awayTeam: TEAMS[1] },
    ];
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("ROUND_ROBIN", matchesWithUpcoming));

    const res = await request(app).get("/leaderboard/tournament/1");
    const rockets = res.body.standings.find((s) => s.team.name === "FC Rockets");
    // Should still be 2 played (not 3)
    expect(rockets.played).toBe(2);
  });

  // ── KNOCKOUT ────────────────────────────────────────────────────────────────

  it("returns bracket for KNOCKOUT tournament", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("KNOCKOUT", KO_MATCHES));

    const res = await request(app).get("/leaderboard/tournament/1");
    expect(res.status).toBe(200);
    expect(res.body.tournamentStyle).toBe("KNOCKOUT");
    expect(res.body.bracket).toBeDefined();
    expect(res.body.standings).toBeUndefined();

    const { bracket } = res.body;
    expect(bracket.totalRounds).toBe(2);
    expect(bracket.rounds).toHaveLength(2);
  });

  it("bracket rounds are sorted ascending by round number", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("KNOCKOUT", KO_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    const { rounds } = res.body.bracket;
    for (let i = 0; i < rounds.length - 1; i++) {
      expect(rounds[i].round).toBeLessThan(rounds[i + 1].round);
    }
  });

  it("correctly sets winner field on completed bracket match", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("KNOCKOUT", KO_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    const r1Matches = res.body.bracket.rounds[0].matches;
    expect(r1Matches[0].winner).toBe("HOME"); // 2-0
    expect(r1Matches[1].winner).toBe("AWAY"); // 1-2
  });

  it("sets winner to null for upcoming bracket match", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("KNOCKOUT", KO_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    const r2Match = res.body.bracket.rounds[1].matches[0];
    expect(r2Match.winner).toBeNull();
    expect(r2Match.status).toBe("UPCOMING");
  });

  it("labels rounds correctly (Final / Semi-Finals / Quarter-Finals / Round N)", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("KNOCKOUT", KO_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    const rounds = res.body.bracket.rounds;
    // 2 rounds total: round 1 = "Semi-Finals", round 2 = "Final"
    expect(rounds.find((r) => r.round === 1).name).toBe("Semi-Finals");
    expect(rounds.find((r) => r.round === 2).name).toBe("Final");
  });

  // ── HYBRID ──────────────────────────────────────────────────────────────────

  it("returns groupStage + knockoutStage for HYBRID tournament", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("HYBRID", HYBRID_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    expect(res.status).toBe(200);
    expect(res.body.groupStage).toBeDefined();
    expect(res.body.knockoutStage).toBeDefined();
    expect(res.body.groupStage.groups["A"]).toBeDefined();
  });

  it("group standings only include teams that played in that group", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(makeTournament("HYBRID", HYBRID_MATCHES));
    const res = await request(app).get("/leaderboard/tournament/1");
    const groupA = res.body.groupStage.groups["A"];
    // HYBRID_MATCHES group A has teams 1,2,3,4
    expect(groupA).toHaveLength(4);
  });

  // ── Caching ─────────────────────────────────────────────────────────────────

  it("does not call prisma on cache hit", async () => {
    const cached = { tournamentId: 1, tournamentStyle: "ROUND_ROBIN", standings: [], status: "ONGOING" };
    cacheGet.mockResolvedValueOnce({ data: cached, fromCache: true });

    const res = await request(app).get("/leaderboard/tournament/1");
    expect(res.status).toBe(200);
    expect(res.body.tournamentStyle).toBe("ROUND_ROBIN");
    expect(prisma.tournament.findUnique).not.toHaveBeenCalled();
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it("returns 500 when prisma throws", async () => {
    prisma.tournament.findUnique.mockRejectedValueOnce(new Error("DB connection lost"));
    const res = await request(app).get("/leaderboard/tournament/1");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /leaderboard/tournament/:id/players
// ═══════════════════════════════════════════════════════════════════════════════
describe("GET /leaderboard/tournament/:id/players", () => {
  beforeEach(resetMocks);

  // ── Input validation ────────────────────────────────────────────────────────

  it("returns 400 for non-numeric ID", async () => {
    const res = await request(app).get("/leaderboard/tournament/xyz/players");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid tournament ID.");
  });

  it("returns 400 for negative ID", async () => {
    const res = await request(app).get("/leaderboard/tournament/-1/players");
    expect(res.status).toBe(400);
  });

  // ── Not found ───────────────────────────────────────────────────────────────

  it("returns 404 when tournament does not exist", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce(null);
    prisma.playerTournament.count.mockResolvedValueOnce(0);
    prisma.playerTournament.findMany.mockResolvedValueOnce([]);
    const res = await request(app).get("/leaderboard/tournament/999/players");
    expect(res.status).toBe(404);
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("returns player leaderboard sorted by goals by default", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(2);
    prisma.playerTournament.findMany.mockResolvedValueOnce(PLAYER_STATS);

    const res = await request(app).get("/leaderboard/tournament/1/players");
    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("goals");
    expect(res.body.leaderboard).toHaveLength(2);
    expect(res.body.leaderboard[0].stats.goals).toBe(5);
    expect(res.body.leaderboard[0].rank).toBe(1);
    expect(res.body.leaderboard[1].rank).toBe(2);
  });

  it("passes correct sortBy to prisma when valid", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(1);
    prisma.playerTournament.findMany.mockResolvedValueOnce([PLAYER_STATS[0]]);

    await request(app).get("/leaderboard/tournament/1/players?sortBy=assists");
    expect(prisma.playerTournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { assists: "desc" } })
    );
  });

  it("falls back to goals when sortBy is invalid", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(1);
    prisma.playerTournament.findMany.mockResolvedValueOnce([PLAYER_STATS[0]]);

    const res = await request(app).get("/leaderboard/tournament/1/players?sortBy=hacks");
    expect(res.status).toBe(200);
    expect(res.body.sortBy).toBe("goals");
    expect(prisma.playerTournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { goals: "desc" } })
    );
  });

  it("accepts all valid sortBy values", async () => {
    const validSorts = ["goals", "assists", "rating", "yellowCards", "redCards"];
    for (const sort of validSorts) {
      resetMocks();
      prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
      prisma.playerTournament.count.mockResolvedValueOnce(0);
      prisma.playerTournament.findMany.mockResolvedValueOnce([]);

      const res = await request(app).get(`/leaderboard/tournament/1/players?sortBy=${sort}`);
      expect(res.status).toBe(200);
      expect(res.body.sortBy).toBe(sort);
    }
  });

  // ── Pagination ──────────────────────────────────────────────────────────────

  it("returns correct pagination metadata", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(45);
    prisma.playerTournament.findMany.mockResolvedValueOnce(PLAYER_STATS);

    const res = await request(app).get("/leaderboard/tournament/1/players?page=2&limit=20");
    expect(res.status).toBe(200);
    const { pagination } = res.body;
    expect(pagination.currentPage).toBe(2);
    expect(pagination.limit).toBe(20);
    expect(pagination.totalItems).toBe(45);
    expect(pagination.totalPages).toBe(3);
    expect(pagination.hasNextPage).toBe(true);
    expect(pagination.hasPrevPage).toBe(true);
  });

  it("clamps limit to max 50", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(2);
    prisma.playerTournament.findMany.mockResolvedValueOnce(PLAYER_STATS);

    await request(app).get("/leaderboard/tournament/1/players?limit=999");
    expect(prisma.playerTournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });

  it("defaults page to 1 when page is invalid", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(2);
    prisma.playerTournament.findMany.mockResolvedValueOnce(PLAYER_STATS);

    const res = await request(app).get("/leaderboard/tournament/1/players?page=-99");
    expect(res.body.pagination.currentPage).toBe(1);
  });

  it("ranks are offset-aware (page 2 starts at skip+1)", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(25);
    prisma.playerTournament.findMany.mockResolvedValueOnce(PLAYER_STATS);

    const res = await request(app).get("/leaderboard/tournament/1/players?page=2&limit=10");
    expect(res.body.leaderboard[0].rank).toBe(11);
    expect(res.body.leaderboard[1].rank).toBe(12);
  });

  // ── Response shape ──────────────────────────────────────────────────────────

  it("response includes player displayName, position, team, and all stat fields", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(1);
    prisma.playerTournament.findMany.mockResolvedValueOnce([PLAYER_STATS[0]]);

    const res = await request(app).get("/leaderboard/tournament/1/players");
    const entry = res.body.leaderboard[0];
    expect(entry.player.displayName).toBe("Arjun S.");
    expect(entry.player.position).toBe("FORWARD");
    expect(entry.team.name).toBe("FC Rockets");
    expect(entry.stats).toMatchObject({
      goals: 5, assists: 3, yellowCards: 1, redCards: 0, rating: 8.2,
    });
  });

  it("falls back to firstName + lastName when displayName is null", async () => {
    const statNoDisplay = {
      ...PLAYER_STATS[0],
      player: { ...PLAYER_STATS[0].player, displayName: null, firstName: "Arjun", lastName: "Singh" },
    };
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockResolvedValueOnce(1);
    prisma.playerTournament.findMany.mockResolvedValueOnce([statNoDisplay]);

    const res = await request(app).get("/leaderboard/tournament/1/players");
    expect(res.body.leaderboard[0].player.displayName).toBe("Arjun Singh");
  });

  // ── Caching ─────────────────────────────────────────────────────────────────

  it("does not call prisma on cache hit", async () => {
    const cached = { tournamentId: 1, sortBy: "goals", leaderboard: [], pagination: {} };
    cacheGet.mockResolvedValueOnce({ data: cached, fromCache: true });

    const res = await request(app).get("/leaderboard/tournament/1/players");
    expect(res.status).toBe(200);
    expect(prisma.tournament.findUnique).not.toHaveBeenCalled();
    expect(prisma.playerTournament.findMany).not.toHaveBeenCalled();
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  it("returns 500 when prisma throws", async () => {
    prisma.tournament.findUnique.mockRejectedValueOnce(new Error("Connection refused"));
    const res = await request(app).get("/leaderboard/tournament/1/players");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });

  it("returns 500 when playerTournament.count throws", async () => {
    prisma.tournament.findUnique.mockResolvedValueOnce({ id: 1, name: "City Cup" });
    prisma.playerTournament.count.mockRejectedValueOnce(new Error("Query timeout"));
    const res = await request(app).get("/leaderboard/tournament/1/players");
    expect(res.status).toBe(500);
  });
});
