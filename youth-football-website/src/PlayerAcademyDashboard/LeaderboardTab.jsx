// ── LeaderboardTab ────────────────────────────────────────────────────────
// Zone 4: Squad Leaderboard
// Ranked list of squad members sorted by match rating.
// Current user row is highlighted; close-gap badge appears when ≤0.3 behind
// the player directly above.
// UIUX: py-3 sm:py-2 + min-h-[48px] for 44px touch targets on mobile.
// close-gap badge uses shrink-0 to prevent clipping on small screens.

import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function LeaderboardTab({ leaderboard, profilePic, user, squad, dm }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      aria-label="Squad leaderboard"
      className={`rounded-2xl border overflow-hidden ${
        dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-3">
        <h2 className={`text-lg font-bold ${dm ? "text-white" : "text-gray-900"}`}>
          Squad Leaderboard
        </h2>
        <p className={`text-xs mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>
          {squad} &bull; Ranked by Match Rating
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {leaderboard.map((p, i) => {
          const abovePlayer = p.isUser && i > 0 ? leaderboard[i - 1] : null;
          const gap = abovePlayer ? (abovePlayer.rating - p.rating).toFixed(1) : null;
          const isCloseGap = gap !== null && parseFloat(gap) <= 0.3;

          return (
            <motion.div
              key={p.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-2 min-h-[48px] transition-colors ${
                p.isUser
                  ? dm
                    ? "bg-[#00FF88]/8 border-l-2 border-l-[#00FF88]"
                    : "bg-emerald-50/80 border-l-2 border-l-emerald-500"
                  : dm
                    ? `border-[#87A98D]/8 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"}`
                    : `border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`
              }`}
            >
              {/* Left: rank + avatar + name */}
              <div className="flex items-center gap-3">
                {/* Rank badge */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    p.rank === 1
                      ? "bg-yellow-500/15 text-yellow-500"
                      : p.rank === 2
                        ? dm ? "bg-gray-400/15 text-gray-400" : "bg-gray-200 text-gray-500"
                        : p.rank === 3
                          ? "bg-orange-500/15 text-orange-500"
                          : dm ? "bg-[#0a0f12] text-gray-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {p.rank}
                </div>

                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${
                    dm ? "bg-[#0a0f12]" : "bg-gray-100"
                  }`}
                >
                  {p.isUser ? (
                    <img
                      src={profilePic || user?.profilePic || "/default-avatar.png"}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center text-xs font-bold ${
                        dm ? "text-gray-600" : "text-gray-300"
                      }`}
                    >
                      {p.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <span
                  className={`text-sm font-semibold ${
                    p.isUser
                      ? dm ? "text-[#00FF88]" : "text-emerald-700"
                      : dm ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {p.isUser ? `${p.name} (You)` : p.name}
                </span>
              </div>

              {/* Right: close-gap badge + rating */}
              <div className="flex items-center gap-3">
                {p.isUser && isCloseGap && (
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ${
                      dm ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    <ChevronUp className="w-3 h-3" /> Close gap! ({gap})
                  </span>
                )}
                <span
                  className={`text-sm font-bold tabular-nums ${
                    p.isUser
                      ? dm ? "text-[#00FF88]" : "text-emerald-600"
                      : dm ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {p.rating.toFixed(1)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
