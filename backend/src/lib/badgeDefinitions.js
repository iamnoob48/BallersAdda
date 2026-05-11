export const BADGE_DEFINITIONS = [
  {
    slug: "profile_complete",
    name: "Profile Complete",
    description: "Completed your player profile",
    icon: "user-check",
    category: "MILESTONE",
    xpReward: 50,
    condition: (player) =>
      player.firstName &&
      player.lastName &&
      player.position &&
      player.dateOfBirth &&
      player.city,
  },
  {
    slug: "first_tournament",
    name: "First Tournament",
    description: "Joined your first tournament",
    icon: "trophy",
    category: "TOURNAMENT",
    xpReward: 75,
    condition: (player, meta) => {
      const count =
        meta?.tournamentCount ?? player._count?.tournaments ?? 0;
      return count >= 1;
    },
  },
  {
    slug: "tournament_veteran",
    name: "Tournament Veteran",
    description: "Joined 5 tournaments",
    icon: "award",
    category: "TOURNAMENT",
    xpReward: 200,
    condition: (player, meta) => {
      const count =
        meta?.tournamentCount ?? player._count?.tournaments ?? 0;
      return count >= 5;
    },
  },
  {
    slug: "academy_member",
    name: "Academy Member",
    description: "Joined an academy",
    icon: "school",
    category: "ACADEMY",
    xpReward: 100,
    condition: (player) => !!player.academyId,
  },
  {
    slug: "team_captain",
    name: "Team Captain",
    description: "Captained a team",
    icon: "shield",
    category: "SOCIAL",
    xpReward: 150,
    condition: (player, meta) => meta?.isCaptain === true,
  },
  {
    slug: "first_goal",
    name: "First Goal",
    description: "Scored your first goal",
    icon: "target",
    category: "MILESTONE",
    xpReward: 50,
    condition: (player, meta) => {
      const goals = meta?.totalGoals ?? 0;
      return goals >= 1;
    },
  },
  {
    slug: "goal_machine",
    name: "Goal Machine",
    description: "Scored 10 goals across all tournaments",
    icon: "flame",
    category: "MILESTONE",
    xpReward: 300,
    condition: (player, meta) => {
      const goals = meta?.totalGoals ?? 0;
      return goals >= 10;
    },
  },
  {
    slug: "streak_7",
    name: "7-Day Streak",
    description: "Stayed active for 7 consecutive events",
    icon: "zap",
    category: "STREAK",
    xpReward: 100,
    condition: (player) => player.currentStreak >= 7,
  },
  {
    slug: "streak_30",
    name: "30-Day Streak",
    description: "Stayed active for 30 consecutive events",
    icon: "fire",
    category: "STREAK",
    xpReward: 300,
    condition: (player) => player.currentStreak >= 30,
  },
  {
    slug: "streak_90",
    name: "Iron Will",
    description: "Stayed active for 90 consecutive events",
    icon: "diamond",
    category: "STREAK",
    xpReward: 750,
    condition: (player) => player.currentStreak >= 90,
  },
  {
    slug: "session_regular",
    name: "Regular Trainee",
    description: "Attended 10 training sessions",
    icon: "dumbbell",
    category: "ACADEMY",
    xpReward: 150,
    condition: (player, meta) => {
      const sessions = meta?.sessionCount ?? player._count?.attendances ?? 0;
      return sessions >= 10;
    },
  },
  {
    slug: "session_devoted",
    name: "Devoted Player",
    description: "Attended 50 training sessions",
    icon: "heart",
    category: "ACADEMY",
    xpReward: 400,
    condition: (player, meta) => {
      const sessions = meta?.sessionCount ?? player._count?.attendances ?? 0;
      return sessions >= 50;
    },
  },
  {
    slug: "level_5",
    name: "Rising Star",
    description: "Reached Level 5",
    icon: "star",
    category: "MILESTONE",
    xpReward: 0,
    condition: (player) => player.level >= 5,
  },
  {
    slug: "level_10",
    name: "All-Star",
    description: "Reached Level 10",
    icon: "crown",
    category: "MILESTONE",
    xpReward: 0,
    condition: (player) => player.level >= 10,
  },
];
