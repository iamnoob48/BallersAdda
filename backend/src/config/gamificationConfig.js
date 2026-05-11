export const XP_VALUES = {
  PROFILE_COMPLETE: 50,
  ACADEMY_JOIN: 100,
  SESSION_ATTENDED: 25,
  TOURNAMENT_JOIN: 75,
  MATCH_PLAYED: 50,
  GOAL_SCORED: 30,
  ASSIST_RECORDED: 20,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000,
  12500, 15000,
];

export const STREAK_WINDOW_DAYS = 7;

export function computeLevel(xp) {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

export function xpForNextLevel(currentLevel) {
  if (currentLevel >= LEVEL_THRESHOLDS.length) return null;
  return LEVEL_THRESHOLDS[currentLevel];
}
