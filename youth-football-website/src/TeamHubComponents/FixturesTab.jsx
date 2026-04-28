import { FaMapMarkerAlt } from "react-icons/fa";
import { GiSoccerField } from "react-icons/gi";

// ── Match status badge helper ───────────────────────────────────────────
const matchStatusBadge = (dm, status) => {
  const map = {
    SCHEDULED: dm ? "text-gray-400" : "text-gray-500",
    IN_PROGRESS: dm ? "text-yellow-400" : "text-amber-600",
    COMPLETED: dm ? "text-[#00FF88]" : "text-green-600",
    CANCELLED: dm ? "text-red-400" : "text-red-500",
    POSTPONED: dm ? "text-orange-400" : "text-orange-500",
  };
  return map[status] || map.SCHEDULED;
};

// =====================================================================
//  Fixtures Tab
// =====================================================================
export function FixturesTab({ dm, fixtures, teamName, fmtDate, fmtTime }) {
  if (fixtures.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <GiSoccerField className={`text-5xl mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
        <p className={`font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>No fixtures scheduled yet.</p>
        <p className={`text-sm mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>Check back closer to the tournament start date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fixtures.map((m) => {
        const opponentName = m.opponent?.name || "TBD";
        const isHome = m.side === "home";

        return (
          <div
            key={m.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-shadow hover:shadow-md ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}
          >
            {/* Date pill */}
            <div className={`flex-shrink-0 text-center min-w-[56px] ${dm ? "text-gray-400" : "text-gray-500"}`}>
              <p className="text-[10px] font-bold uppercase">{fmtDate(m.kickoffAt)}</p>
              <p className={`text-xs font-semibold ${dm ? "text-gray-500" : "text-gray-400"}`}>{fmtTime(m.kickoffAt)}</p>
            </div>

            {/* Divider */}
            <div className={`w-px h-10 ${dm ? "bg-[#87A98D]/15" : "bg-gray-200"}`} />

            {/* Match info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {isHome ? (
                  <>{teamName} <span className={`text-xs font-normal ${dm ? "text-gray-500" : "text-gray-400"}`}>vs</span> {opponentName}</>
                ) : (
                  <>{teamName} <span className={`text-xs font-normal ${dm ? "text-gray-500" : "text-gray-400"}`}>@</span> {opponentName}</>
                )}
              </p>
              {m.venue && (
                <p className={`text-xs flex items-center gap-1 mt-0.5 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  <FaMapMarkerAlt className="text-[9px]" /> {m.venue}
                </p>
              )}
            </div>

            {/* Score or status */}
            <div className="flex-shrink-0 text-right">
              {m.status === "COMPLETED" ? (
                <div className={`text-lg font-black ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  {isHome ? `${m.homeScore} – ${m.awayScore}` : `${m.awayScore} – ${m.homeScore}`}
                </div>
              ) : (
                <span className={`text-[10px] font-bold uppercase ${matchStatusBadge(dm, m.status)}`}>
                  {m.status?.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
