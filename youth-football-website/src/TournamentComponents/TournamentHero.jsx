import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WorldMap from "../components/WorldMap";

const WORLD_MAP_DOTS = [
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
    end: { lat: 34.0522, lng: -118.2437 },   // Los Angeles
  },
  {
    start: { lat: 64.2008, lng: -149.4937 }, // Alaska
    end: { lat: -15.7975, lng: -47.8919 },   // Brazil (Brasília)
  },
  {
    start: { lat: -15.7975, lng: -47.8919 }, // Brazil
    end: { lat: 38.7223, lng: -9.1393 },     // Lisbon
  },
  {
    start: { lat: 51.5074, lng: -0.1278 },   // London
    end: { lat: 28.6139, lng: 77.209 },      // New Delhi
  },
  {
    start: { lat: 28.6139, lng: 77.209 },    // New Delhi
    end: { lat: 43.1332, lng: 131.9113 },    // Vladivostok
  },
  {
    start: { lat: 28.6139, lng: 77.209 },    // New Delhi
    end: { lat: -1.2921, lng: 36.8219 },     // Nairobi
  },
];

export default function TournamentHero({ dm }) {
  const { scrollY } = useScroll();
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className={`relative h-[55vh] md:h-[65vh] flex items-center justify-center overflow-hidden ${dm ? "bg-[#0a0f12]" : "bg-white"}`}>
      {/* Breathing glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: dm ? [0.3, 0.6, 0.3] : [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute inset-0 blur-[100px] rounded-full ${dm ? "bg-green-500/20" : "bg-green-400/25"}`}
      />

      {/* Secondary accent glow */}
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1], opacity: dm ? [0.15, 0.35, 0.15] : [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-20 -right-20 w-[500px] h-[500px] blur-[120px] rounded-full ${dm ? "bg-[#00DCFF]/15" : "bg-emerald-300/20"}`}
      />

      {/* World Map background */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${dm ? "opacity-40" : "opacity-30"}`}>
        <div className="w-full max-w-6xl px-4">
          <WorldMap
            lineColor={dm ? "#00ff55" : "#006331"}
            dots={WORLD_MAP_DOTS}
          />
        </div>
      </div>

      {/* Text */}
      <motion.div
        style={{ y: heroTextY, opacity: heroOpacity }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight ${dm ? "text-white" : "text-gray-900"}`}
        >
          Compete on the <br />
          <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-600 to-emerald-500"}`}>
            Big Stage.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto ${dm ? "text-gray-400" : "text-gray-500"}`}
        >
          Discover tournaments, join leagues, and showcase your skills. The
          journey to pro starts here.
        </motion.p>
      </motion.div>

      {/* Bottom fade */}
      <div className={`absolute bottom-0 left-0 w-full h-32 z-10 pointer-events-none ${dm ? "bg-gradient-to-t from-[#121212] to-transparent" : "bg-gradient-to-t from-gray-50 to-transparent"}`} />
    </section>
  );
}
