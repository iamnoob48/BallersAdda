// ── Performance ───────────────────────────────────────────────────────────
// Zone 3: Glory Metrics
// Four FIFA-style stat cards: Academy Caps, Goals & Assists, MOTM, Avg Rating.
// StatCard is a private helper kept in this file (only used here).
// UIUX: p-3 sm:p-4 padding, 2-col mobile / 4-col md+.

import { motion } from "framer-motion";
import { Target, Zap, Trophy, Star } from "lucide-react";

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, delay, dm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl p-3 sm:p-4 border text-center group transition-colors ${
        dm
          ? "bg-gradient-to-br from-[#1a1a1a] to-[#0a0f12] border-[#87A98D]/15 hover:border-[#00FF88]/30"
          : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-emerald-300 shadow-sm"
      }`}
    >
      {/* Background icon */}
      <div className={`absolute top-3 right-3 ${dm ? "text-[#00FF88]/20" : "text-emerald-100"}`}>
        <Icon className="w-8 h-8" />
      </div>

      <p className={`text-3xl font-black ${dm ? "text-white" : "text-gray-900"}`}>{value}</p>
      <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
        {label}
      </p>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
export default function Performance({ stats, isLoading, dm }) {
  if (isLoading) {
    return (
      <section aria-label="Academy performance stats">
        <div className={`h-5 w-44 rounded mb-4 animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${dm ? "bg-[#1a1a1a]" : "bg-gray-100"}`} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Academy performance stats">
      <h2 className={`text-lg font-bold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>
        Academy Performance
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Academy Caps"    value={stats.caps}                             icon={Target} delay={0.1} dm={dm} />
        <StatCard label="Goals & Assists" value={`${stats.goals}G ${stats.assists}A`}   icon={Zap}    delay={0.2} dm={dm} />
        <StatCard label="MOTM Awards"     value={stats.motm}                             icon={Trophy} delay={0.3} dm={dm} />
        <StatCard label="Avg Rating"      value={stats.avgRating.toFixed(1)}             icon={Star}   delay={0.4} dm={dm} />
      </div>
    </section>
  );
}
