import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { FaTrophy } from "react-icons/fa";
import { useGetPlayerLeaderboardQuery } from "../redux/slices/leaderboardApi.js";

const POSITION_OPTIONS = [
  { key: "OVERALL", label: "Overall", value: "OVERALL" },
  { key: "GK", label: "GK", value: "GOALKEEPER" },
  { key: "DEF", label: "DEF", value: "DEFENDER" },
  { key: "MID", label: "MID", value: "MIDFIELDER" },
  { key: "ATT", label: "ATT", value: "ATTACKER" },
];

export default function HomeLeaderboard({ firstName, dm, profile }) {
  const [activePos, setActivePos] = useState("OVERALL");
  const meId = useSelector((s) => s.player.profile?.id);

  const hasCity = !!profile?.city;
  const queryArgs = {
    scope: hasCity ? "REGIONAL" : "NATIONAL",
    scopeValue: hasCity ? profile.city : undefined,
    position: POSITION_OPTIONS.find((p) => p.key === activePos)?.value || "OVERALL",
    page: 1,
    limit: 5,
  };

  const { data, isLoading, isFetching, isError } = useGetPlayerLeaderboardQuery(queryArgs);

  const rows = data?.leaderboard ?? [];
  const headerLabel = hasCity ? `${profile.city} Leaderboard` : "National Leaderboard";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16 px-6 md:px-16 max-w-7xl mx-auto mb-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
            {headerLabel}
          </h2>
          <p className={`text-xs mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Top performers, updated live
          </p>
        </div>

        <div
          className={`inline-flex gap-1 p-1 rounded-full border overflow-x-auto scrollbar-none ${
            dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-gray-100 border-gray-200"
          }`}
          role="tablist"
          aria-label="Filter by position"
        >
          {POSITION_OPTIONS.map((opt) => {
            const active = opt.key === activePos;
            return (
              <button
                key={opt.key}
                onClick={() => setActivePos(opt.key)}
                role="tab"
                aria-selected={active}
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

      <div
        className={`border rounded-2xl shadow-sm overflow-hidden ${
          dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`grid grid-cols-12 gap-4 p-4 border-b text-xs font-bold uppercase tracking-wider ${
            dm ? "bg-[#121212] border-[#87A98D]/10 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-3 text-center">Rating</div>
          <div className="col-span-2 text-right">G / A</div>
        </div>

        {isLoading || isFetching ? (
          <SkeletonRows dm={dm} />
        ) : isError ? (
          <div className={`p-6 text-center text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Could not load leaderboard.
          </div>
        ) : rows.length === 0 ? (
          <div className={`p-6 text-center text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
            No ranked players yet for this filter.
          </div>
        ) : (
          rows.map((row, i) => {
            const isMe = meId && row.player.id === meId;
            const initial = (row.player.displayName || "?").charAt(0).toUpperCase();
            return (
              <motion.div
                key={row.player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                whileHover={{
                  backgroundColor: isMe
                    ? dm ? "rgba(0,255,136,0.05)" : "#f0fdf4"
                    : dm ? "rgba(255,255,255,0.02)" : "#f9fafb",
                }}
                className={`grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 min-h-[48px] transition-colors ${
                  dm ? "border-[#87A98D]/10" : "border-gray-100"
                } ${
                  isMe
                    ? dm
                      ? "bg-[#00FF88]/5 ring-1 ring-inset ring-[#00FF88]/20"
                      : "bg-green-50 ring-1 ring-inset ring-green-200"
                    : ""
                }`}
              >
                <div className={`col-span-1 font-bold ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  {row.rank === 1 ? <FaTrophy className="text-yellow-400 text-lg" /> : row.rank}
                </div>

                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  {row.player.profilePic ? (
                    <img
                      src={row.player.profilePic}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {initial}
                    </div>
                  )}
                  <span
                    className={`font-medium truncate ${
                      isMe
                        ? dm ? "text-[#00FF88]" : "text-green-800"
                        : dm ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {isMe ? firstName : row.player.displayName}
                    {isMe && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${
                          dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-green-200 text-green-800"
                        }`}
                      >
                        YOU
                      </span>
                    )}
                  </span>
                </div>

                <div className={`col-span-3 text-center font-mono font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>
                  {Number(row.stats.avgRating ?? 0).toFixed(1)}
                </div>
                <div className={`col-span-2 text-right text-sm tabular-nums ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  {row.stats.totalGoals}/{row.stats.totalAssists}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.section>
  );
}

function SkeletonRows({ dm }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 min-h-[48px] ${
            dm ? "border-[#87A98D]/10" : "border-gray-100"
          }`}
        >
          <div className="col-span-1">
            <div className={`h-4 w-4 rounded animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
          </div>
          <div className="col-span-6 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
            <div className={`h-4 w-32 rounded animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
          </div>
          <div className="col-span-3 flex justify-center">
            <div className={`h-4 w-10 rounded animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
          </div>
          <div className="col-span-2 flex justify-end">
            <div className={`h-4 w-12 rounded animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
          </div>
        </div>
      ))}
    </>
  );
}
