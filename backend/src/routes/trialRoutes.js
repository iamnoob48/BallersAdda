import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import {
  getTrialAvailability,
  bookTrial,
  cancelTrial,
  getMyTrials,
  updateTrialSettings,
  getAcademyTrialBookings,
  markTrialAttendance,
} from "../controllers/trialController.js";

const router = express.Router();

// Player-facing
router.get("/availability/:academyId", verifyAccessToken, getTrialAvailability);
router.post("/book", verifyAccessToken, bookTrial);
router.post("/cancel", verifyAccessToken, cancelTrial);
router.get("/my-trials", verifyAccessToken, getMyTrials);

// Academy-owner-facing
router.patch("/academy/settings", verifyAccessToken, updateTrialSettings);
router.get("/academy/bookings", verifyAccessToken, getAcademyTrialBookings);
router.patch("/academy/bookings/:bookingId/status", verifyAccessToken, markTrialAttendance);

export default router;
