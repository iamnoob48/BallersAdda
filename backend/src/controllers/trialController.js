import prisma from "../prismaClient.js";
import { cacheGet, cacheDel, cacheInvalidate } from "../config/cacheUtils.js";
import { parsePagination, paginationMeta } from "../lib/pagination.js";
import { invalidateAcademyCache } from "./academyControllers.js";

// ── State machine ──────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS = {
  BOOKED:    ["ATTENDED", "NO_SHOW", "CANCELLED", "EXPIRED"],
  ATTENDED:  ["CONVERTED"],
  NO_SHOW:   [],
  CANCELLED: [],
  CONVERTED: [],
  EXPIRED:   [],
};

const canTransition = (from, to) =>
  ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;

const ACTIVE_STATUSES = ["BOOKED"];
const MAX_CONCURRENT_TRIALS = 3;
const BOOKING_MIN_DAYS = 1;
const BOOKING_MAX_DAYS = 30;

// ── Day-of-week helpers ────────────────────────────────────────────────
const JS_DAY_TO_PRISMA = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY",
  "THURSDAY", "FRIDAY", "SATURDAY",
];

const sameDayRange = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { gte: start, lte: end };
};

// ── Cache helpers ──────────────────────────────────────────────────────
const invalidateTrialCache = (academyId, userId) => {
  cacheInvalidate(`trial:availability:${academyId}:*`);
  if (userId) cacheDel(`trial:my-trials:${userId}`);
};

// =====================================================================
//  GET /trial/availability/:academyId?month=2026-06
// =====================================================================
export const getTrialAvailability = async (req, res) => {
  try {
    const academyId = Number(req.params.academyId);
    if (!Number.isInteger(academyId) || academyId <= 0) {
      return res.status(400).json({ message: "Invalid academy ID" });
    }

    const academy = await prisma.academy.findUnique({
      where: { id: academyId },
      select: { id: true, haveFreeTrial: true, maxTrialsPerDay: true },
    });
    if (!academy) return res.status(404).json({ message: "Academy not found" });
    if (!academy.haveFreeTrial) {
      return res.status(200).json({ available: false, message: "Free trials not offered" });
    }

    const schedule = await prisma.academySchedule.findMany({
      where: { academyId, isActive: true },
      select: { dayOfWeek: true, startTime: true, endTime: true },
    });

    const monthParam = req.query.month;
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1;
    }

    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const cacheKey = `trial:availability:${academyId}:${year}-${String(month + 1).padStart(2, "0")}`;

    const { data: result } = await cacheGet(cacheKey, 60, async () => {
      const bookings = await prisma.freeTrialBooking.findMany({
        where: {
          academyId,
          scheduledDate: { gte: monthStart, lte: monthEnd },
          status: { in: ACTIVE_STATUSES },
        },
        select: { scheduledDate: true },
      });

      const bookedCounts = {};
      for (const b of bookings) {
        const key = b.scheduledDate.toISOString().split("T")[0];
        bookedCounts[key] = (bookedCounts[key] || 0) + 1;
      }

      return {
        available: true,
        maxPerDay: academy.maxTrialsPerDay,
        schedule: schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
        bookedCounts,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching trial availability:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /trial/book
// =====================================================================
export const bookTrial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { academyId: rawAcademyId, date: rawDate } = req.body;

    const academyId = Number(rawAcademyId);
    if (!Number.isInteger(academyId) || academyId <= 0) {
      return res.status(400).json({ message: "Invalid academy ID" });
    }

    // 1. Player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });
    if (!playerProfile) {
      return res.status(404).json({ message: "Create your player profile first" });
    }

    // 2. Academy exists + trial enabled
    const academy = await prisma.academy.findUnique({
      where: { id: academyId },
      select: { id: true, name: true, city: true, haveFreeTrial: true, maxTrialsPerDay: true },
    });
    if (!academy) return res.status(404).json({ message: "Academy not found" });
    if (!academy.haveFreeTrial) {
      return res.status(403).json({ message: "This academy is not offering free trials" });
    }

    // 3. Not already enrolled
    if (playerProfile.academyId === academyId) {
      return res.status(400).json({ message: "You are already enrolled at this academy" });
    }
    const activeEnrollment = await prisma.academyEnrollment.findFirst({
      where: { playerId: playerProfile.id, academyId, status: "ACTIVE" },
      select: { id: true },
    });
    if (activeEnrollment) {
      return res.status(400).json({ message: "You are already enrolled at this academy" });
    }

    // 4. Date validation
    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      return res.status(400).json({ message: "Date must be in YYYY-MM-DD format" });
    }
    const trialDate = new Date(rawDate + "T00:00:00.000Z");
    if (isNaN(trialDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setUTCDate(minDate.getUTCDate() + BOOKING_MIN_DAYS);
    const maxDate = new Date(today);
    maxDate.setUTCDate(maxDate.getUTCDate() + BOOKING_MAX_DAYS);

    if (trialDate < minDate || trialDate > maxDate) {
      return res.status(400).json({
        message: `Trial date must be between ${BOOKING_MIN_DAYS} and ${BOOKING_MAX_DAYS} days from today`,
      });
    }

    // 5. Schedule match
    const dayOfWeek = JS_DAY_TO_PRISMA[trialDate.getUTCDay()];
    const schedule = await prisma.academySchedule.findFirst({
      where: { academyId, dayOfWeek, isActive: true },
      select: { startTime: true, endTime: true },
    });
    if (!schedule) {
      return res.status(400).json({
        message: `Academy does not have sessions on ${dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}s`,
      });
    }

    // 6. Existing booking check
    const existing = await prisma.freeTrialBooking.findUnique({
      where: { playerId_academyId: { playerId: playerProfile.id, academyId } },
    });

    if (existing) {
      if (existing.status === "BOOKED") {
        return res.status(409).json({ message: "You already have a pending trial at this academy" });
      }
      if (["ATTENDED", "CONVERTED", "NO_SHOW", "EXPIRED"].includes(existing.status)) {
        return res.status(409).json({ message: "You have already used your free trial at this academy" });
      }
      if (existing.status === "CANCELLED" && existing.hasRebooked) {
        return res.status(409).json({ message: "You have already used your one-time rebook for this academy" });
      }
    }

    // 7. Concurrent active trial limit
    const activeCount = await prisma.freeTrialBooking.count({
      where: { playerId: playerProfile.id, status: { in: ACTIVE_STATUSES } },
    });
    if (activeCount >= MAX_CONCURRENT_TRIALS) {
      return res.status(429).json({
        message: `You can have at most ${MAX_CONCURRENT_TRIALS} active trial bookings at a time`,
      });
    }

    // 8. Transaction: capacity check + session reuse + booking
    const scheduledDateTime = new Date(trialDate);
    if (schedule.startTime) {
      const [h, m] = schedule.startTime.split(":").map(Number);
      scheduledDateTime.setUTCHours(h || 0, m || 0, 0, 0);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Capacity check
      const bookedCount = await tx.freeTrialBooking.count({
        where: {
          academyId,
          scheduledDate: sameDayRange(trialDate),
          status: { in: ACTIVE_STATUSES },
        },
      });
      if (bookedCount >= academy.maxTrialsPerDay) {
        throw new Error("SLOT_FULL");
      }

      // Reuse or create TRIAL session
      let session = await tx.academySession.findFirst({
        where: {
          academyId,
          date: sameDayRange(trialDate),
          type: "TRIAL",
        },
      });
      if (!session) {
        session = await tx.academySession.create({
          data: { date: scheduledDateTime, type: "TRIAL", academyId },
        });
      }

      // Create or rebook
      let booking;
      if (existing && existing.status === "CANCELLED") {
        booking = await tx.freeTrialBooking.update({
          where: { id: existing.id },
          data: {
            scheduledDate: scheduledDateTime,
            dayOfWeek,
            sessionId: session.id,
            status: "BOOKED",
            hasRebooked: true,
            bookedAt: new Date(),
            cancelledAt: null,
          },
        });
      } else {
        booking = await tx.freeTrialBooking.create({
          data: {
            playerId: playerProfile.id,
            academyId,
            sessionId: session.id,
            scheduledDate: scheduledDateTime,
            dayOfWeek,
            status: "BOOKED",
          },
        });
      }

      // Create attendance record
      await tx.sessionAttendance.upsert({
        where: {
          sessionId_playerId: { sessionId: session.id, playerId: playerProfile.id },
        },
        create: { sessionId: session.id, playerId: playerProfile.id, isPresent: false },
        update: { isPresent: false },
      });

      return { booking, session };
    });

    invalidateTrialCache(academyId, userId);

    return res.status(201).json({
      message: "Trial session booked",
      booking: {
        id: result.booking.id,
        academyId: result.booking.academyId,
        scheduledDate: result.booking.scheduledDate,
        dayOfWeek: result.booking.dayOfWeek,
        status: result.booking.status,
        hasRebooked: result.booking.hasRebooked,
      },
      session: {
        id: result.session.id,
        date: result.session.date,
        type: result.session.type,
      },
      academy: { name: academy.name, city: academy.city },
    });
  } catch (error) {
    if (error.message === "SLOT_FULL") {
      return res.status(409).json({ message: "No trial slots available for this date" });
    }
    console.error("Error booking trial:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  POST /trial/cancel
// =====================================================================
export const cancelTrial = async (req, res) => {
  try {
    const userId = req.user.id;
    const academyId = Number(req.body.academyId);
    if (!Number.isInteger(academyId) || academyId <= 0) {
      return res.status(400).json({ message: "Invalid academy ID" });
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!playerProfile) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    const booking = await prisma.freeTrialBooking.findUnique({
      where: { playerId_academyId: { playerId: playerProfile.id, academyId } },
    });
    if (!booking) {
      return res.status(404).json({ message: "No trial booking found for this academy" });
    }

    if (!canTransition(booking.status, "CANCELLED")) {
      return res.status(400).json({
        message: `Cannot cancel a trial with status ${booking.status}`,
      });
    }

    await prisma.freeTrialBooking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    invalidateTrialCache(academyId, userId);

    return res.status(200).json({ message: "Trial cancelled" });
  } catch (error) {
    console.error("Error cancelling trial:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /trial/my-trials
// =====================================================================
export const getMyTrials = async (req, res) => {
  try {
    const userId = req.user.id;
    const cacheKey = `trial:my-trials:${userId}`;

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!playerProfile) {
      return res.status(200).json({ trials: [] });
    }

    const { data: trials } = await cacheGet(cacheKey, 300, async () => {
      return prisma.freeTrialBooking.findMany({
        where: { playerId: playerProfile.id },
        orderBy: { scheduledDate: "desc" },
        select: {
          id: true,
          academyId: true,
          scheduledDate: true,
          dayOfWeek: true,
          status: true,
          hasRebooked: true,
          bookedAt: true,
          cancelledAt: true,
          attendedAt: true,
          convertedAt: true,
          notes: true,
          academy: {
            select: { name: true, city: true, state: true, academyLogoURL: true },
          },
        },
      });
    });

    return res.status(200).json({ trials });
  } catch (error) {
    console.error("Error fetching trials:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  PATCH /trial/academy/settings
// =====================================================================
export const updateTrialSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const academy = await prisma.academy.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!academy) {
      return res.status(403).json({ message: "You do not own an academy" });
    }

    const data = {};
    if (req.body.haveFreeTrial !== undefined) {
      if (typeof req.body.haveFreeTrial !== "boolean") {
        return res.status(400).json({ message: "haveFreeTrial must be a boolean" });
      }
      data.haveFreeTrial = req.body.haveFreeTrial;
    }
    if (req.body.maxTrialsPerDay !== undefined) {
      const val = Number(req.body.maxTrialsPerDay);
      if (!Number.isInteger(val) || val < 1 || val > 20) {
        return res.status(400).json({ message: "maxTrialsPerDay must be an integer between 1 and 20" });
      }
      data.maxTrialsPerDay = val;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await prisma.academy.update({ where: { id: academy.id }, data });

    invalidateAcademyCache(academy.id);
    cacheInvalidate(`trial:availability:${academy.id}:*`);

    return res.status(200).json({ message: "Trial settings updated" });
  } catch (error) {
    console.error("Error updating trial settings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  GET /trial/academy/bookings?status=BOOKED&page=1&limit=20
// =====================================================================
export const getAcademyTrialBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const academy = await prisma.academy.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!academy) {
      return res.status(403).json({ message: "You do not own an academy" });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const statusFilter = req.query.status;
    const validStatuses = ["BOOKED", "ATTENDED", "NO_SHOW", "CANCELLED", "CONVERTED", "EXPIRED"];

    const where = { academyId: academy.id };
    if (statusFilter && validStatuses.includes(statusFilter)) {
      where.status = statusFilter;
    }

    const cacheKey = `trial:academy-bookings:${academy.id}:p${page}:l${limit}:${statusFilter || "all"}`;

    const { data: result } = await cacheGet(cacheKey, 120, async () => {
      const [total, bookings] = await Promise.all([
        prisma.freeTrialBooking.count({ where }),
        prisma.freeTrialBooking.findMany({
          where,
          skip,
          take: limit,
          orderBy: { scheduledDate: "desc" },
          select: {
            id: true,
            scheduledDate: true,
            dayOfWeek: true,
            status: true,
            hasRebooked: true,
            bookedAt: true,
            cancelledAt: true,
            attendedAt: true,
            convertedAt: true,
            notes: true,
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: { select: { email: true, profilePic: true } },
              },
            },
          },
        }),
      ]);

      return { bookings, pagination: paginationMeta(total, page, limit) };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching academy trial bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// =====================================================================
//  PATCH /trial/academy/bookings/:bookingId/status
// =====================================================================
export const markTrialAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = Number(req.params.bookingId);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const academy = await prisma.academy.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!academy) {
      return res.status(403).json({ message: "You do not own an academy" });
    }

    const { status, notes } = req.body;
    const allowedStatuses = ["ATTENDED", "NO_SHOW", "CONVERTED"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }
    if (notes !== undefined && (typeof notes !== "string" || notes.length > 500)) {
      return res.status(400).json({ message: "Notes must be a string of max 500 characters" });
    }

    const booking = await prisma.freeTrialBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, academyId: true, playerId: true },
    });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.academyId !== academy.id) {
      return res.status(403).json({ message: "This booking does not belong to your academy" });
    }

    if (!canTransition(booking.status, status)) {
      return res.status(400).json({
        message: `Cannot transition from ${booking.status} to ${status}`,
      });
    }

    const data = { status };
    if (notes !== undefined) data.notes = notes.trim();
    if (status === "ATTENDED") {
      data.attendedAt = new Date();
      // Also mark attendance as present
      const session = await prisma.freeTrialBooking.findUnique({
        where: { id: bookingId },
        select: { sessionId: true },
      });
      if (session?.sessionId) {
        await prisma.sessionAttendance.updateMany({
          where: { sessionId: session.sessionId, playerId: booking.playerId },
          data: { isPresent: true },
        });
      }
    }
    if (status === "CONVERTED") data.convertedAt = new Date();

    const updated = await prisma.freeTrialBooking.update({
      where: { id: bookingId },
      data,
    });

    cacheInvalidate(`trial:academy-bookings:${academy.id}:*`);
    // Find player's userId for cache invalidation
    const player = await prisma.playerProfile.findUnique({
      where: { id: booking.playerId },
      select: { userId: true },
    });
    if (player) cacheDel(`trial:my-trials:${player.userId}`);

    return res.status(200).json({
      message: `Trial marked as ${status}`,
      booking: {
        id: updated.id,
        status: updated.status,
        attendedAt: updated.attendedAt,
        convertedAt: updated.convertedAt,
        notes: updated.notes,
      },
    });
  } catch (error) {
    console.error("Error marking trial attendance:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
