import { motion } from "motion/react";
import { IoMdFootball } from "react-icons/io";
import { GiWhistle } from "react-icons/gi";
import { Calendar, Users } from "lucide-react";

export default function ProfileTournaments({ dm, tournaments }) {
  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <IoMdFootball className="text-xl text-blue-500" />
            </div>
            <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Tournaments
            </h3>
          </div>
          {tournaments?.length > 0 && (
            <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
              dm ? "text-[#00FF88] bg-[#00FF88]/10" : "text-green-600 bg-green-50"
            }`}>
              {tournaments.length} played
            </span>
          )}
        </div>
      </div>

      {tournaments?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tournaments.slice(0, 8).map((t, idx) => {
            const status = t.status || "COMPLETED";
            const isUpcoming = status === "UPCOMING";
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className={`rounded-2xl p-5 cursor-default transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
                  dm
                    ? "bg-[#1a1a1a] border border-[#87A98D]/15 hover:border-blue-500/30"
                    : "bg-white border border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-3 ${
                  isUpcoming
                    ? "bg-blue-500/10 text-blue-500"
                    : dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-50 text-green-600"
                }`}>
                  {isUpcoming ? "Upcoming" : "Completed"}
                </span>

                <h4 className={`font-extrabold text-sm mb-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  {t.name || t.tournament?.name || "Tournament"}
                </h4>

                <div className={`space-y-1.5 text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(t.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {t.position && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span className={`font-bold ${dm ? "text-[#00FF88]" : "text-green-600"}`}>{t.position}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div
          className={`rounded-2xl p-10 text-center shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
            dm
              ? "bg-[#1a1a1a] border border-[#87A98D]/15"
              : "bg-white border border-gray-200"
          }`}
        >
          <GiWhistle className={`text-5xl mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-sm font-extrabold ${dm ? "text-gray-400" : "text-gray-500"}`}>No tournaments played yet.</p>
          <p className={`text-xs mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Join a tournament to start tracking your journey!</p>
        </div>
      )}
    </div>
  );
}
