import { motion } from "framer-motion";
import { useState } from "react";
import { useSelector } from "react-redux";
import { ChevronUp, Trophy } from "lucide-react";
import { useGetAcademyLeaderboardQuery } from "../redux/slices/leaderboardApi.js";

const SORT_OPTIONS = [
  { key: "composite", label: "Overall" },
  { key: "officialGoals", label: "Goals" },
  { key: "officialAssists", label: "Assists" },
  { key: "officialAvgRating", label: "Rating" },
];

const METRIC_BY_SORT = {
  composite: (s) => Number(s?.compositeScore ?? 0),
  officialGoals: (s) => Number(s?.officialGoals ?? 0),
  officialAssists: (s) => Number(s?.officialAssists ?? 0),
  officialAvgRating: (s) => Number(s?.officialAvgRating ?? 0),
};

function attendanceTone(rate, dm) {
  const pct = Math.round((rate ?? 0) * 100);
  if (pct >= 80) return { pct, cls: dm ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600" };
  if (pct >= 60) return { pct, cls: dm ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-500" };
  return { pct, cls: dm ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500" };
}

export default function LeaderboardTab({ academy, user, profilePic, dm }) {
  const [sortBy, setSortBy] = useState("composite");
  const profile = useSelector((s) => s.player.profile);
  const meId = profile?.id;

  const { data, isLoading, isFetching, isError, refetch } = useGetAcademyLeaderboardQuery(
    { academyId: academy?.id, sortBy, page: 1, limit: 20 },
    { skip: !academy?.id }
  );

  const rows = data?.leaderboard ?? [];
  const metricFn = METRIC_BY_SORT[sortBy] || METRIC_BY_SORT.composite;

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
      <div className="p-6 pb-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${dm ? "text-white" : "text-gray-900"}`}>
            <Trophy className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            Squad Leaderboard
          </h2>
          <p className={`text-xs mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>
            {data?.academyName || academy?.name || "Your academy"} &bull; Sorted by {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
          </p>
        </div>

        <div
          className={`inline-flex gap-1 p-1 rounded-full border overflow-x-auto scrollbar-none ${
            dm ? "bg-[#121212] border-[#87A98D]/15" : "bg-gray-100 border-gray-200"
          }`}
          role="tablist"
          aria-label="Sort leaderboard"
        >
          {SORT_OPTIONS.map((opt) => {
            const active = opt.key === sortBy;
            return (
              <button
                key={opt.key}
                role="tab"
                aria-selected={active}
                onClick={() => setSortBy(opt.key)}
                className={`shrink-0 min-h-[36px] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? dm
                      ? "bg-[#00FF88] text-[#121212]"
                      : "bg-emerald-600 text-white"
                    : dm
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="divide-y">
        {isLoading || isFetching ? (
          <Skeleton dm={dm} />
        ) : isError ? (
          <div className="p-6 text-center">
            <p className={`text-sm ${dm ? "text-gray-400" : "text-gray-500"}`}>Could not load leaderboard.</p>
            <button
              onClick={refetch}
              className={`mt-3 px-4 py-2 rounded-xl text-sm font-semibold ${
                dm ? "bg-[#00FF88]/15 text-[#00FF88] hover:bg-[#00FF88]/25" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className={`p-6 text-center text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
            No ranked players yet.
          </div>
        ) : (
          rows.map((p, i) => {
            const isUser = meId && p.player.id === meId;
            const above = isUser && i > 0 ? rows[i - 1] : null;
            const myMetric = metricFn(p.stats);
            const aboveMetric = above ? metricFn(above.stats) : null;
            const gap = aboveMetric !== null ? (aboveMetric - myMetric) : null;
            const isCloseGap = gap !== null && gap > 0 && gap <= 0.3;
            const ratingDisplay = Number(p.stats?.officialAvgRating ?? 0).toFixed(1);
            const attendance = attendanceTone(p.stats?.attendanceRate, dm);

            return (
              <motion.div
                key={p.player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-2 min-h-[48px] transition-colors ${
                  isUser
                    ? dm
                      ? "bg-[#00FF88]/8 border-l-2 border-l-[#00FF88]"
                      : "bg-emerald-50/80 border-l-2 border-l-emerald-500"
                    : dm
                      ? `border-[#87A98D]/8 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"}`
                      : `border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
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

                  <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${dm ? "bg-[#0a0f12]" : "bg-gray-100"}`}>
                    {isUser && (profilePic || user?.profilePic) ? (
                      <img
                        src={profilePic || user?.profilePic}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : p.player.profilePic ? (
                      <img
                        src={p.player.profilePic}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${dm ? "text-gray-600" : "text-gray-300"}`}>
                        {(p.player.displayName || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-sm font-semibold truncate block ${
                        isUser
                          ? dm ? "text-[#00FF88]" : "text-emerald-700"
                          : dm ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {isUser ? `${p.player.displayName} (You)` : p.player.displayName}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${dm ? "text-gray-600" : "text-gray-400"}`}>
                      {p.stats?.officialGoals ?? 0} G &bull; {p.stats?.officialAssists ?? 0} A
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${attendance.cls}`}>
                    {attendance.pct}%
                  </span>

                  {isUser && isCloseGap && (
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:flex items-center gap-1 whitespace-nowrap ${
                        dm ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-500"
                      }`}
                    >
                      <ChevronUp className="w-3 h-3" /> Close gap! ({gap.toFixed(1)})
                    </span>
                  )}

                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isUser
                        ? dm ? "text-[#00FF88]" : "text-emerald-600"
                        : dm ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {ratingDisplay}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}

function Skeleton({ dm }) {
  const bar = dm ? "bg-[#2a2a2a]" : "bg-gray-200";
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-3 sm:px-6 py-3 min-h-[48px]">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-lg animate-pulse ${bar}`} />
            <div className={`w-8 h-8 rounded-full animate-pulse ${bar}`} />
            <div className={`h-4 w-32 rounded animate-pulse ${bar}`} />
          </div>
          <div className={`h-4 w-10 rounded animate-pulse ${bar}`} />
        </div>
      ))}
    </>
  );
}
