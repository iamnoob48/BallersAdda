import prisma from "../prismaClient.js";
import { computeLevel, xpForNextLevel, LEVEL_THRESHOLDS } from "../config/gamificationConfig.js";
import { saveSubscription, removeSubscription } from "../lib/pushService.js";

export async function getAchievements(req, res) {
  const userId = req.user.id;

  const player = await prisma.playerProfile.findUnique({
    where: { userId },
    select: {
      xp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      lastStreakEvent: true,
      playerBadges: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!player) {
    return res.status(404).json({ error: "Player profile not found" });
  }

  const nextLevelXp = xpForNextLevel(player.level);

  return res.json({
    xp: player.xp,
    level: player.level,
    nextLevelXp,
    currentStreak: player.currentStreak,
    longestStreak: player.longestStreak,
    lastStreakEvent: player.lastStreakEvent,
    badges: player.playerBadges.map((pb) => ({
      id: pb.badge.id,
      slug: pb.badge.slug,
      name: pb.badge.name,
      description: pb.badge.description,
      icon: pb.badge.icon,
      category: pb.badge.category,
      xpReward: pb.badge.xpReward,
      earnedAt: pb.earnedAt,
    })),
  });
}

export async function getUnreadAchievements(req, res) {
  const userId = req.user.id;

  const player = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { id: true, level: true, lastNotifiedLevel: true },
  });

  if (!player) {
    return res.status(404).json({ error: "Player profile not found" });
  }

  const unread = await prisma.playerBadge.findMany({
    where: { playerId: player.id, notified: false },
    include: { badge: true },
    orderBy: { earnedAt: "asc" },
  });

  const achievements = unread.map((pb) => ({
    type: "badge",
    playerBadgeId: pb.id,
    slug: pb.badge.slug,
    name: pb.badge.name,
    description: pb.badge.description,
    icon: pb.badge.icon,
    category: pb.badge.category,
    xpReward: pb.badge.xpReward,
    earnedAt: pb.earnedAt,
  }));

  if (player.level > player.lastNotifiedLevel) {
    for (let lvl = player.lastNotifiedLevel + 1; lvl <= player.level; lvl++) {
      achievements.push({
        type: "level_up",
        level: lvl,
        xpThreshold: LEVEL_THRESHOLDS[lvl - 1] || 0,
      });
    }
  }

  return res.json({ achievements });
}

export async function markAchievementsRead(req, res) {
  const userId = req.user.id;
  const { ids, levelUp } = req.body;

  const player = await prisma.playerProfile.findUnique({
    where: { userId },
    select: { id: true, level: true },
  });

  if (!player) {
    return res.status(404).json({ error: "Player profile not found" });
  }

  if (Array.isArray(ids) && ids.length > 0) {
    await prisma.playerBadge.updateMany({
      where: {
        id: { in: ids },
        playerId: player.id,
      },
      data: { notified: true },
    });
  }

  if (typeof levelUp === "number" && levelUp >= 1) {
    await prisma.playerProfile.update({
      where: { id: player.id },
      data: { lastNotifiedLevel: Math.min(levelUp, player.level) },
    });
  }

  return res.json({ success: true });
}

export async function subscribePush(req, res) {
  const userId = req.user.id;
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid push subscription" });
  }

  await saveSubscription(userId, { endpoint, keys });
  return res.json({ success: true });
}

export async function unsubscribePush(req, res) {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: "endpoint required" });
  }

  await removeSubscription(endpoint);
  return res.json({ success: true });
}
