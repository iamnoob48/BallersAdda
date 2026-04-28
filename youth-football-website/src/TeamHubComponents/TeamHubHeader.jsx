import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaInfoCircle,
  FaChartBar,
} from "react-icons/fa";
import { FiArrowLeft, FiExternalLink } from "react-icons/fi";

// ── Tab definitions ─────────────────────────────────────────────────────
export const TABS = [
  { key: "overview", label: "Overview", icon: FaInfoCircle },
  { key: "roster", label: "Roster", icon: FaUsers },
  { key: "fixtures", label: "Fixtures", icon: FaCalendarAlt },
  { key: "stats", label: "Stats", icon: FaChartBar },
];

// ── Status badge style helper ───────────────────────────────────────────
export const statusColor = (dm, status) => {
  const map = {
    UPCOMING: dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-100 text-green-700",
    ONGOING: dm ? "bg-yellow-500/10 text-yellow-400" : "bg-amber-100 text-amber-700",
    COMPLETED: dm ? "bg-gray-600/20 text-gray-400" : "bg-gray-100 text-gray-600",
  };
  return map[status] || map.UPCOMING;
};

// =====================================================================
//  TeamHubHeader — banner + floating info card + tab bar
// =====================================================================
export function TeamHubHeader({ dm, tournament, team, captain, activeTab, setActiveTab, onBack }) {
  return (
    <>
      {/* ── HEADER ────────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Background banner */}
        <div className={`h-48 sm:h-56 relative overflow-hidden ${dm ? "bg-[#0a1a0f]" : "bg-gradient-to-br from-green-600 to-emerald-800"}`}>
          {tournament.venueImage ? (
            <img src={tournament.venueImage} alt="" className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className={`absolute inset-0 ${dm ? "bg-gradient-to-br from-[#0a1a0f] via-[#121212] to-[#0f1f1a]" : ""}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white text-sm font-medium hover:bg-white/20 transition"
          >
            <FiArrowLeft /> Back
          </button>
        </div>

        {/* Floating info card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className={`rounded-2xl border p-5 sm:p-6 shadow-lg ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className={`text-xl sm:text-2xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    {tournament.name}
                  </h1>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(dm, tournament.status)}`}>
                    {tournament.status}
                  </span>
                </div>
                <p className={`text-sm font-medium ${dm ? "text-gray-400" : "text-gray-600"}`}>
                  Playing for{" "}
                  <span className={`font-bold ${dm ? "text-[#00FF88]" : "text-green-700"}`}>{team.name}</span>
                  {captain && (
                    <span className={`ml-2 text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
                      · Captain: {captain.username}
                    </span>
                  )}
                </p>
              </div>
              {tournament.category && (
                <span className={`self-start sm:self-center text-xs font-bold px-3 py-1 rounded-lg ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-100 text-green-700"}`}>
                  {tournament.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto scrollbar-hide ${dm ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? dm
                      ? "bg-[#00FF88] text-[#121212] shadow-lg shadow-[#00FF88]/10"
                      : "bg-white text-gray-900 shadow-md"
                    : dm
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="text-xs" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// =====================================================================
//  Overview Tab
// =====================================================================
export function OverviewTab({ dm, tournament, rulesArr, fmtDate }) {
  const card = `rounded-2xl border p-5 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`;
  const label = `text-xs font-bold uppercase tracking-wider mb-1 ${dm ? "text-gray-500" : "text-gray-400"}`;
  const value = `text-sm font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`;

  return (
    <div className="space-y-5">
      {/* Quick info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FaMapMarkerAlt, lbl: "Location", val: tournament.location || "TBD" },
          { icon: FaCalendarAlt, lbl: "Start Date", val: fmtDate(tournament.startDate) },
          { icon: FaCalendarAlt, lbl: "End Date", val: fmtDate(tournament.endDate) },
          { icon: FaUsers, lbl: "Max Players/Team", val: tournament.maxPlayersPerTeam ?? "—" },
        ].map((item, i) => (
          <div key={i} className={card}>
            <item.icon className={`text-lg mb-2 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
            <p className={label}>{item.lbl}</p>
            <p className={value}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {tournament.description && (
        <div className={card}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
            About the Tournament
          </h3>
          <p className={`text-sm leading-relaxed ${dm ? "text-gray-400" : "text-gray-600"}`}>
            {tournament.description}
          </p>
        </div>
      )}

      {/* Format & Rules */}
      {rulesArr.length > 0 && (
        <div className={card}>
          <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
            Format & Rules
          </h3>
          <ul className={`list-disc pl-5 space-y-1.5 text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}>
            {rulesArr.map((rule, i) => (
              <li key={i}>{rule}.</li>
            ))}
          </ul>
        </div>
      )}

      {/* Venue link */}
      {tournament.venueAddressLink && (
        <a
          href={tournament.venueAddressLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${dm ? "bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
        >
          <FaMapMarkerAlt /> Open Venue in Maps <FiExternalLink />
        </a>
      )}
    </div>
  );
}
