import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { useGetAchievementsQuery } from "../redux/achievementsApi.js";
import {
  Trophy, Award, School, Shield, Target, Flame, Zap, Diamond,
  Dumbbell, Heart, Star, Crown, UserCheck, Lock, TrendingUp,
} from "lucide-react";
import { BADGE_CATALOG } from "../lib/badgeCatalog.js";

const ICON_MAP = {
  "user-check": UserCheck,
  trophy: Trophy,
  award: Award,
  school: School,
  shield: Shield,
  target: Target,
  flame: Flame,
  zap: Zap,
  fire: Flame,
  diamond: Diamond,
  dumbbell: Dumbbell,
  heart: Heart,
  star: Star,
  crown: Crown,
};

const CATEGORY_STYLES = {
  TOURNAMENT: {
    earnedDark: "bg-gradient-to-br from-purple-900/40 to-violet-900/30 border-2 border-purple-500/50 shadow-purple-900/20",
    earnedLight: "bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-300 shadow-purple-100",
    coinGradient: "bg-gradient-to-br from-purple-400 to-violet-500",
    iconEarned: "text-purple-950",
    nameDark: "text-purple-300",
    nameLight: "text-purple-800",
    dateDark: "text-purple-400/70",
    dateLight: "text-purple-600",
  },
  MILESTONE: {
    earnedDark: "bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border-2 border-yellow-500/50 shadow-yellow-900/20",
    earnedLight: "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-amber-100",
    coinGradient: "bg-gradient-to-br from-yellow-300 to-amber-500",
    iconEarned: "text-amber-900",
    nameDark: "text-yellow-300",
    nameLight: "text-amber-800",
    dateDark: "text-yellow-400/70",
    dateLight: "text-amber-600",
  },
  STREAK: {
    earnedDark: "bg-gradient-to-br from-orange-900/40 to-amber-900/30 border-2 border-orange-500/50 shadow-orange-900/20",
    earnedLight: "bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 shadow-orange-100",
    coinGradient: "bg-gradient-to-br from-orange-400 to-amber-500",
    iconEarned: "text-orange-950",
    nameDark: "text-orange-300",
    nameLight: "text-orange-800",
    dateDark: "text-orange-400/70",
    dateLight: "text-orange-600",
  },
  ACADEMY: {
    earnedDark: "bg-gradient-to-br from-emerald-900/40 to-green-900/30 border-2 border-emerald-500/50 shadow-emerald-900/20",
    earnedLight: "bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 shadow-emerald-100",
    coinGradient: "bg-gradient-to-br from-emerald-400 to-green-500",
    iconEarned: "text-emerald-950",
    nameDark: "text-emerald-300",
    nameLight: "text-emerald-800",
    dateDark: "text-emerald-400/70",
    dateLight: "text-emerald-600",
  },
  SOCIAL: {
    earnedDark: "bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-2 border-blue-500/50 shadow-blue-900/20",
    earnedLight: "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-blue-100",
    coinGradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
    iconEarned: "text-blue-950",
    nameDark: "text-blue-300",
    nameLight: "text-blue-800",
    dateDark: "text-blue-400/70",
    dateLight: "text-blue-600",
  },
};

const SectionWrapper = ({ children, dm }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className={`rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/20 shadow-green-950/20" : "bg-white border border-white shadow-gray-200/50"}`}
  >
    {children}
  </motion.div>
);

export default function Badges() {
  const dm = useSelector((state) => state.theme.darkMode);
  const { data, isLoading } = useGetAchievementsQuery();

  if (isLoading) {
    return (
      <SectionWrapper dm={dm}>
        <div className="flex items-center justify-center py-16">
          <div className={`animate-spin w-8 h-8 border-2 border-t-transparent rounded-full ${dm ? "border-yellow-400" : "border-amber-500"}`} />
        </div>
      </SectionWrapper>
    );
  }

  const xp = data?.xp ?? 0;
  const level = data?.level ?? 1;
  const nextLevelXp = data?.nextLevelXp;
  const currentStreak = data?.currentStreak ?? 0;
  const longestStreak = data?.longestStreak ?? 0;
  const earnedBadges = data?.badges ?? [];

  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));

  const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12500, 15000];
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const progressXp = xp - currentLevelXp;
  const neededXp = nextLevelXp ? nextLevelXp - currentLevelXp : 1;
  const progressPct = nextLevelXp ? Math.min((progressXp / neededXp) * 100, 100) : 100;

  return (
    <SectionWrapper dm={dm}>
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Level + XP */}
        <div className={`flex-1 rounded-2xl p-5 ${dm ? "bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-800/30" : "bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-amber-900">{level}</span>
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${dm ? "text-yellow-400/70" : "text-amber-600"}`}>Level</p>
              <p className={`text-lg font-bold ${dm ? "text-white" : "text-gray-900"}`}>{xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${dm ? "bg-gray-700" : "bg-amber-100"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
            />
          </div>
          {nextLevelXp && (
            <p className={`text-xs mt-1 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {nextLevelXp - xp} XP to Level {level + 1}
            </p>
          )}
        </div>

        {/* Streak */}
        <div className={`flex-1 rounded-2xl p-5 ${dm ? "bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-800/30" : "bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${dm ? "text-orange-400/70" : "text-orange-600"}`}>Streak</p>
              <p className={`text-lg font-bold ${dm ? "text-white" : "text-gray-900"}`}>{currentStreak} events</p>
            </div>
          </div>
          <p className={`text-xs mt-2 ${dm ? "text-gray-400" : "text-gray-500"}`}>
            Best: {longestStreak} events
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <h3 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
        <Trophy className="w-6 h-6 text-yellow-500" />
        Badges & Awards
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGE_CATALOG.map((badge) => {
          const earned = earnedSlugs.has(badge.slug);
          const earnedData = earnedBadges.find((b) => b.slug === badge.slug);
          const Icon = ICON_MAP[badge.icon] || Trophy;
          const cs = CATEGORY_STYLES[badge.category] || CATEGORY_STYLES.MILESTONE;

          return (
            <motion.div
              key={badge.slug}
              whileHover={earned ? { y: -5, rotate: 1 } : {}}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-4 text-center shadow-sm transition-all duration-300 ${
                earned
                  ? dm ? cs.earnedDark : cs.earnedLight
                  : dm
                    ? "bg-gray-800/50 border border-gray-700/50 opacity-50"
                    : "bg-gray-50 border border-gray-200 opacity-50"
              }`}
            >
              {!earned && (
                <div className="absolute top-2 right-2">
                  <Lock className={`w-3.5 h-3.5 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                </div>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                earned
                  ? `${cs.coinGradient} shadow-lg`
                  : dm ? "bg-gray-700" : "bg-gray-200"
              }`}>
                <Icon className={`w-6 h-6 ${earned ? cs.iconEarned : dm ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <span className={`text-xs font-bold uppercase ${
                earned
                  ? dm ? cs.nameDark : cs.nameLight
                  : dm ? "text-gray-500" : "text-gray-400"
              }`}>
                {badge.name}
              </span>
              <span className={`text-[10px] mt-0.5 ${
                earned
                  ? dm ? cs.dateDark : cs.dateLight
                  : dm ? "text-gray-600" : "text-gray-400"
              }`}>
                {earned && earnedData
                  ? new Date(earnedData.earnedAt).toLocaleDateString()
                  : badge.description}
              </span>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
