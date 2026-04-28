import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaTrophy } from "react-icons/fa";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { IoFootball } from "react-icons/io5";

// Status badge colour map
const statusStyles = (dm, status) => {
  const map = {
    UPCOMING: dm
      ? "text-[#00FF88] bg-[#00FF88]/10"
      : "text-green-600 bg-green-50",
    ONGOING: dm
      ? "text-yellow-400 bg-yellow-400/10"
      : "text-amber-600 bg-amber-50",
    COMPLETED: dm
      ? "text-gray-400 bg-gray-400/10"
      : "text-gray-500 bg-gray-100",
  };
  return map[status] || map.UPCOMING;
};

export default function HomeTournaments({ dm, tournaments = [], loading }) {
  const navigate = useNavigate();

  const liveCount = tournaments.filter(
    (t) => t.tournament?.status === "ONGOING"
  ).length;

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className={`h-8 w-52 rounded-lg mb-6 animate-pulse ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`rounded-2xl overflow-hidden border animate-pulse ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}
            >
              <div className={`h-36 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
              <div className="p-4 space-y-3">
                <div className={`h-4 w-3/4 rounded ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                <div className={`h-3 w-1/2 rounded ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────
  if (tournaments.length === 0) {
    return (
      <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          My Tournaments
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`group relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/20 hover:border-[#00FF88]/40 hover:bg-[#00FF88]/5" : "bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50"}`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaTrophy className={`text-9xl -rotate-12 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
          </div>

          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-3xl ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-white text-green-600"}`}>
              <IoFootball />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
              No tournaments yet
            </h3>
            <p className={`mb-6 max-w-md mx-auto text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              You aren't registered for any upcoming tournaments. Browse
              available tournaments and register your team to get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tournaments")}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg transition flex items-center gap-2 mx-auto ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-gray-900 text-white hover:bg-black"}`}
            >
              <FiSearch className="text-base" /> Find a Tournament
            </motion.button>
          </div>
        </motion.div>
      </section>
    );
  }

  // ── Populated state ───────────────────────────────────────────────────
  return (
    <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          My Tournaments{" "}
          {liveCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"}`}>
              {liveCount} Live
            </span>
          )}
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/tournaments")}
          className={`text-sm font-semibold flex items-center gap-1 ${dm ? "text-[#00FF88] hover:text-[#00FF88]/80" : "text-green-600 hover:text-green-700"}`}
        >
          Browse more <FiArrowRight />
        </motion.button>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible scrollbar-hide">
        {tournaments.map((entry) => {
          const t = entry.tournament;
          const team = entry.team;
          if (!t) return null;

          const dateStr = t.startDate
            ? new Date(t.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "";

          return (
            <motion.div
              key={entry.entryId}
              whileHover={{ y: -5 }}
              className={`min-w-[280px] snap-start rounded-2xl border shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer flex-shrink-0 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 hover:border-[#00FF88]/30" : "bg-white border-gray-100"}`}
              onClick={() => navigate(team ? `/my-tournaments/${team.id}` : `/tournament/${t.id}`)}
            >
              {/* Image / header */}
              <div className={`h-36 relative ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`}>
                {t.venueImage ? (
                  <img
                    src={t.venueImage}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-5xl ${dm ? "text-[#87A98D]/20" : "text-gray-300"}`}>
                    <FaTrophy />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-lg leading-tight truncate">
                    {t.name}
                  </h3>
                </div>
                {t.category && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium">
                    {t.category}
                  </div>
                )}
                {t.status === "ONGOING" && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    {t.location ? (
                      <>
                        <FaMapMarkerAlt className="text-[10px]" /> {t.location}
                      </>
                    ) : (
                      dateStr
                    )}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusStyles(dm, t.status)}`}>
                    {t.status}
                  </span>
                </div>

                {team && (
                  <p className={`text-xs font-medium truncate ${dm ? "text-gray-400" : "text-gray-600"}`}>
                    Playing for{" "}
                    <span className={`font-bold ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
                      {team.name}
                    </span>
                  </p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(team ? `/my-tournaments/${team.id}` : `/tournament/${t.id}`);
                  }}
                  className={`w-full py-2 rounded-lg border font-medium text-sm transition-colors ${dm ? "border-[#87A98D]/20 text-gray-400 group-hover:bg-[#00FF88] group-hover:text-[#121212] group-hover:border-[#00FF88]" : "border-gray-200 text-gray-700 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600"}`}
                >
                  View
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
