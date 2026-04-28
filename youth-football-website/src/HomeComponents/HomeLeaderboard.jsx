import { motion } from "framer-motion";
import { FaTrophy } from "react-icons/fa";

export default function HomeLeaderboard({ firstName, dm }) {
  return (
    <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto mb-20">
      <h2 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
        Regional Leaderboard
      </h2>

      <div className={`border rounded-2xl shadow-sm overflow-hidden ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <div className={`grid grid-cols-12 gap-4 p-4 border-b text-xs font-bold uppercase tracking-wider ${dm ? "bg-[#121212] border-[#87A98D]/10 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
          <div className="col-span-1">#</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-3 text-center">Rating</div>
          <div className="col-span-2 text-right">G / A</div>
        </div>

        {[
          { rank: 1, name: "Arjun Reddy", rating: 9.2, stats: "28/10" },
          { rank: 2, name: "Ishaan K", rating: 8.9, stats: "22/15" },
          { rank: 3, name: firstName, rating: 8.2, stats: "12/7", isMe: true },
          { rank: 4, name: "Vihaan S", rating: 7.8, stats: "10/12" },
        ].map((player, i) => (
          <motion.div
            key={i}
            whileHover={{
              backgroundColor: player.isMe
                ? dm ? "rgba(0,255,136,0.05)" : "#f0fdf4"
                : dm ? "rgba(255,255,255,0.02)" : "#f9fafb",
            }}
            className={`grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 transition-colors ${dm ? "border-[#87A98D]/10" : "border-gray-100"} ${
              player.isMe
                ? dm ? "bg-[#00FF88]/5 ring-1 ring-inset ring-[#00FF88]/20" : "bg-green-50 ring-1 ring-inset ring-green-200"
                : ""
            }`}
          >
            <div className={`col-span-1 font-bold ${dm ? "text-gray-500" : "text-gray-400"}`}>
              {player.rank === 1 ? <FaTrophy className="text-yellow-400 text-lg" /> : player.rank}
            </div>
            <div className="col-span-6 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                {player.name.charAt(0)}
              </div>
              <span className={`font-medium ${player.isMe ? (dm ? "text-[#00FF88]" : "text-green-800") : (dm ? "text-gray-300" : "text-gray-700")}`}>
                {player.name}{" "}
                {player.isMe && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-green-200 text-green-800"}`}>YOU</span>
                )}
              </span>
            </div>
            <div className={`col-span-3 text-center font-mono font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>
              {player.rating}
            </div>
            <div className={`col-span-2 text-right text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              {player.stats}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
