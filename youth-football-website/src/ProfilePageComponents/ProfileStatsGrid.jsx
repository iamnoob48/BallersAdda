import { motion } from "motion/react";
import { Flame, Zap, TrendingUp, Ruler, Weight, Footprints } from "lucide-react";
import { IoMdFootball } from "react-icons/io";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12500, 15000];

export default function ProfileStatsGrid({ dm, player, achievementData }) {
  if (!player) return null;

  const xp = achievementData?.xp ?? 0;
  const level = achievementData?.level ?? 1;
  const nextLevelXp = achievementData?.nextLevelXp;
  const currentStreak = achievementData?.currentStreak ?? 0;
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const progressXp = xp - currentLevelXp;
  const neededXp = nextLevelXp ? nextLevelXp - currentLevelXp : 1;
  const progressPct = nextLevelXp ? Math.min((progressXp / neededXp) * 100, 100) : 100;

  const physicalStats = [
    {
      label: "Height",
      value: player?.height ? `${player.height}` : "--",
      unit: "cm",
      icon: <Ruler className="w-5 h-5" />,
      color: dm ? "text-blue-400" : "text-blue-500",
      bg: dm ? "bg-blue-400/10" : "bg-blue-50",
    },
    {
      label: "Weight",
      value: player?.weight ? `${player.weight}` : "--",
      unit: "kg",
      icon: <Weight className="w-5 h-5" />,
      color: dm ? "text-amber-400" : "text-amber-500",
      bg: dm ? "bg-amber-400/10" : "bg-amber-50",
    },
    {
      label: "Foot",
      value: player?.dominantFoot || "--",
      unit: "",
      icon: <Footprints className="w-5 h-5" />,
      color: dm ? "text-[#00FF88]" : "text-green-600",
      bg: dm ? "bg-[#00FF88]/10" : "bg-green-50",
    },
  ];

  const infoGrid = [
    { label: "Full Name", value: `${player.firstName || ""} ${player.lastName || ""}`.trim() || "--" },
    { label: "Age", value: player.age ? `${player.age} Years` : "--" },
    { label: "Gender", value: player.gender || "--" },
    { label: "Experience", value: player.experienceLevel || "--", highlight: true },
  ];

  const stats = [
    {
      label: "Total XP",
      value: xp.toLocaleString(),
      icon: <Zap className="w-5 h-5" />,
      color: "#FF9600",
    },
    {
      label: "Streak",
      value: `${currentStreak}`,
      sub: "events",
      icon: <Flame className="w-5 h-5" />,
      color: "#FF3D00",
    },
    {
      label: "Matches",
      value: player?.tournamentsPlayed || 0,
      icon: <IoMdFootball className="text-xl" />,
      color: "#1CB0F6",
    },
    {
      label: "Rank",
      value: player?.regionalRank ? `#${player.regionalRank}` : "--",
      sub: "Regional",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "#CE82FF",
    },
  ];

  return (
    <div className="space-y-5">
      {/* XP Progress Bar */}
      <div
        className={`rounded-2xl p-5 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            dm
              ? "bg-[#00FF88] shadow-[0_3px_0_0_#00CC6A]"
              : "bg-green-600 shadow-[0_3px_0_0_#15803d]"
          }`}>
            <span className={`text-sm font-extrabold ${dm ? "text-[#121212]" : "text-white"}`}>{level}</span>
          </div>
          <div className="flex-1">
            <p className={`text-xs font-extrabold uppercase tracking-wider ${dm ? "text-[#00FF88]" : "text-green-600"}`}>
              Level {level}
            </p>
            <p className={`text-lg font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              {xp.toLocaleString()} XP
            </p>
          </div>
          {nextLevelXp && (
            <p className={`text-xs font-bold ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {nextLevelXp - xp} XP to Lvl {level + 1}
            </p>
          )}
        </div>
        <div className={`w-full h-4 rounded-full overflow-hidden ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.2, type: "spring", stiffness: 60 }}
            className={`h-full rounded-full relative ${
              dm
                ? "bg-gradient-to-r from-[#00FF88] to-[#00CC6A]"
                : "bg-gradient-to-r from-green-500 to-green-600"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
      </div>

      {/* Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`rounded-2xl p-4 cursor-default shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
              dm
                ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                : "bg-white border border-gray-200"
            }`}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              {s.value}
            </p>
            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              {s.label} {s.sub && <span className="normal-case font-semibold">· {s.sub}</span>}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Player Details Card */}
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <h3 className={`text-lg font-extrabold mb-4 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          Player Details
        </h3>

        {/* Physical Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {physicalStats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`rounded-xl p-4 text-center cursor-default ${
                dm ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {stat.value}
                {stat.unit && <span className={`text-xs font-bold ml-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{stat.unit}</span>}
              </p>
              <p className={`text-xs font-bold mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {infoGrid.map((item) => (
            <div key={item.label}>
              <p className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {item.label}
              </p>
              <p className={`text-sm font-extrabold mt-1 ${
                item.highlight
                  ? dm ? "text-[#00FF88]" : "text-green-600"
                  : dm ? "text-gray-100" : "text-gray-900"
              }`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="mt-5">
          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>Bio</p>
          {player.bio ? (
            <p className={`text-sm leading-relaxed ${dm ? "text-gray-400" : "text-gray-600"}`}>
              {player.bio}
            </p>
          ) : (
            <div className={`p-4 rounded-xl border-2 border-dashed text-center ${
              dm ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-400"
            }`}>
              <p className="text-sm font-semibold">No bio yet. Tell the world about your game!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
