import { motion } from "framer-motion";
import { FaChartLine, FaMedal } from "react-icons/fa";
import { IoMdFootball } from "react-icons/io";
import { useSelector } from "react-redux";

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

const colorStyles = {
  dark: {
    blue:   "bg-blue-950/40 text-blue-400",
    green:  "bg-green-950/40 text-green-400",
    yellow: "bg-yellow-950/40 text-yellow-400",
    purple: "bg-purple-950/40 text-purple-400",
    red:    "bg-red-950/40 text-red-400",
  },
  light: {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red:    "bg-red-50 text-red-600",
  },
};

const StatCard = ({ label, value, sub, icon, color, dm }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`p-5 rounded-2xl shadow-sm text-center border ${dm ? "bg-[#1a1a1a] border-green-900/20" : "bg-white border-gray-100"}`}
  >
    {icon && (
      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-3 ${(dm ? colorStyles.dark : colorStyles.light)[color || "green"]}`}>
        {icon}
      </div>
    )}
    <div className={`text-2xl font-black ${dm ? "text-gray-100" : "text-gray-900"}`}>{value}</div>
    <div className={`text-xs font-bold uppercase tracking-wide mt-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
      {label} {sub}
    </div>
  </motion.div>
);

export default function Stats() {
  const dm     = useSelector((state) => state.theme.darkMode);
  const player = useSelector((state) => state.player.profile);

  return (
    <SectionWrapper dm={dm}>
      <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>Performance Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Matches"  value={player?.tournamentsPlayed || 0}  icon={<IoMdFootball />} color="blue"   dm={dm} />
        <StatCard label="Badges"   value={player?.badges || 0}             icon={<FaMedal />}      color="yellow" dm={dm} />
        <StatCard label="Rating"   value={player?.ratings || "N/A"}        icon={<FaChartLine />}  color="green"  dm={dm} />
        <StatCard label="Regional" value={`#${player?.regionalRank || "-"}`} sub="Rank"            color="purple" dm={dm} />
        <StatCard label="National" value={`#${player?.nationalRank || "-"}`} sub="Rank"            color="red"    dm={dm} />
      </div>
    </SectionWrapper>
  );
}
