import prisma from "../prismaClient.js";
import { cacheGet } from "../config/cacheUtils.js";

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
