import prisma from "../prismaClient.js";
import {
  XP_VALUES,
  STREAK_WINDOW_DAYS,
  computeLevel,
} from "../config/gamificationConfig.js";
import { BADGE_DEFINITIONS } from "./badgeDefinitions.js";
import { sendPushToUser } from "./pushService.js";

const STREAK_EVENTS = new Set([
  "SESSION_ATTENDED",
  "TOURNAMENT_JOIN",
  "ACADEMY_JOIN",
  "MATCH_PLAYED",
]);

export async function processEvent(eventType, playerId, meta = {}) {
  const xpGained = XP_VALUES[eventType] || 0;

  const player = await prisma.playerProfile.update({
    where: { id: playerId },
    data: { xp: { increment: xpGained } },
    include: {
      playerBadges: { select: { badge: { select: { slug: true } } } },
      _count: { select: { tournaments: true, attendances: true } },
    },
  });

  let streakUpdated = false;
  if (STREAK_EVENTS.has(eventType)) {
    streakUpdated = await updateStreak(playerId, player.lastStreakEvent);
  }

  const updatedPlayer = await prisma.playerProfile.findUnique({
    where: { id: playerId },
    include: {
      playerBadges: { select: { badge: { select: { slug: true } } } },
      _count: { select: { tournaments: true, attendances: true } },
    },
  });

  const newLevel = computeLevel(updatedPlayer.xp);
  if (newLevel !== updatedPlayer.level) {
    await prisma.playerProfile.update({
      where: { id: playerId },
      data: { level: newLevel },
    });
    updatedPlayer.level = newLevel;
  }

  const newBadges = await checkAndAwardBadges(updatedPlayer, meta);

  if (newBadges.length > 0) {
    const bonusXp = newBadges.reduce((sum, b) => sum + b.xpReward, 0);
    if (bonusXp > 0) {
      const afterBonus = await prisma.playerProfile.update({
        where: { id: playerId },
        data: { xp: { increment: bonusXp } },
      });
      const finalLevel = computeLevel(afterBonus.xp);
      if (finalLevel !== afterBonus.level) {
        await prisma.playerProfile.update({
          where: { id: playerId },
          data: { level: finalLevel },
        });
      }
    }

    sendPushForBadges(updatedPlayer.userId, newBadges);
  }

  return {
    xpGained,
    leveledUp: newLevel !== player.level,
    newBadges,
    streakUpdated,
  };
}

async function updateStreak(playerId, lastStreakEvent) {
  const now = new Date();
  const windowMs = STREAK_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  let data;
  if (!lastStreakEvent || now - lastStreakEvent > windowMs) {
    data = { currentStreak: 1, lastStreakEvent: now };
  } else {
    data = {
      currentStreak: { increment: 1 },
      lastStreakEvent: now,
    };
  }

  const updated = await prisma.playerProfile.update({
    where: { id: playerId },
    data,
  });

  if (updated.currentStreak > updated.longestStreak) {
    await prisma.playerProfile.update({
      where: { id: playerId },
      data: { longestStreak: updated.currentStreak },
    });
  }

  return true;
}

async function checkAndAwardBadges(player, meta) {
  const earnedSlugs = new Set(
    player.playerBadges.map((pb) => pb.badge.slug)
  );

  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedSlugs.has(def.slug)) continue;

    let unlocked = false;
    try {
      unlocked = def.condition(player, meta);
    } catch {
      continue;
    }

    if (!unlocked) continue;

    const badge = await prisma.badge.findUnique({
      where: { slug: def.slug },
    });
    if (!badge) continue;

    await prisma.playerBadge.create({
      data: {
        playerId: player.id,
        badgeId: badge.id,
        notified: false,
      },
    });

    newBadges.push({
      slug: def.slug,
      name: def.name,
      description: def.description,
      icon: def.icon,
      xpReward: def.xpReward,
    });
  }

  return newBadges;
}

async function sendPushForBadges(userId, badges) {
  for (const badge of badges) {
    try {
      await sendPushToUser(userId, {
        title: `🏆 ${badge.name}`,
        body: badge.description,
        icon: "/images/badge-icon.png",
        data: { type: "badge", slug: badge.slug },
      });
    } catch {
      // push delivery is best-effort
    }
  }
}
