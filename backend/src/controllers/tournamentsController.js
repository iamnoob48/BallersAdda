import prisma from "../prismaClient.js";
import { cacheGet, cacheInvalidate, cacheDel } from "../config/cacheUtils.js";
import redis from "../config/redisClient.js";
import crypto from "node:crypto";
import { v4 as uuidv4 } from "uuid";

// =====================================================================
// Constants & helpers
// =====================================================================

// Plaintext token for share link; only SHA-256 hash persisted.
const generateShareLinkToken = () => {
  const plain = crypto.randomBytes(24).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(plain).digest("hex");
  return { plain, tokenHash };
};

const hashToken = (plain) =>
  crypto.createHash("sha256").update(plain).digest("hex");

// ── Shared pagination helpers ───────────────────────────────────────────
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

// Enum whitelists kept in sync with prisma/schema.prisma
const VALID_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED"];
const VALID_SORTS = ["date-asc", "date-desc", "prize-desc"];
const VALID_CATEGORIES = [
  "U10",
  "U12",
  "U14",
  "U16",
  "U18",
  "U21",
  "OPEN",
  "VETERANS",
  "WOMENS",
  "MIXED",
];

// Input sanitation limits
const TEAM_NAME_MAX = 60;
const KIT_COLOUR_MAX = 32;
const EMAIL_MAX = 254; // RFC 5321
const HEX_COLOUR_RE = /^#?[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;

// Token namespaces kept consistent between validate/redeem + invalidation.
const inviteKey = (tokenHash) => `tournament:invite:${tokenHash}`;
const teamLinkKey = (tokenHash) => `tournament:team-link:${tokenHash}`;

// Centralise list/detail cache invalidation so registration/join mutations
// don't serve stale team counts.
const invalidateTournamentCaches = async (tournamentId) => {
  await Promise.all([
    cacheInvalidate("tournament:list:*"),
    tournamentId != null ? cacheDel(`tournament:detail:${tournamentId}`) : null,
  ].filter(Boolean));
};

// Known Prisma error helper — avoids leaking stack traces while still
// giving the client an actionable message.
const isUniqueViolation = (e) => e && e.code === "P2002";
const isRecordNotFound = (e) => e && e.code === "P2025";

// =====================================================================
//  GET /tournament/all
//  Paginated tournaments with optional status/location/category filters.
// =====================================================================
export const getAllTournaments = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page, limit, skip } = parsePagination(req.query);

    // --- Dynamic WHERE clause ---
    const where = {};

    if (req.query.status) {
      const status = String(req.query.status).toUpperCase();
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      where.status = status;
    }

    if (req.query.location) {
      where.location = {
        contains: String(req.query.location),
        mode: "insensitive",
      };
    }

    // category is a Prisma enum — `contains` would throw at runtime.
    // Validate against the whitelist and use exact equality.
    if (req.query.category) {
      const category = String(req.query.category).toUpperCase();
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        });
      }
      where.category = category;
    }

    // --- Sorting ---
    const sort = req.query.sort;
    if (sort && !VALID_SORTS.includes(sort)) {
      return res.status(400).json({
        message: `Invalid sort. Must be one of: ${VALID_SORTS.join(", ")}`,
      });
    }

    let orderBy = { startDate: "asc" };
    if (sort === "date-desc") orderBy = { startDate: "desc" };
    if (sort === "prize-desc") orderBy = { priceCents: "desc" };

    // --- Cache key from query params ---
    const cacheKey = `tournament:list:${req.query.status || "all"}:${req.query.location || "all"}:${req.query.category || "all"}:${sort || "date-asc"}:p${page}:l${limit}`;

    const { data: result } = await cacheGet(cacheKey, 120, async () => {
      const [totalItems, tournaments, playerTournaments] = await Promise.all([
        prisma.tournament.count({ where }),
        prisma.tournament.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            tournamentUid: true,
            name: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            priceCents: true,
            tournamentStyle: true,
            category: true,
            registrationFeeCents: true,
            registrationDeadline: true,
            maxTeams: true,
            maxPlayersPerTeam: true,
            venueImage: true,
            currency: true,
            formatAndRules: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                players: true,
                teams: true,
              },
            },
          },
        }),
        prisma.playerTournament.findMany({
          where: {
            playerId: userId,
          },
          select: {
            tournamentId: true,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: tournaments,
        pagination: {
          currentPage: page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /tournament/:id
//  Fetch one tournament for the detail / registration page.
// =====================================================================
export const getTournamentById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    const cacheKey = `tournament:detail:${id}`;

    const { data: tournament } = await cacheGet(cacheKey, 300, async () => {
      return prisma.tournament.findUnique({
        where: { id },
        select: {
          id: true,
          tournamentUid: true,
          name: true,
          description: true,
          location: true,
          startDate: true,
          endDate: true,
          priceCents: true,
          currency: true,
          category: true,
          tournamentStyle: true,
          registrationFeeCents: true,
          registrationDeadline: true,
          maxTeams: true,
          maxPlayersPerTeam: true,
          status: true,
          formatAndRules: true,
          venueAddressLink: true,
          venueImage: true,
          createdAt: true,
          _count: {
            select: {
              players: true,
              teams: true,
            },
          },
        },
      });
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    return res.status(200).json({ tournament });
  } catch (error) {
    console.error("Error fetching tournament detail:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /tournament/verify-players
// =====================================================================
export const verifyRosterPlayers = async (req, res) => {
  try {
    const { emails } = req.body || {};
    if (!Array.isArray(emails)) {
      return res.status(400).json({ message: "Emails array is required." });
    }

    const uniqueEmails = [
      ...new Set(
        emails
          .map((e) => String(e || "").trim().toLowerCase())
          .filter((e) => e.length > 0 && e.length <= EMAIL_MAX)
      ),
    ];

    if (uniqueEmails.length === 0) {
      return res.status(200).json({ validPlayerProfiles: [] });
    }

    // Case-insensitive lookup — User.email is case-sensitive unique in Postgres
    // but users may type with mixed case. Matches registerTeam behaviour.
    const users = await prisma.user.findMany({
      where: {
        OR: uniqueEmails.map((e) => ({
          email: { equals: e, mode: "insensitive" },
        })),
      },
      select: {
        email: true,
        role: true,
        playerProfile: { select: { id: true } },
      },
    });

    const emailMap = new Map(users.map((u) => [u.email.toLowerCase(), u]));

    const failedEmails = [];
    const validPlayerProfiles = [];

    for (const email of uniqueEmails) {
      const u = emailMap.get(email);
      if (!u || u.role !== "PLAYER" || !u.playerProfile) {
        failedEmails.push(email);
      } else {
        validPlayerProfiles.push(u.playerProfile.id);
      }
    }

    if (failedEmails.length > 0) {
      return res.status(400).json({
        message: "Some emails do not belong to active Player accounts.",
        failedEmails,
      });
    }

    return res.status(200).json({ validPlayerProfiles });
  } catch (error) {
    console.error("Error verifying roster players:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /tournament/:id/registerTeam
// =====================================================================
export const registerTeam = async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id, 10);
    if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
      return res.status(400).json({ message: "Invalid tournament ID." });
    }

    const captainId = req.user.id;
    const { teamName, kitColour, emails, rosterMode } = req.body || {};
    const useShareLink = rosterMode === "link";

    // --- Input sanitation ---
    const trimmedName = typeof teamName === "string" ? teamName.trim() : "";
    if (!trimmedName) {
      return res.status(400).json({ message: "Team name is required." });
    }
    if (trimmedName.length > TEAM_NAME_MAX) {
      return res.status(400).json({
        message: `Team name must be ${TEAM_NAME_MAX} characters or fewer.`,
      });
    }

    let kitColourValue = null;
    if (kitColour != null && String(kitColour).trim() !== "") {
      const kc = String(kitColour).trim();
      if (kc.length > KIT_COLOUR_MAX) {
        return res
          .status(400)
          .json({ message: "Kit colour value is too long." });
      }
      // Accept either a hex colour or a short free-form label (e.g. "Navy").
      if (kc.startsWith("#") && !HEX_COLOUR_RE.test(kc)) {
        return res
          .status(400)
          .json({ message: "Kit colour must be a valid hex code." });
      }
      kitColourValue = kc;
    }

    if (req.user.role !== "PLAYER") {
      return res.status(403).json({
        message: "Only players can register an independent street team.",
      });
    }

    // Tournament validation (initial, optimistic check — the authoritative
    // maxTeams guard runs *inside* the transaction below to avoid a race
    // where two concurrent registrations both see teams < maxTeams).
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        status: true,
        maxTeams: true,
        registrationDeadline: true,
        _count: { select: { teams: true } },
      },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }
    if (tournament.status !== "UPCOMING") {
      return res
        .status(400)
        .json({ message: "Registration is not open for this tournament." });
    }
    if (
      tournament.registrationDeadline &&
      new Date() > tournament.registrationDeadline
    ) {
      return res
        .status(400)
        .json({ message: "Registration deadline has passed." });
    }
    if (
      tournament.maxTeams &&
      tournament._count.teams >= tournament.maxTeams
    ) {
      return res
        .status(400)
        .json({ message: "This tournament is already full." });
    }

    // Captain must have a completed PlayerProfile (Team.players is PlayerProfile[]).
    const captain = await prisma.user.findUnique({
      where: { id: captainId },
      select: { email: true, playerProfile: { select: { id: true } } },
    });
    if (!captain?.playerProfile) {
      return res.status(400).json({
        message: "Please complete your player profile before registering a team.",
      });
    }

    // Guard: captain already registered for this tournament?
    const existingEntry = await prisma.playerTournament.findUnique({
      where: {
        playerId_tournamentId: {
          playerId: captain.playerProfile.id,
          tournamentId,
        },
      },
      select: { id: true },
    });
    if (existingEntry) {
      return res.status(400).json({ message: "You are already registered for this tournament." });
    }

    // Normalize invited emails (captain auto-included via playerProfile connect below)
    const invitedEmails = Array.isArray(emails)
      ? [
        ...new Set(
          emails
            .map((e) => String(e || "").trim().toLowerCase())
            .filter((e) => e.length > 0 && e.length <= EMAIL_MAX)
        ),
      ]
      : [];
    const captainEmailLower = captain.email.toLowerCase();
    const rosterEmails = invitedEmails.filter((e) => e !== captainEmailLower);

    // Case-insensitive user lookup
    const existingUsers = rosterEmails.length
      ? await prisma.user.findMany({
        where: {
          OR: rosterEmails.map((e) => ({
            email: { equals: e, mode: "insensitive" },
          })),
        },
        select: {
          email: true,
          role: true,
          playerProfile: { select: { id: true } },
        },
      })
      : [];

    const existingByEmail = new Map(
      existingUsers.map((u) => [u.email.toLowerCase(), u])
    );

    // Captain profile always connected; then friends with completed profiles
    const connectProfiles = [{ id: captain.playerProfile.id }];
    const statRowProfileIds = [captain.playerProfile.id];
    const emailsToInvite = [];

    for (const email of rosterEmails) {
      const u = existingByEmail.get(email);
      if (u && u.role === "PLAYER" && u.playerProfile) {
        connectProfiles.push({ id: u.playerProfile.id });
        statRowProfileIds.push(u.playerProfile.id);
      } else {
        emailsToInvite.push(email);
      }
    }

    // Share link only generated in link mode; plaintext returned once, only hash stored.
    const shareLink = useShareLink ? generateShareLinkToken() : null;

    const newTeam = await prisma.$transaction(async (tx) => {
      // Authoritative capacity check inside the tx closes the TOCTOU window
      // between the optimistic check and the insert.
      if (tournament.maxTeams) {
        const currentCount = await tx.team.count({ where: { tournamentId } });
        if (currentCount >= tournament.maxTeams) {
          const err = new Error("TOURNAMENT_FULL");
          err.code = "TOURNAMENT_FULL";
          throw err;
        }
      }

      const team = await tx.team.create({
        data: {
          name: trimmedName,
          kitColour: kitColourValue,
          tournamentId,
          captainId,
          status: "PENDING",
          players: { connect: connectProfiles },
        },
      });

      if (shareLink) {
        await tx.teamShareLink.create({
          data: {
            teamId: team.id,
            tokenHash: shareLink.tokenHash,
            createdById: captainId,
          },
        });
      }

      if (!useShareLink && emailsToInvite.length > 0) {
        const invitePayload = emailsToInvite.map((email) => ({
          email,
          teamId: team.id,
          token: uuidv4(),
          status: "PENDING",
        }));
        await tx.teamInvite.createMany({
          data: invitePayload,
          skipDuplicates: true,
        });
      }

      if (statRowProfileIds.length > 0) {
        await tx.playerTournament.createMany({
          data: statRowProfileIds.map((profileId) => ({
            playerId: profileId,
            tournamentId,
            teamId: team.id,
          })),
          skipDuplicates: true,
        });
      }

      return team;
    });

    // Invalidate cached list/detail so the new _count.teams is visible immediately.
    // Fire-and-forget: Redis errors must not break a successful registration.
    invalidateTournamentCaches(tournamentId).catch((err) =>
      console.error("Cache invalidation after registerTeam failed:", err.message)
    );

    // TODO: background job — send invite emails via SendGrid/Resend

    const message = useShareLink
      ? "Team created! Share the invite link with your squad."
      : emailsToInvite.length > 0
        ? `Team created! Sent invites to ${emailsToInvite.length} missing players.`
        : "Team successfully registered and pending approval.";

    return res.status(201).json({
      message,
      team: newTeam,
      ...(shareLink && { linkToken: shareLink.plain }),
    });
  } catch (error) {
    if (error && error.code === "TOURNAMENT_FULL") {
      return res
        .status(409)
        .json({ message: "This tournament filled up before we could register your team." });
    }
    if (isUniqueViolation(error)) {
      // P2002 on PlayerTournament unique index means double-registration
      const target = error.meta?.target;
      const isPlayerTournamentViolation =
        Array.isArray(target)
          ? target.includes("playerId") && target.includes("tournamentId")
          : typeof target === "string" && target.includes("PlayerTournament");
      if (isPlayerTournamentViolation) {
        return res.status(400).json({ message: "You are already registered for this tournament." });
      }
      return res
        .status(409)
        .json({ message: "A duplicate team or invite already exists." });
    }
    console.error("Error in registerTeam:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /tournament/invite/validate?token=xxx   (public — no auth needed)
//  Looks up the invite in DB, caches {email, teamId} in Redis, and
//  returns enough team/tournament info for the Join page to display.
// =====================================================================
export const validateInviteToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required." });
    }

    // Cache by hash (not plaintext) to keep key shape consistent with
    // team-link and avoid raw tokens appearing in Redis key dumps.
    const tokenHash = hashToken(token);
    const cacheKey = inviteKey(tokenHash);

    // Serve from Redis if already cached
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.status(200).json({ invite: JSON.parse(cached) });
    }

    // Cache miss — look up in DB
    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            kitColour: true,
            captain: { select: { username: true } },
            tournament: {
              select: {
                id: true,
                name: true,
                category: true,
                startDate: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      return res
        .status(404)
        .json({ message: "Invite link not found or has expired." });
    }
    if (invite.status !== "PENDING") {
      return res.status(410).json({
        message: `This invite has already been ${invite.status.toLowerCase()}.`,
      });
    }

    const inviteData = {
      inviteId: invite.id,
      email: invite.email,
      teamId: invite.teamId,
      team: invite.team,
    };

    // Cache for 30 minutes so the redeem step can skip a DB lookup
    await redis
      .setex(cacheKey, 30 * 60, JSON.stringify(inviteData))
      .catch((err) => console.error("Redis SETEX error:", err.message));

    return res.status(200).json({ invite: inviteData });
  } catch (error) {
    console.error("Error validating invite token:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /tournament/invite/redeem   (auth required)
//  1. Reads invite data from Redis (or falls back to DB)
//  2. Verifies the logged-in user's email matches the invite email
//  3. Connects player profile → team, upserts PlayerTournament stats row
//  4. Marks invite ACCEPTED
// =====================================================================
export const redeemInviteToken = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required." });
    }

    const tokenHash = hashToken(token);
    const cacheKey = inviteKey(tokenHash);

    // 1. Resolve invite data — Redis first, then DB fallback.
    // We need teamId + tournamentId in one shot to avoid a second tx query.
    let inviteData = null;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      inviteData = JSON.parse(cached);
    }

    // Even on cache hit, the cached payload may lack tournamentId (older
    // cache shape). Fall through to DB if tournamentId is missing.
    if (!inviteData || inviteData.tournamentId == null) {
      const invite = await prisma.teamInvite.findUnique({
        where: { token },
        select: {
          id: true,
          email: true,
          teamId: true,
          status: true,
          team: { select: { tournamentId: true } },
        },
      });
      if (invite && invite.status === "PENDING") {
        inviteData = {
          inviteId: invite.id,
          email: invite.email,
          teamId: invite.teamId,
          tournamentId: invite.team.tournamentId,
        };
      } else {
        inviteData = null;
      }
    }

    if (!inviteData) {
      return res
        .status(404)
        .json({ message: "Invite not found or has already been used." });
    }

    // 2. Fetch current user + player profile in a single query.
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        playerProfile: { select: { id: true } },
      },
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Email must match what the captain originally entered
    if (
      currentUser.email.toLowerCase() !== inviteData.email.toLowerCase()
    ) {
      return res.status(403).json({
        message: `This invite was sent to ${inviteData.email}. Please log in with that account.`,
      });
    }

    // 4. Only players can join a team
    if (currentUser.role !== "PLAYER") {
      return res
        .status(403)
        .json({ message: "Only players can accept team invites." });
    }

    // 5. Player profile must exist before they can be rostered
    if (!currentUser.playerProfile) {
      return res.status(400).json({
        message: "Please complete your player profile before joining a team.",
      });
    }
    const playerProfileId = currentUser.playerProfile.id;

    // 6. Transactional join — no redundant team.findUnique; teamId +
    //    tournamentId already resolved above.
    await prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: inviteData.teamId },
        data: { players: { connect: { id: playerProfileId } } },
      });

      await tx.playerTournament.upsert({
        where: {
          playerId_tournamentId: {
            playerId: playerProfileId,
            tournamentId: inviteData.tournamentId,
          },
        },
        create: {
          playerId: playerProfileId,
          tournamentId: inviteData.tournamentId,
          teamId: inviteData.teamId,
        },
        update: { teamId: inviteData.teamId },
      });

      await tx.teamInvite.update({
        where: { token },
        data: { status: "ACCEPTED" },
      });
    });

    // 7. Evict the Redis key so the token cannot be reused
    await cacheDel(cacheKey);

    return res
      .status(200)
      .json({ message: "You've successfully joined the team!" });
  } catch (error) {
    if (isRecordNotFound(error)) {
      return res
        .status(404)
        .json({ message: "Invite or team no longer exists." });
    }
    console.error("Error redeeming invite token:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /tournament/team-link/validate?token=xxx   (public — no auth needed)
//  Generic shareable link: validates the linkToken on the Team itself.
//  No email matching — anyone can view the team details before joining.
// =====================================================================
export const validateTeamLink = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required." });
    }

    const tokenHash = hashToken(token);
    const cacheKey = teamLinkKey(tokenHash);

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      return res.status(200).json({ team: JSON.parse(cached) });
    }

    const shareLink = await prisma.teamShareLink.findUnique({
      where: { tokenHash },
      select: {
        revokedAt: true,
        expiresAt: true,
        maxUses: true,
        usedCount: true,
        team: {
          select: {
            id: true,
            name: true,
            kitColour: true,
            status: true,
            captain: { select: { username: true } },
            tournament: {
              select: {
                id: true,
                name: true,
                category: true,
                startDate: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!shareLink) {
      return res
        .status(404)
        .json({ message: "Invite link not found or is invalid." });
    }
    if (shareLink.revokedAt) {
      return res
        .status(410)
        .json({ message: "This invite link has been revoked." });
    }
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return res
        .status(410)
        .json({ message: "This invite link has expired." });
    }
    if (
      shareLink.maxUses !== null &&
      shareLink.usedCount >= shareLink.maxUses
    ) {
      return res
        .status(410)
        .json({ message: "This invite link has reached its usage limit." });
    }
    if (shareLink.team.status === "REJECTED") {
      return res
        .status(410)
        .json({ message: "This team's registration was rejected." });
    }

    // Cache only 60s: team.status may change (APPROVED/REJECTED) and stale
    // reads could surface a rejected team. Redeem path re-checks anyway.
    await redis
      .setex(cacheKey, 60, JSON.stringify(shareLink.team))
      .catch((err) => console.error("Redis SETEX error:", err.message));

    return res.status(200).json({ team: shareLink.team });
  } catch (error) {
    console.error("Error validating team link:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /tournament/team-link/redeem   (auth required)
//  Generic link join — no email matching. Any PLAYER with a completed
//  profile can join, as long as they aren't already on this team.
// =====================================================================
export const redeemTeamLink = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required." });
    }

    const tokenHash = hashToken(token);

    const shareLink = await prisma.teamShareLink.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        revokedAt: true,
        expiresAt: true,
        maxUses: true,
        usedCount: true,
        team: {
          select: {
            id: true,
            status: true,
            tournamentId: true,
            players: { select: { userId: true } },
          },
        },
      },
    });

    if (!shareLink) {
      return res
        .status(404)
        .json({ message: "Invite link not found or is invalid." });
    }
    if (shareLink.revokedAt) {
      return res
        .status(410)
        .json({ message: "This invite link has been revoked." });
    }
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return res
        .status(410)
        .json({ message: "This invite link has expired." });
    }
    if (
      shareLink.maxUses !== null &&
      shareLink.usedCount >= shareLink.maxUses
    ) {
      return res
        .status(410)
        .json({ message: "This invite link has reached its usage limit." });
    }

    const team = shareLink.team;
    if (team.status === "REJECTED") {
      return res
        .status(410)
        .json({ message: "This team's registration was rejected." });
    }

    if (req.user.role !== "PLAYER") {
      return res
        .status(403)
        .json({ message: "Only players can join a team." });
    }

    if (team.players.some((p) => p.userId === req.user.id)) {
      return res
        .status(409)
        .json({ message: "You are already on this team." });
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });
    if (!playerProfile) {
      return res.status(400).json({
        message: "Please complete your player profile before joining a team.",
      });
    }

    await prisma.$transaction(async (tx) => {
      // Atomic maxUses guard: only bump if still under the limit. Prevents a
      // race where two redeems both pass the pre-check and exceed maxUses.
      const bump = await tx.teamShareLink.updateMany({
        where: {
          id: shareLink.id,
          revokedAt: null,
          OR: [
            { maxUses: null },
            ...(shareLink.maxUses != null ? [{ usedCount: { lt: shareLink.maxUses } }] : []),
          ],
        },
        data: {
          usedCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      if (bump.count === 0) {
        const err = new Error("LINK_EXHAUSTED");
        err.code = "LINK_EXHAUSTED";
        throw err;
      }

      await tx.team.update({
        where: { id: team.id },
        data: { players: { connect: { id: playerProfile.id } } },
      });

      await tx.playerTournament.upsert({
        where: {
          playerId_tournamentId: {
            playerId: playerProfile.id,
            tournamentId: team.tournamentId,
          },
        },
        create: {
          playerId: playerProfile.id,
          tournamentId: team.tournamentId,
          teamId: team.id,
        },
        update: { teamId: team.id },
      });
    });

    await cacheDel(teamLinkKey(tokenHash));

    return res
      .status(200)
      .json({ message: "You've successfully joined the team!" });
  } catch (error) {
    if (error && error.code === "LINK_EXHAUSTED") {
      return res
        .status(410)
        .json({ message: "This invite link has reached its usage limit." });
    }
    if (isRecordNotFound(error)) {
      return res.status(404).json({ message: "Team no longer exists." });
    }
    console.error("Error redeeming team link:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
