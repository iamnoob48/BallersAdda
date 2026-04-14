import prisma from "../prismaClient.js";
import { cacheGet } from "../config/cacheUtils.js";
import redis from "../config/redisClient.js";

// ── Shared pagination helpers ───────────────────────────────────────────
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const VALID_STATUSES = ["UPCOMING", "ONGOING", "COMPLETED"];
const VALID_SORTS = ["date-asc", "date-desc", "prize-desc"];

/**
 * GET /tournament/all
 * Fetch paginated tournaments with optional status/location/category filters.
 *
 * Query params:
 *   page     (int, default 1)
 *   limit    (int, default 10, max 50)
 *   status   (string) — UPCOMING | ONGOING | COMPLETED
 *   location (string) — partial match, case-insensitive
 *   category (string) — partial match, case-insensitive
 *   sort     (string) — date-asc | date-desc | prize-desc (default: date-asc)
 */
export const getAllTournaments = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    // --- Dynamic WHERE clause ---
    const where = {};

    if (req.query.status) {
      const status = req.query.status.toUpperCase();
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      where.status = status;
    }

    if (req.query.location) {
      where.location = {
        contains: req.query.location,
        mode: "insensitive",
      };
    }

    if (req.query.category) {
      where.category = {
        contains: req.query.category,
        mode: "insensitive",
      };
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
    if (sort === "prize-desc") orderBy = { price: "desc" };

    // --- Cache key from query params ---
    const cacheKey = `tournament:list:${req.query.status || "all"}:${req.query.location || "all"}:${req.query.category || "all"}:${sort || "date-asc"}:p${page}:l${limit}`;

    const { data: result } = await cacheGet(cacheKey, 120, async () => {
      const [totalItems, tournaments] = await Promise.all([
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
            price: true,
            category: true,
            registrationFee: true,
            registrationDeadline: true,
            maxTeams: true,
            maxPlayersPerTeam: true,
            venueImage: true,
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

/**
 * GET /tournament/:id
 * Fetch one tournament for the detail / registration page.
 */
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
          price: true,
          category: true,
          registrationFee: true,
          registrationDeadline: true,
          maxTeams: true,
          maxPlayersPerTeam: true,
          status: true,
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
//  POST /tournaments/verify-players
// =====================================================================
export const verifyRosterPlayers = async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ message: "Emails array is required." });
    }

    const uniqueEmails = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.length > 0))];

    // Look up all users with these emails
    const users = await prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      include: { playerProfile: { select: { id: true } } }
    });

    const emailMap = {};
    users.forEach(u => {
      emailMap[u.email.toLowerCase()] = u;
    });

    const failedEmails = [];
    const validPlayerProfiles = [];

    for (const email of uniqueEmails) {
      const u = emailMap[email];
      if (!u || u.role !== 'PLAYER' || !u.playerProfile) {
        failedEmails.push(email);
      } else {
        validPlayerProfiles.push(u.playerProfile.id);
      }
    }

    if (failedEmails.length > 0) {
      return res.status(400).json({
        message: "Some emails do not belong to active Player accounts.",
        failedEmails
      });
    }

    return res.status(200).json({ validPlayerProfiles });
  } catch (error) {
    console.error("Error verifying roster players:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /tournaments/:id/registerTeam
// =====================================================================
import { v4 as uuidv4 } from 'uuid'; // Standard library for generating tokens

export const registerTeam = async (req, res) => {
  try {
    const tournamentId = parseInt(req.params.id, 10);
    const captainId = req.user.id;
    const { teamName, kitColour, emails } = req.body || {};


    if (!teamName || !emails || emails.length === 0) {
      return res.status(400).json({ message: "Team name and valid emails are required." });
    }

    // ── Validation ──
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { status: true, maxTeams: true, _count: { select: { teams: true } } },
    });

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    if (tournament.status !== 'UPCOMING') {
      return res.status(400).json({ message: "Registration is not open for this tournament." });
    }

    if (tournament._count.teams >= tournament.maxTeams) {
      return res.status(400).json({ message: "This tournament is already full." });
    }
    //Check thier role when 


    if (req.user.role !== 'PLAYER') {
      return res.status(403).json({ message: "Only players can register an independent street team." });
    }

    // 1. Clean the emails and always include the Captain in the roster!
    const rawEmails = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.length > 0))];
    const uniqueEmails = [...new Set([...rawEmails, req.user.email])].filter(Boolean);

    // 2. Find who actually exists in the database right now
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: uniqueEmails } },
      include: {
        playerProfile: true

      }
    });

    // 3. Sort emails into two buckets: "Ready to Connect" and "Needs Invite"
    const validPlayerIds = [];
    const validProfileIds = []; // For the PlayerTournament stats table
    const emailsToInvite = [];

    for (const email of uniqueEmails) {
      const u = existingUsers.find(user => user.email === email);

      // A player can only be directly connected if they have a completed PlayerProfile.
      // Team.players is a PlayerProfile[] relation — connecting by User.id would cause P2025.
      if (u && u.role === 'PLAYER' && u.playerProfile) {
        validPlayerIds.push({ id: u.playerProfile.id }); // PlayerProfile.id, not User.id
        validProfileIds.push(u.playerProfile.id);
      } else {
        // No account, wrong role, or profile not yet completed → send an invite instead.
        emailsToInvite.push(email);
      }
    }

    // Determine initial status based on whether we are waiting for friends
    const initialStatus = emailsToInvite.length > 0 ? "WAITING_FOR_PLAYERS" : "PENDING_APPROVAL";

    // 4. Execute the Transaction
    const newTeam = await prisma.$transaction(async (tx) => {

      // A. Create the Team and connect the existing users
      const team = await tx.team.create({
        data: {
          name: teamName,
          kitColour: kitColour || null,
          tournamentId,
          captainId,
          status: initialStatus,
          players: {
            connect: validPlayerIds // Connects captain and any friends who already have accounts
          }
        },
      });

      // B. Create the TeamInvites for the friends who don't have accounts yet
      if (emailsToInvite.length > 0) {
        const invitePayload = emailsToInvite.map(email => ({
          email,
          teamId: team.id,
          token: uuidv4(), // Generate secure token
          status: "PENDING"
        }));
        await tx.teamInvite.createMany({ data: invitePayload });
      }

      // C. Generate PlayerTournament junction rows for stats (only for existing profiles)
      if (validProfileIds.length > 0) {
        const playerTournamentPayload = validProfileIds.map(profileId => ({
          playerId: profileId,
          tournamentId,
          teamId: team.id
        }));

        await tx.playerTournament.createMany({
          data: playerTournamentPayload,
          skipDuplicates: true
        });
      }

      return team;
    });

    // TODO: Trigger your background job here to actually send the emails using SendGrid/Resend

    return res.status(201).json({
      message: emailsToInvite.length > 0
        ? `Team created! Sent invites to ${emailsToInvite.length} missing players.`
        : "Team successfully registered and ready for approval.",
      team: newTeam
    });

  } catch (error) {
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
    if (!token) return res.status(400).json({ message: "Token is required." });

    const cacheKey = `invite:token:${token}`;

    // Serve from Redis if already cached
    const cached = await redis.get(cacheKey);
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
      return res.status(404).json({ message: "Invite link not found or has expired." });
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
    await redis.setex(cacheKey, 30 * 60, JSON.stringify(inviteData));

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
//  4. Marks invite ACCEPTED; upgrades team status if no invites remain
// =====================================================================
export const redeemInviteToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required." });

    const cacheKey = `invite:token:${token}`;

    // 1. Resolve invite data — Redis first, then DB fallback
    let inviteData = null;
    const cached = await redis.get(cacheKey);
    if (cached) {
      inviteData = JSON.parse(cached);
    } else {
      const invite = await prisma.teamInvite.findUnique({ where: { token } });
      if (invite && invite.status === "PENDING") {
        inviteData = { inviteId: invite.id, email: invite.email, teamId: invite.teamId };
      }
    }

    if (!inviteData) {
      return res.status(404).json({ message: "Invite not found or has already been used." });
    }

    // 2. Fetch the logged-in user (email is not in the JWT payload, so we hit DB once)
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true },
    });
    if (!currentUser) return res.status(404).json({ message: "User not found." });

    // 3. Email must match what the captain originally entered
    if (currentUser.email.toLowerCase() !== inviteData.email.toLowerCase()) {
      return res.status(403).json({
        message: `This invite was sent to ${inviteData.email}. Please log in with that account.`,
      });
    }

    // 4. Only players can join a team
    if (currentUser.role !== "PLAYER") {
      return res.status(403).json({ message: "Only players can accept team invites." });
    }

    // 5. Player profile must exist before they can be rostered
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: currentUser.id },
    });
    if (!playerProfile) {
      return res.status(400).json({
        message: "Please complete your player profile before joining a team.",
      });
    }

    // 6. Transactional join
    await prisma.$transaction(async (tx) => {
      // Connect player profile to the team
      await tx.team.update({
        where: { id: inviteData.teamId },
        data: { players: { connect: { id: playerProfile.id } } },
      });

      // Grab the tournament ID from the team
      const team = await tx.team.findUnique({
        where: { id: inviteData.teamId },
        select: { tournamentId: true },
      });

      // Upsert tournament stats row
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
          teamId: inviteData.teamId,
        },
        update: { teamId: inviteData.teamId },
      });

      // Mark invite as accepted
      await tx.teamInvite.update({
        where: { token },
        data: { status: "ACCEPTED" },
      });

      // If no pending invites remain, promote team to PENDING_APPROVAL
      const pendingCount = await tx.teamInvite.count({
        where: { teamId: inviteData.teamId, status: "PENDING" },
      });
      if (pendingCount === 0) {
        await tx.team.update({
          where: { id: inviteData.teamId },
          data: { status: "PENDING_APPROVAL" },
        });
      }
    });

    // 7. Evict the Redis key so the token cannot be reused
    await redis.del(cacheKey);

    return res.status(200).json({ message: "You've successfully joined the team!" });
  } catch (error) {
    console.error("Error redeeming invite token:", error);
    return res.status(500).json({ message: "Server error" });
  }
};