import prisma from "../prismaClient.js";

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

    const [totalAcademies, academies] = await Promise.all([
      prisma.academy.count(),
      prisma.academy.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
        select: ACADEMY_LIST_SELECT,
      }),
    ]);

    return res.status(200).json({
      data: academies,
      pagination: paginationMeta(totalAcademies, page, limit),
    });
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
          where: { active: true }, // only show active plans
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
          where: { isActive: true }, // only show active (non-deleted) pictures
          orderBy: { isPrimary: "desc" },
          select: {
            id: true,
            pictureURL: true,
          },
        },
      },
    });

    if (!academy) {
      return res.status(404).json({ message: "Academy not found" });
    }

    // --- Normalize schedules into a Mon–Sun object ───────────────────
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

    const payload = {
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

    return res.status(200).json({ academy: payload });
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

    // Build dynamic where clause
    const where = {};

    if (city) {
      where.city = { equals: city, mode: "insensitive" };
    }

    if (rating) {
      const parsed = parseFloat(rating);
      if (isNaN(parsed) || parsed < 0 || parsed > 5) {
        return res.status(400).json({ message: "Rating must be between 0 and 5" });
      }
      where.rating = { gte: parsed };
    }

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

    return res.status(200).json({
      data: academies,
      pagination: paginationMeta(totalFiltered, page, limit),
    });
  } catch (error) {
    console.error("Error filtering academies:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
