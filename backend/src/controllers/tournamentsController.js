import prisma from "../prismaClient.js";

/**
 * GET /tournament/all
 * Fetch paginated tournaments with optional status/location/category filters.
 *
 * Query params:
 *   page     (int, default 1)   — current page
 *   limit    (int, default 10)  — items per page (capped at 50)
 *   status   (string)           — filter by UPCOMING | ONGOING | COMPLETED
 *   location (string)           — filter by city/location name
 *   category (string)           — filter by tournament category
 *   sort     (string)           — "date-asc" | "date-desc" | "prize-desc" (default: date-asc)
 */
export const getAllTournaments = async (req, res) => {
    try {
        // --- 1. Pagination (with safe bounds) ---
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50); // cap at 50
        const skip = (page - 1) * limit;

        // --- 2. Dynamic WHERE clause (like your filterAcademies) ---
        const where = {};

        if (req.query.status) {
            const validStatuses = ["UPCOMING", "ONGOING", "COMPLETED"];
            const status = req.query.status.toUpperCase();
            if (validStatuses.includes(status)) {
                where.status = status;
            }
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

        // --- 3. Sorting ---
        let orderBy = { startDate: "asc" }; // nearest tournaments first by default

        const sort = req.query.sort;
        if (sort === "date-desc") orderBy = { startDate: "desc" };
        if (sort === "prize-desc") orderBy = { price: "desc" };

        // --- 4. Parallel queries (count + data) for efficiency ---
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
                    status: true,
                    createdAt: true,
                    // Counts instead of full arrays — avoids N+1 and huge payloads
                    _count: {
                        select: {
                            players: true,
                            teams: true,
                        },
                    },
                },
            }),
        ]);

        // --- 5. Standardised pagination response (matches academy pattern) ---
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: tournaments,
            pagination: {
                currentPage: page,
                limit,
                totalItems,
                totalPages,
            },
        });
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
