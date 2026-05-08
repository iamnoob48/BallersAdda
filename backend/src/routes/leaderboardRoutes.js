import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import {
  getTournamentLeaderboard,
  getTournamentPlayerLeaderboard,
  getAcademyLeaderboard,
  getPlayerLeaderboard,
} from "../controllers/leaderboardController.js";
import { createLogger } from "../config/logger.js";

const router = express.Router();
const logger = createLogger("leaderboardRoutes");

// Log every inbound request; log method + path + status + duration on finish
router.use((req, res, next) => {
  const start = Date.now();
  logger.info("request received", { method: req.method, path: req.path, query: req.query });
  res.on("finish", () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level]("request completed", { method: req.method, path: req.path, status: res.statusCode, durationMs: ms });
  });
  next();
});

// ── Tournament leaderboard ──────────────────────────────────────────
// GET /leaderboard/tournament/:id          — standings or bracket
// GET /leaderboard/tournament/:id/players  — top scorers / assisters
router.get("/tournament/:id", verifyAccessToken, getTournamentLeaderboard);
router.get("/tournament/:id/players", verifyAccessToken, getTournamentPlayerLeaderboard);

// ── Academy leaderboard ─────────────────────────────────────────────
// GET /leaderboard/academy/:id  — academy player rankings
router.get("/academy/:id", verifyAccessToken, getAcademyLeaderboard);

// ── Player leaderboard (platform-wide) ──────────────────────────────
// GET /leaderboard/players  — national/state/regional rankings
router.get("/players", verifyAccessToken, getPlayerLeaderboard);

export default router;
