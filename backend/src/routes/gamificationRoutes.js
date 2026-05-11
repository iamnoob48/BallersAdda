import { Router } from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import {
  getAchievements,
  getUnreadAchievements,
  markAchievementsRead,
  subscribePush,
  unsubscribePush,
} from "../controllers/gamificationController.js";

const router = Router();

router.use(verifyAccessToken);

router.get("/achievements", getAchievements);
router.get("/achievements/unread", getUnreadAchievements);
router.post("/achievements/mark-read", markAchievementsRead);
router.post("/notifications/subscribe", subscribePush);
router.delete("/notifications/unsubscribe", unsubscribePush);

export default router;
