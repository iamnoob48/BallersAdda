import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useState } from "react";
import { FaTrophy, FaFutbol, FaMapMarkerAlt, FaFire } from "react-icons/fa";
import { GiSoccerKick, GiWhistle } from "react-icons/gi";

// --- Custom Components ---

// 1. The Tactical Pattern (Now used inside the floating card)
const TacticalPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-20"
    width="100%"
    height="100%"
  >
    <pattern
      id="tactical-grid"
      x="0"
      y="0"
      width="30"
      height="30"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 30 0 L 0 0 0 30"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
      />
    </pattern>
    <rect width="100%" height="100%" fill="url(#tactical-grid)" />
    {/* Center Circle & Lines */}
    <circle
      cx="50%"
      cy="50%"
      r="40"
      fill="none"
      stroke="white"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="50%"
      y1="0"
      x2="50%"
      y2="100%"
      stroke="white"
      strokeWidth="1"
      opacity="0.3"
    />
  </svg>
);

// 2. The Radar Chart
const StatRadar = () => {
  return (
    <div className="relative w-40 h-40 mx-auto mt-4">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-2xl"
      >
        {/* Background Pentagon */}
        <polygon
          points="50,5 95,35 80,90 20,90 5,35"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        {/* Data Shape (Animated) */}
        <motion.polygon
          initial={{ pathLength: 0, opacity: 0, scale: 0 }}
          animate={{ opacity: 0.9, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          points="50,15 85,40 70,80 30,80 15,40"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white tracking-widest">
        PAC
      </div>
      <div className="absolute top-[35%] right-0 translate-x-2 text-[10px] font-bold text-white tracking-widest">
        SHO
      </div>
      <div className="absolute bottom-0 right-2 text-[10px] font-bold text-white tracking-widest">
        PAS
      </div>
      <div className="absolute bottom-0 left-2 text-[10px] font-bold text-white tracking-widest">
        DRI
      </div>
      <div className="absolute top-[35%] left-0 -translate-x-2 text-[10px] font-bold text-white tracking-widest">
        PHY
      </div>
    </div>
  );
};

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function HeroHome() {
  const [academy, setAcademy] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dm = useSelector((state) => state.theme.darkMode);

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-white"}`}>
      {/* ================= Hero Section ================= */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative pt-24 pb-32 px-6 sm:px-12 md:px-20 overflow-visible"
      >
        {/* 🌈 Ambient Background */}
        <div className={`absolute inset-0 -z-20 ${dm ? "bg-gradient-to-br from-[#0a1a0f] via-[#121212] to-[#0f1f1a]" : "bg-gradient-to-br from-green-50 via-white to-emerald-100"}`} />

        {/* 💫 Animated Blobs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 ${dm ? "bg-gradient-to-bl from-[#00FF88]/10 to-[#00DCFF]/5" : "bg-gradient-to-bl from-green-200/40 to-emerald-300/30"}`}
        />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          {/* LEFT: Text Content */}
          <div className="flex-1 text-center md:text-left space-y-6 z-10">
            <motion.div
              variants={fadeInUp}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${dm ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20" : "bg-green-100/80 text-green-700 border-green-200"}`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${dm ? "bg-[#00FF88]" : "bg-green-600"}`}></span>
              Season 2026 Started
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className={`text-4xl md:text-6xl font-extrabold leading-[1.15] ${dm ? "text-gray-100" : "text-gray-900"}`}
            >
              Elevate Your <br />
              <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-600 to-emerald-500"}`}>
                Football Career
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className={`text-lg max-w-lg mx-auto md:mx-0 leading-relaxed ${dm ? "text-gray-400" : "text-gray-600"}`}
            >
              Track your stats, find top-rated academies, and climb the city
              leaderboard. Your journey to pro starts here.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: dm ? "0px 10px 20px rgba(0, 255, 136, 0.15)" : "0px 10px 20px rgba(22, 163, 74, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                <GiSoccerKick /> Join Tournament
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-sm transition-all border-2 ${dm ? "bg-transparent border-[#87A98D]/30 text-[#00FF88] hover:bg-[#00FF88]/10" : "bg-white border-green-100 text-green-700 hover:bg-green-50"}`}
              >
                Find Academy
              </motion.button>
            </motion.div>
          </div>

          {/* RIGHT: The Tactical Board */}
          <motion.div
            variants={fadeInUp}
            className="relative flex-1 w-full max-w-md"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className={`relative rounded-3xl p-1 shadow-2xl overflow-hidden ${dm ? "bg-gradient-to-br from-[#00FF88]/60 to-[#00DCFF]/40 shadow-[#00FF88]/10" : "bg-gradient-to-br from-green-600 to-emerald-800 shadow-green-200/50"}`}>
                <div className="relative bg-[#064e3b] rounded-[20px] p-6 text-white overflow-hidden">
                  <TacticalPattern />

                  <div className="relative z-10 flex justify-between items-center mb-2 border-b border-white/10 pb-4">
                    <div>
                      <p className={`text-xs font-bold tracking-wider uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>
                        Player Card
                      </p>
                      <h3 className="text-2xl font-bold">{user.username}</h3>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>
                        Rating
                      </p>
                      <div className="text-3xl font-bold bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">
                        8.2
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 py-2">
                    <StatRadar />
                  </div>

                  <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: "Matches", val: "12" },
                      { label: "Goals", val: "08" },
                      { label: "M.O.M", val: "3x" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center"
                      >
                        <p className={`text-[10px] font-bold uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>
                          {s.label}
                        </p>
                        <p className="text-xl font-bold mt-1">{s.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                </div>
              </div>

              <div className="absolute -z-10 top-10 -right-10 w-20 h-20 bg-yellow-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className={`absolute -z-10 -bottom-5 -left-5 w-32 h-32 rounded-full blur-3xl opacity-30 ${dm ? "bg-[#00FF88]" : "bg-green-400"}`}></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ================= Academy Status ================= */}
      <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h2 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>My Academy</h2>
          {academy && (
            <span className={`font-bold text-sm ${dm ? "text-[#00FF88]" : "text-green-600"}`}>
              Level 4 Certified
            </span>
          )}
        </div>

        {academy ? (
          <div className={`p-10 rounded-xl ${dm ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
            Academy Content Placeholder
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/20 hover:border-[#00FF88]/40 hover:bg-[#00FF88]/5" : "bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50"}`}
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${dm ? "text-[#00FF88]" : ""}`}>
              <FaMapMarkerAlt className={`text-9xl -rotate-12 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
            </div>

            <div className="relative z-10">
              <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-2xl ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-white text-green-600"}`}>
                <GiWhistle />
              </div>
              <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Free Agent?</h3>
              <p className={`mb-6 max-w-md mx-auto ${dm ? "text-gray-500" : "text-gray-500"}`}>
                You are currently not signed to any academy. Browse top-rated
                academies near you and request a trial.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-2.5 rounded-lg font-medium shadow-lg transition ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-gray-900 text-white hover:bg-black"}`}
              >
                Find Academies Nearby
              </motion.button>
            </div>
          </motion.div>
        )}
      </section>

      {/* ================= Upcoming Tournaments ================= */}
      <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          Upcoming Tournaments{" "}
          <span className={`text-xs px-2 py-0.5 rounded-full ${dm ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-600"}`}>
            2 Live
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`rounded-2xl border shadow-sm hover:shadow-xl transition-all overflow-hidden group cursor-pointer ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 hover:border-[#00FF88]/30" : "bg-white border-gray-100"}`}
            >
              <div className={`h-32 relative ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-bold text-lg">
                  Hyderabad Youth Cup
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                  U-15
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    <FaMapMarkerAlt /> Gachibowli Stadium
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${dm ? "text-[#00FF88] bg-[#00FF88]/10" : "text-green-600 bg-green-50"}`}>
                    Registering
                  </span>
                </div>
                <button className={`w-full py-2 rounded-lg border font-medium transition-colors ${dm ? "border-[#87A98D]/20 text-gray-400 group-hover:bg-[#00FF88] group-hover:text-[#121212] group-hover:border-[#00FF88]" : "border-gray-200 text-gray-700 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600"}`}>
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Leaderboard ================= */}
      <section className="mt-16 px-6 md:px-16 max-w-7xl mx-auto mb-20">
        <h2 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          Regional Leaderboard
        </h2>

        <div className={`border rounded-2xl shadow-sm overflow-hidden ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-4 p-4 border-b text-xs font-bold uppercase tracking-wider ${dm ? "bg-[#121212] border-[#87A98D]/10 text-gray-500" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
            <div className="col-span-1">#</div>
            <div className="col-span-6">Player</div>
            <div className="col-span-3 text-center">Rating</div>
            <div className="col-span-2 text-right">G / A</div>
          </div>

          {/* Rows */}
          {[
            { rank: 1, name: "Arjun Reddy", rating: 9.2, stats: "28/10" },
            { rank: 2, name: "Ishaan K", rating: 8.9, stats: "22/15" },
            {
              rank: 3,
              name: "You (Rahul)",
              rating: 8.2,
              stats: "12/7",
              isMe: true,
            },
            { rank: 4, name: "Vihaan S", rating: 7.8, stats: "10/12" },
          ].map((player, i) => (
            <motion.div
              key={i}
              whileHover={{
                backgroundColor: player.isMe
                  ? dm ? "rgba(0,255,136,0.05)" : "#f0fdf4"
                  : dm ? "rgba(255,255,255,0.02)" : "#f9fafb",
              }}
              className={`grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 transition-colors ${
                dm ? "border-[#87A98D]/10" : "border-gray-100"
              } ${
                player.isMe
                  ? dm ? "bg-[#00FF88]/5 ring-1 ring-inset ring-[#00FF88]/20" : "bg-green-50 ring-1 ring-inset ring-green-200"
                  : ""
              }`}
            >
              <div className={`col-span-1 font-bold ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {player.rank === 1 ? (
                  <FaTrophy className="text-yellow-400 text-lg" />
                ) : (
                  player.rank
                )}
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${dm ? "bg-[#2a2a2a] text-gray-400" : "bg-gray-200 text-gray-500"}`}>
                  {player.name.charAt(0)}
                </div>
                <span
                  className={`font-medium ${
                    player.isMe ? (dm ? "text-[#00FF88]" : "text-green-800") : (dm ? "text-gray-300" : "text-gray-700")
                  }`}
                >
                  {player.name}{" "}
                  {player.isMe && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 ${dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-green-200 text-green-800"}`}>
                      YOU
                    </span>
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
    </div>
  );
}
