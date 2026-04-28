import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";

// =====================================================================
//  Roster Tab
// =====================================================================
export function RosterTab({ dm, players, captain }) {
  if (players.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <FaUsers className={`text-4xl mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
        <p className={`font-semibold ${dm ? "text-gray-400" : "text-gray-500"}`}>No players on the roster yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((p) => {
        const pic = p.user?.profilePic;
        const isCaptain = captain && captain.id === p.userId;
        const initials = `${(p.firstName || "?")[0]}${(p.lastName || "?")[0]}`.toUpperCase();

        return (
          <motion.div
            key={p.id}
            whileHover={{ y: -3 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-shadow hover:shadow-lg ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}
          >
            {/* Avatar */}
            {pic ? (
              <img src={pic} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-transparent ring-[#00FF88]/30" />
            ) : (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {p.firstName} {p.lastName}
                {isCaptain && (
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${dm ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700"}`}>
                    C
                  </span>
                )}
              </p>
              {p.position && (
                <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  {p.position.replace(/_/g, " ")}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
