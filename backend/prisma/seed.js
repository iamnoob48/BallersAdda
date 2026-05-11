import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const badges = [
  { slug: "profile_complete", name: "Profile Complete", description: "Completed your player profile", icon: "user-check", category: "MILESTONE", xpReward: 50 },
  { slug: "first_tournament", name: "First Tournament", description: "Joined your first tournament", icon: "trophy", category: "TOURNAMENT", xpReward: 75 },
  { slug: "tournament_veteran", name: "Tournament Veteran", description: "Joined 5 tournaments", icon: "award", category: "TOURNAMENT", xpReward: 200 },
  { slug: "academy_member", name: "Academy Member", description: "Joined an academy", icon: "school", category: "ACADEMY", xpReward: 100 },
  { slug: "team_captain", name: "Team Captain", description: "Captained a team", icon: "shield", category: "SOCIAL", xpReward: 150 },
  { slug: "first_goal", name: "First Goal", description: "Scored your first goal", icon: "target", category: "MILESTONE", xpReward: 50 },
  { slug: "goal_machine", name: "Goal Machine", description: "Scored 10 goals across all tournaments", icon: "flame", category: "MILESTONE", xpReward: 300 },
  { slug: "streak_7", name: "7-Day Streak", description: "Stayed active for 7 consecutive events", icon: "zap", category: "STREAK", xpReward: 100 },
  { slug: "streak_30", name: "30-Day Streak", description: "Stayed active for 30 consecutive events", icon: "fire", category: "STREAK", xpReward: 300 },
  { slug: "streak_90", name: "Iron Will", description: "Stayed active for 90 consecutive events", icon: "diamond", category: "STREAK", xpReward: 750 },
  { slug: "session_regular", name: "Regular Trainee", description: "Attended 10 training sessions", icon: "dumbbell", category: "ACADEMY", xpReward: 150 },
  { slug: "session_devoted", name: "Devoted Player", description: "Attended 50 training sessions", icon: "heart", category: "ACADEMY", xpReward: 400 },
  { slug: "level_5", name: "Rising Star", description: "Reached Level 5", icon: "star", category: "MILESTONE", xpReward: 0 },
  { slug: "level_10", name: "All-Star", description: "Reached Level 10", icon: "crown", category: "MILESTONE", xpReward: 0 },
];

async function main() {
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }
  console.log(`Seeded ${badges.length} badges`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
