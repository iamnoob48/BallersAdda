import { motion } from "motion/react";
import { Trophy, Lock } from "lucide-react";
import {
  Trophy as TrophyIcon, Award, School, Shield, Target, Flame, Zap, Diamond,
  Dumbbell, Heart, Star, Crown, UserCheck,
} from "lucide-react";
import { BADGE_CATALOG } from "../lib/badgeCatalog.js";

const ICON_MAP = {
  "user-check": UserCheck, trophy: TrophyIcon, award: Award, school: School,
  shield: Shield, target: Target, flame: Flame, zap: Zap, fire: Flame,
  diamond: Diamond, dumbbell: Dumbbell, heart: Heart, star: Star, crown: Crown,
};

const TIER_STYLES = {
  gold: {
    gradient: "from-yellow-400 to-amber-500",
    shadow: "shadow-[0_4px_0_0_#B8860B]",
    glow: "hover:shadow-[0_4px_12px_rgba(255,215,0,0.3)]",
  },
  silver: {
    gradient: "from-gray-300 to-gray-400",
    shadow: "shadow-[0_4px_0_0_#808080]",
    glow: "hover:shadow-[0_4px_12px_rgba(192,192,192,0.3)]",
  },
  bronze: {
    gradient: "from-orange-400 to-amber-600",
    shadow: "shadow-[0_4px_0_0_#8B4513]",
    glow: "hover:shadow-[0_4px_12px_rgba(205,127,50,0.3)]",
  },
  locked: {
    gradient: "from-gray-400 to-gray-500",
    shadow: "shadow-[0_4px_0_0_#555]",
    glow: "",
  },
};

const CAT_TIER = {
  TOURNAMENT: "gold",
  MILESTONE: "gold",
  STREAK: "bronze",
  ACADEMY: "silver",
  SOCIAL: "silver",
};

export default function ProfileBadgesRow({ dm, achievementData }) {
  const earnedBadges = achievementData?.badges ?? [];
  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));
  const earnedCount = earnedSlugs.size;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Badge Collection
            </h3>
          </div>
          <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
            dm ? "text-[#00FF88] bg-[#00FF88]/10" : "text-green-600 bg-green-50"
          }`}>
            {earnedCount}/{BADGE_CATALOG.length}
          </span>
        </div>
        <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>
          Earn badges by completing challenges and reaching milestones.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BADGE_CATALOG.map((badge) => {
          const earned = earnedSlugs.has(badge.slug);
          const Icon = ICON_MAP[badge.icon] || TrophyIcon;
          const tier = earned ? (CAT_TIER[badge.category] || "gold") : "locked";
          const style = TIER_STYLES[tier];

          return (
            <motion.div
              key={badge.slug}
              whileHover={earned ? { y: -6, rotate: 2 } : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`rounded-2xl p-4 flex flex-col items-center text-center cursor-default transition-shadow ${
                style.glow
              } ${
                dm
                  ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                  : "bg-white border border-gray-200"
              } ${earned ? "shadow-[0_4px_0_0_rgba(0,0,0,0.06)]" : "opacity-50"}`}
            >
              <div className="relative mb-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${style.gradient} ${style.shadow}`}>
                  <Icon className={`w-6 h-6 ${earned ? "text-white" : "text-gray-200"}`} />
                </div>
                {!earned && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-gray-300" />
                  </div>
                )}
              </div>
              <p className={`text-xs font-extrabold leading-tight ${
                earned
                  ? dm ? "text-gray-100" : "text-gray-900"
                  : dm ? "text-gray-500" : "text-gray-400"
              }`}>
                {badge.name}
              </p>
              <p className={`text-[10px] mt-1 leading-tight ${
                dm ? "text-gray-500" : "text-gray-400"
              }`}>
                {badge.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
