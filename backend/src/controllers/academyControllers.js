import prisma from "../prismaClient.js";
import { cacheGet } from "../config/cacheUtils.js";

// ── Shared pagination helpers ───────────────────────────────────────────
const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// ── Shared select object (avoids repeating field lists) ─────────────────
const ACADEMY_LIST_SELECT = {
  id: true,
  name: true,
  state: true,
  city: true,
  address: true,
  country: true,
  contactEmail: true,
  contactPhone: true,
  description: true,
  academyLogoURL: true,
  rating: true,
};

// =====================================================================
//  GET /academy/details — paginated list of all academies
// =====================================================================
export const getAcademyDetails = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const cacheKey = `academy:list:page:${page}:limit:${limit}`;

    const { data: result } = await cacheGet(cacheKey, 180, async () => {
      const [totalAcademies, academies] = await Promise.all([
        prisma.academy.count(),
        prisma.academy.findMany({
          skip,
          take: limit,
          orderBy: { id: "asc" },
          select: ACADEMY_LIST_SELECT,
        }),
      ]);
      return {
        data: academies,
        pagination: paginationMeta(totalAcademies, page, limit),
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching academies:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /academy/details/:id — single academy with full detail
// =====================================================================
export const getAcademyDetailsById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid academy ID" });
    }
    const cacheKey = `academy:detail:${id}`;

    const { data: cached } = await cacheGet(cacheKey, 300, async () => {
      const academy = await prisma.academy.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          state: true,
          city: true,
          address: true,
          country: true,
          contactEmail: true,
          contactPhone: true,
          description: true,
          establishedAt: true,
          academyLogoURL: true,
          rating: true,
          noOfStudents: true,

          pricingPlans: {
            where: { active: true },
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              currency: true,
              features: true,
              isDefault: true,
              recommended: true,
              active: true,
              priceCents: true,
              billingCycle: true,
            },
          },

          coaches: {
            take: 10,
            select: {
              id: true,
              profilePicLogo: true,
              firstName: true,
              lastName: true,
              bio: true,
              experienceYears: true,
            },
          },

          schedules: {
            orderBy: { id: "asc" },
            select: {
              dayOfWeek: true,
              isActive: true,
              startTime: true,
              endTime: true,
            },
          },

          pictures: {
            where: { isActive: true },
            orderBy: { isPrimary: "desc" },
            select: {
              id: true,
              pictureURL: true,
            },
          },
        },
      });

      if (!academy) return null;

      const DAY_MAP = {
        monday: "Mon", tuesday: "Tue", wednesday: "Wed",
        thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
      };
      const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const scheduleObj = ALL_DAYS.reduce((acc, d) => {
        acc[d] = { active: false, startTime: null, endTime: null };
        return acc;
      }, {});

      for (const s of academy.schedules) {
        const key = s.dayOfWeek ? (DAY_MAP[s.dayOfWeek.trim().toLowerCase()] ?? s.dayOfWeek.slice(0, 3)) : null;
        if (!key) continue;
        scheduleObj[key] = {
          active: Boolean(s.isActive),
          startTime: s.startTime ?? null,
          endTime: s.endTime ?? null,
        };
      }

      return {
        id: academy.id,
        name: academy.name,
        state: academy.state,
        city: academy.city,
        address: academy.address,
        country: academy.country,
        contactEmail: academy.contactEmail,
        contactPhone: academy.contactPhone,
        description: academy.description,
        establishedAt: academy.establishedAt,
        academyLogoURL: academy.academyLogoURL,
        rating: academy.rating,
        noOfStudents: academy.noOfStudents,
        pricing: academy.pricingPlans,
        coaches: academy.coaches,
        schedule: scheduleObj,
        pictures: academy.pictures,
      };
    });

    if (!cached) {
      return res.status(404).json({ message: "Academy not found" });
    }

    return res.status(200).json({ academy: cached });
  } catch (error) {
    console.error("Error fetching academy details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /academy/filter — filter by city, rating, ageGroup
// =====================================================================
export const filterAcademies = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { city, rating } = req.query;

    if (rating) {
      const parsed = parseFloat(rating);
      if (isNaN(parsed) || parsed < 0 || parsed > 5) {
        return res.status(400).json({ message: "Rating must be between 0 and 5" });
      }
    }

    const cacheKey = `academy:filter:${city || "all"}:${rating || "any"}:p${page}:l${limit}`;

    const { data: result } = await cacheGet(cacheKey, 180, async () => {
      const where = {};
      if (city) where.city = { equals: city, mode: "insensitive" };
      if (rating) where.rating = { gte: parseFloat(rating) };

      const [totalFiltered, academies] = await Promise.all([
        prisma.academy.count({ where }),
        prisma.academy.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: "asc" },
          select: ACADEMY_LIST_SELECT,
        }),
      ]);

      return {
        data: academies,
        pagination: paginationMeta(totalFiltered, page, limit),
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering academies:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /academy/register — Register a new academy club
// =====================================================================
import { setAuthCookies } from "./authControllers.js";

export const registerAcademy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, country, city, state, address, licenseNo, contactEmail, contactPhone, coachesUsernames = [] } = req.body;

    if (!name || !city || !state || !country || !address) {
      return res.status(400).json({ message: "Academy Name, City, and State are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "ACADEMY") {
      return res.status(400).json({ message: "User is already an academy owner." });
    }

    // Validate coaches
    const foundCoaches = [];
    const invalidUsernames = [];

    if (coachesUsernames.length > 0) {
      for (const username of coachesUsernames) {
        if (!username.trim()) continue;
        const coachUser = await prisma.user.findFirst({
          where: { username: { equals: username, mode: 'insensitive' } }
        });
        if (coachUser) {
          foundCoaches.push(coachUser);
        } else {
          invalidUsernames.push(username);
        }
      }
    }

    if (invalidUsernames.length > 0) {
      return res.status(400).json({
        message: "Some coach usernames were not found.",
        invalidUsernames
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Academy
      const newAcademy = await tx.academy.create({
        data: {
          name,
          country,
          city,
          state,
          address,
          licenseNo: licenseNo || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          userId: userId,
          verified: false // defaults to false
        }
      });

      // 2. Upgrade current user to ACADEMY
      const updatedOwner = await tx.user.update({
        where: { id: userId },
        data: { role: "ACADEMY" }
      });

      // 3. Link or upgrade coaches
      for (const coachUser of foundCoaches) {
        // Upgrade role to COACH if not already
        if (coachUser.role !== "ACADEMY" && coachUser.role !== "ADMIN") {
          await tx.user.update({
            where: { id: coachUser.id },
            data: { role: "COACH" }
          });
        }

        // Upsert coach profile
        await tx.coach.upsert({
          where: { userId: coachUser.id },
          create: {
            userId: coachUser.id,
            academyId: newAcademy.id,
            firstName: "Pending", // temporary until completed
            lastName: coachUser.username || "Coach"
          },
          update: {
            academyId: newAcademy.id
          }
        });
      }

      return { newAcademy, updatedOwner };
    });

    // Re-issue JWT since role changed
    setAuthCookies(res, result.updatedOwner);

    return res.status(201).json({
      message: "Academy registered successfully.",
      user: {
        id: result.updatedOwner.id,
        email: result.updatedOwner.email,
        username: result.updatedOwner.username,
        profilePic: result.updatedOwner.profilePic,
        role: result.updatedOwner.role,
        isVerified: result.updatedOwner.isVerified
      },
      academy: result.newAcademy
    });

  } catch (error) {
    console.error("Error registering academy:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
