import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";

export default function TournamentHero({ dm }) {
  return (
    <section className={`relative pt-8 pb-4 md:pt-10 md:pb-6 px-4 md:px-8 overflow-hidden ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      {/* Subtle ambient glow — keeps visual warmth without dominating */}
      <div className={`absolute -top-20 left-1/3 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none ${dm ? "bg-[#00FF88]/6" : "bg-green-200/30"}`} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {/* Left: Title + subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2.5 mb-1">
              <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-green-100"}`}>
                <GiTrophy className={`text-lg ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
              </div>
              <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>
                Tournaments
              </h1>
            </div>
            <p className={`text-sm md:text-base max-w-lg ${dm ? "text-gray-500" : "text-gray-500"}`}>
              Discover events, join leagues, and compete on the big stage.
            </p>
          </motion.div>

          {/* Right: Live indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto border ${dm ? "bg-[#00FF88]/8 border-[#00FF88]/15 text-[#00FF88]" : "bg-green-50 border-green-200 text-green-700"}`}
          >
            <FiTrendingUp className="text-sm" />
            Live Registrations
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dm ? "bg-[#00FF88]" : "bg-green-500"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dm ? "bg-[#00FF88]" : "bg-green-500"}`} />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
