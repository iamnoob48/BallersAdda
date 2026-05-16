import { motion } from "motion/react";
import { Trophy, Lock, Star } from "lucide-react";
import {
  WildfireIcon,
  SageIcon,
  ChampionIcon,
  FirstStepsIcon,
  TeamPlayerIcon,
  GoalMachineIcon,
  IronManIcon,
  RisingStarIcon,
  StreakIcon,
} from "./AchievementIcons";

const ACHIEVEMENTS = [
  { id: "wildfire", name: "Wildfire", description: "Maintain a 7-day activity streak", icon: "wildfire", tier: "bronze", maxProgress: 7 },
  { id: "sage", name: "Sage", description: "Reach Level 10 and earn wisdom", icon: "sage", tier: "gold", maxProgress: 10 },
  { id: "champion", name: "Champion", description: "Win 3 tournament titles", icon: "champion", tier: "gold", maxProgress: 3 },
  { id: "first_steps", name: "First Steps", description: "Complete your player profile", icon: "firstSteps", tier: "bronze", maxProgress: 1 },
  { id: "team_player", name: "Team Player", description: "Join 5 different teams", icon: "teamPlayer", tier: "silver", maxProgress: 5 },
  { id: "goal_machine", name: "Goal Machine", description: "Score 10 goals in tournaments", icon: "goalMachine", tier: "gold", maxProgress: 10 },
  { id: "iron_man", name: "Iron Man", description: "90 consecutive days active", icon: "ironMan", tier: "locked", maxProgress: 90 },
  { id: "rising_star", name: "Rising Star", description: "Reach Level 5", icon: "risingStar", tier: "gold", maxProgress: 5 },
  { id: "streak", name: "Streak Master", description: "30-day activity streak", icon: "streak", tier: "bronze", maxProgress: 30 },
];

const TIER_COLORS = {
  gold: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", bar: "from-yellow-400 to-amber-500" },
  silver: { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-500", bar: "from-gray-300 to-gray-400" },
  bronze: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500", bar: "from-orange-400 to-orange-600" },
  locked: { bg: "bg-gray-100", border: "border-gray-200", text: "text-gray-400", bar: "from-gray-300 to-gray-400" },
};

const TIER_COLORS_DM = {
  gold: { bg: "bg-amber-400/10", border: "border-amber-400/20", text: "text-amber-400", bar: "from-yellow-400 to-amber-500" },
  silver: { bg: "bg-gray-700/50", border: "border-gray-600", text: "text-gray-400", bar: "from-gray-400 to-gray-500" },
  bronze: { bg: "bg-orange-400/10", border: "border-orange-400/20", text: "text-orange-400", bar: "from-orange-400 to-orange-600" },
  locked: { bg: "bg-gray-800/50", border: "border-gray-700", text: "text-gray-500", bar: "from-gray-500 to-gray-600" },
};

const ICON_COMPONENTS = {
  wildfire: WildfireIcon,
  sage: SageIcon,
  champion: ChampionIcon,
  firstSteps: FirstStepsIcon,
  teamPlayer: TeamPlayerIcon,
  goalMachine: GoalMachineIcon,
  ironMan: IronManIcon,
  risingStar: RisingStarIcon,
  streak: StreakIcon,
};

export default function ProfilePersonalDetails({ dm, player, achievementData }) {
  if (!player) return null;

  const currentStreak = achievementData?.currentStreak ?? 0;
  const level = achievementData?.level ?? 1;

  const getProgress = (achievement) => {
    switch (achievement.id) {
      case "wildfire": return Math.min(currentStreak, 7);
      case "sage": return Math.min(level, 10);
      case "champion": return 0;
      case "first_steps": return player?.firstName ? 1 : 0;
      case "team_player": return Math.min(player?.tournamentsPlayed || 0, 5);
      case "goal_machine": return 0;
      case "iron_man": return Math.min(currentStreak, 90);
      case "rising_star": return Math.min(level, 5);
      case "streak": return Math.min(currentStreak, 30);
      default: return 0;
    }
  };

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            dm ? "bg-purple-400/10" : "bg-purple-50"
          }`}>
            <Star className={`w-5 h-5 ${dm ? "text-purple-400" : "text-purple-500"}`} />
          </div>
          <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
            Achievements
          </h3>
        </div>
        <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Track your progress and unlock achievements as you grow.
        </p>
      </div>

      <div className="space-y-3">
        {ACHIEVEMENTS.map((achievement, idx) => {
          const progress = getProgress(achievement);
          const pct = Math.min((progress / achievement.maxProgress) * 100, 100);
          const isLocked = achievement.tier === "locked" && progress === 0;
          const tierColor = (dm ? TIER_COLORS_DM : TIER_COLORS)[isLocked ? "locked" : achievement.tier];
          const IconComp = ICON_COMPONENTS[achievement.icon];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ x: 8 }}
              className={`rounded-2xl p-4 flex items-center gap-4 cursor-default transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
                dm
                  ? "bg-[#1a1a1a] border border-[#87A98D]/15 hover:border-l-4 hover:border-l-[#00FF88]"
                  : "bg-white border border-gray-200 hover:border-l-4 hover:border-l-green-600"
              } ${isLocked ? "opacity-60" : ""}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tierColor.bg} border ${tierColor.border} relative`}>
                {IconComp ? (
                  <IconComp className="w-7 h-7" />
                ) : (
                  <Trophy className={`w-5 h-5 ${tierColor.text}`} />
                )}
                {isLocked && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-extrabold text-sm ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    {achievement.name}
                  </h4>
                  <span className={`text-xs font-bold ${dm ? "text-gray-400" : "text-gray-500"}`}>
                    {progress}/{achievement.maxProgress}
                  </span>
                </div>
                <p className={`text-xs mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  {achievement.description}
                </p>
                <div className={`w-full h-3 rounded-full overflow-hidden ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 60, delay: idx * 0.05 }}
                    className={`h-full rounded-full bg-gradient-to-r ${tierColor.bar} relative`}
                  >
                    {pct > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
