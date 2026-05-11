import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useGetUnreadAchievementsQuery,
  useMarkAchievementsReadMutation,
} from "../redux/achievementsApi.js";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Trophy, Award, School, Shield, Target, Flame, Zap, Diamond,
  Dumbbell, Heart, Star, Crown, UserCheck, ArrowUp,
} from "lucide-react";

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

const CATEGORY_COLORS = {
  TOURNAMENT: {
    coin: "bg-gradient-to-br from-purple-400 via-purple-500 to-violet-600",
    shadow: "shadow-[0_0_60px_rgba(168,85,247,0.6)]",
    border: "border-purple-300",
    glow: "bg-purple-400/30",
    label: "text-purple-400",
    iconColor: "text-purple-950",
    xpBg: "bg-purple-400/20",
    xpText: "text-purple-300",
  },
  MILESTONE: {
    coin: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500",
    shadow: "shadow-[0_0_60px_rgba(251,191,36,0.6)]",
    border: "border-yellow-200",
    glow: "bg-yellow-400/30",
    label: "text-yellow-400",
    iconColor: "text-amber-900",
    xpBg: "bg-yellow-400/20",
    xpText: "text-yellow-300",
  },
  STREAK: {
    coin: "bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600",
    shadow: "shadow-[0_0_60px_rgba(251,146,60,0.6)]",
    border: "border-orange-300",
    glow: "bg-orange-400/30",
    label: "text-orange-400",
    iconColor: "text-orange-950",
    xpBg: "bg-orange-400/20",
    xpText: "text-orange-300",
  },
  ACADEMY: {
    coin: "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600",
    shadow: "shadow-[0_0_60px_rgba(52,211,153,0.6)]",
    border: "border-emerald-300",
    glow: "bg-emerald-400/30",
    label: "text-emerald-400",
    iconColor: "text-emerald-950",
    xpBg: "bg-emerald-400/20",
    xpText: "text-emerald-300",
  },
  SOCIAL: {
    coin: "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600",
    shadow: "shadow-[0_0_60px_rgba(96,165,250,0.6)]",
    border: "border-blue-300",
    glow: "bg-blue-400/30",
    label: "text-blue-400",
    iconColor: "text-blue-950",
    xpBg: "bg-blue-400/20",
    xpText: "text-blue-300",
  },
};

const LEVEL_UP_COLORS = {
  coin: "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600",
  shadow: "shadow-[0_0_60px_rgba(34,211,238,0.6)]",
  border: "border-cyan-300",
  glow: "bg-cyan-400/30",
  label: "text-cyan-400",
};

export default function AchievementOverlay() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  const { data, refetch } = useGetUnreadAchievementsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });

  const [markRead] = useMarkAchievementsReadMutation();
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (isAuthenticated) refetch();
  }, [location.pathname, isAuthenticated, refetch]);

  useEffect(() => {
    if (data?.achievements?.length > 0) {
      setQueue((prev) => {
        const existingKeys = new Set(prev.map((a) => a.type === "level_up" ? `lvl_${a.level}` : `badge_${a.playerBadgeId}`));
        const newItems = data.achievements.filter((a) => {
          const key = a.type === "level_up" ? `lvl_${a.level}` : `badge_${a.playerBadgeId}`;
          return !existingKeys.has(key);
        });
        return [...prev, ...newItems];
      });
    }
  }, [data]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [current, queue]);

  const dismiss = useCallback(() => {
    if (!current) return;
    if (current.type === "level_up") {
      markRead({ levelUp: current.level });
    } else {
      markRead({ ids: [current.playerBadgeId] });
    }
    setCurrent(null);
  }, [current, markRead]);

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, 4500);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  const isLevelUp = current?.type === "level_up";
  const colors = isLevelUp
    ? LEVEL_UP_COLORS
    : CATEGORY_COLORS[current?.category] || CATEGORY_COLORS.MILESTONE;
  const IconComponent = isLevelUp
    ? ArrowUp
    : current ? ICON_MAP[current.icon] || Trophy : Trophy;
  const overlayKey = isLevelUp ? `lvl_${current.level}` : current?.playerBadgeId;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={overlayKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: isLevelUp ? 0 : 720 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.6 }}
            className="flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${colors.coin} ${colors.shadow} ${colors.border}`}>
                {isLevelUp ? (
                  <span className="text-white text-3xl font-black">{current.level}</span>
                ) : (
                  <IconComponent className={`w-12 h-12 ${colors.iconColor}`} />
                )}
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`absolute inset-0 rounded-full ${colors.glow}`}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="mt-6 text-center"
            >
              {isLevelUp ? (
                <>
                  <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${colors.label}`}>
                    Level Up!
                  </p>
                  <h2 className="text-white text-2xl font-bold mb-2">
                    Level {current.level}
                  </h2>
                  <p className="text-gray-300 text-sm mb-3">
                    You reached level {current.level}!
                  </p>
                </>
              ) : (
                <>
                  <p className={`text-sm font-semibold uppercase tracking-widest mb-1 ${colors.label}`}>
                    Achievement Unlocked
                  </p>
                  <h2 className="text-white text-2xl font-bold mb-2">
                    {current.name}
                  </h2>
                  <p className="text-gray-300 text-sm mb-3">
                    {current.description}
                  </p>
                  {current.xpReward > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.xpBg} ${colors.xpText}`}
                    >
                      +{current.xpReward} XP
                    </motion.span>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
