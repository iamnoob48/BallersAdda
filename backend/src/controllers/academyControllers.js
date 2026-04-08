import prisma from "../prismaClient.js";

//For fetching the academy details
export const getAcademyDetails = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const totalAcademies = await prisma.academy.count();

    const academies = await prisma.academy.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" }, // always sort for pagination stability
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
        academyLogoURL: true,
        rating: true,

      },
    });

    res.status(200).json({
      data: academies,
      pagination: {
        totalItems: totalAcademies,
        totalPages: Math.ceil(totalAcademies / limit),
        currentPage: page,
        limit,
        hasNextPage: page < Math.ceil(totalAcademies / limit),
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



//For fetching the academy details by id
// assuming: import prisma from '../prismaClient' and optional redis client if used
// Example Redis (optional): import Redis from 'ioredis'; const redis = new Redis(process.env.REDIS_URL);

export const getAcademyDetailsById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid academy ID" });
    }

    // ----- Optional: Redis caching (uncomment if using redis) -----
    // const cacheKey = `academy:${id}`;
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json(JSON.parse(cached));
    // }

    // single query (select tree) — tweak selected fields as required
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
        establishedAt: true, // (or establishedAt if that's what you use)
        academyLogoURL: true,
        rating: true,
        noOfStudents: true,

        pricingPlans: {
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
            profilePicLogo: true, // adjust if your column is named differently
            firstName: true,
            lastName: true,
            bio: true,
            experienceYears: true,
          },
        },

        schedules: {
          orderBy: { id: "asc" }, // deterministic order
          select: {
            dayOfWeek: true, // expected values e.g. "Monday"
            isActive: true,
            startTime: true, // strings like "06:00"
            endTime: true,
          },
        },
        pictures: {
          orderBy: { isPrimary: "desc" }, // deterministic order
          select: {
            id: true,
            pictureURL: true
          }
        }
      },
    });

    if (!academy) {
      return res.status(404).json({ message: "Academy not found" });
    }

    // Helper to convert full day name to 3-letter key: Monday -> Mon
    const dayKey = (full) => {
      if (!full || typeof full !== "string") return null;
      const map = {
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
        sunday: "Sun",
      };
      return map[full.trim().toLowerCase()] ?? full.slice(0, 3);
    };

    // Build schedule object with default entries for all days
    const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const scheduleObj = defaultDays.reduce((acc, d) => {
      acc[d] = { active: false, startTime: null, endTime: null };
      return acc;
    }, {});

    // Fill in from DB schedules
    (academy.schedules || []).forEach((s) => {
      const key = dayKey(s.dayOfWeek);
      if (!key) return;
      scheduleObj[key] = {
        active: Boolean(s.isActive),
        startTime: s.startTime ?? null,
        endTime: s.endTime ?? null,
      };
    });

    // Build response payload (omit raw schedules array in favor of normalized schedule)
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
      pricing: academy.pricingPlans || [],
      academyLogoURL: academy.academyLogoURL,
      rating: academy.rating,
      noOfStudents: academy.noOfStudents,
      coaches: academy.coaches || [],
      schedule: scheduleObj,
      pictures: academy.pictures
    };

    // ----- Optional: set cache -----
    // await redis.set(cacheKey, JSON.stringify(payload), "EX", 60 * 5); // cache for 5 minutes

    return res.status(200).json({ academy: payload });
  } catch (error) {
    console.error("Error fetching academy details:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// Filter academies by city, rating, ageGroup (with pagination)
// GET /academy/filter?city=Hyderabad&rating=4.0&ageGroup=kids&page=1&limit=10
export const filterAcademies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { city, rating, ageGroup } = req.query;

    // Build dynamic where clause
    const where = {};

    if (city) {
      where.city = {
        equals: city,
        mode: "insensitive", // case-insensitive match
      };
    }

    if (rating) {
      where.rating = {
        gte: parseFloat(rating), // minimum rating filter
      };
    }

    // ageGroup filtering (kids = under 16, adults = 16+)
    // Extend this when you add an ageGroup column to Academy

    const totalFiltered = await prisma.academy.count({ where });

    const academies = await prisma.academy.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
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
        academyLogoURL: true,
        rating: true,
      },
    });

    return res.status(200).json({
      data: academies,
      pagination: {
        totalItems: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit),
        currentPage: page,
        limit,
        hasNextPage: page < Math.ceil(totalFiltered / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error filtering academies:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

