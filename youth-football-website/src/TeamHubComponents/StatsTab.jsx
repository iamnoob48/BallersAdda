import { FaChartBar, FaFutbol, FaTrophy } from "react-icons/fa";

// =====================================================================
//  Stats Tab
// =====================================================================
export function StatsTab({ dm, stats }) {
  if (stats.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <FaChartBar className={`text-4xl mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
        <p className={`font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>No stats recorded yet.</p>
        <p className={`text-sm mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>Stats will appear here once matches are played.</p>
      </div>
    );
  }

  // Sort by goals desc, then assists desc
  const sorted = [...stats].sort((a, b) => b.goals - a.goals || b.assists - a.assists);

  return (
    <div className={`rounded-2xl border overflow-hidden ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
      {/* Header row */}
      <div className={`grid grid-cols-12 gap-2 p-4 border-b text-[10px] font-bold uppercase tracking-widest ${dm ? "bg-[#121212] border-[#87A98D]/10 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
        <div className="col-span-5">Player</div>
        <div className="col-span-2 text-center">
          <FaFutbol className="inline text-[9px] mr-0.5" /> Goals
        </div>
        <div className="col-span-2 text-center">Assists</div>
        <div className="col-span-1 text-center">🟨</div>
        <div className="col-span-1 text-center">🟥</div>
        <div className="col-span-1 text-center">Rating</div>
      </div>

      {sorted.map((s, i) => {
        const name = s.player
          ? `${s.player.firstName || ""} ${s.player.lastName || ""}`.trim()
          : `#${s.playerId}`;

        return (
          <div
            key={s.id}
            className={`grid grid-cols-12 gap-2 p-4 items-center border-b last:border-0 transition-colors ${dm ? "border-[#87A98D]/10 hover:bg-white/[0.02]" : "border-gray-100 hover:bg-gray-50"}`}
          >
            <div className={`col-span-5 font-semibold text-sm truncate ${dm ? "text-gray-200" : "text-gray-800"}`}>
              {name}
              {i === 0 && s.goals > 0 && (
                <FaTrophy className="inline ml-1.5 text-yellow-400 text-xs" />
              )}
            </div>
            <div className={`col-span-2 text-center font-bold text-sm ${dm ? "text-gray-200" : "text-gray-800"}`}>
              {s.goals}
            </div>
            <div className={`col-span-2 text-center text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}>
              {s.assists}
            </div>
            <div className={`col-span-1 text-center text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}>
              {s.yellowCards}
            </div>
            <div className={`col-span-1 text-center text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}>
              {s.redCards}
            </div>
            <div className={`col-span-1 text-center text-sm font-mono font-bold ${dm ? "text-gray-300" : "text-gray-700"}`}>
              {s.rating > 0 ? s.rating.toFixed(1) : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
