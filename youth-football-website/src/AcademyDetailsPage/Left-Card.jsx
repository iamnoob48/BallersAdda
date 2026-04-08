import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { useSelector } from "react-redux";

// --- CUSTOM SVG FOOTBALL COMPONENT ---
const FloatingFootball = ({ dm }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
    <defs>
      <linearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={dm ? "#1a1a1a" : "#ffffff"} />
        <stop offset="100%" stopColor={dm ? "#00FF88" : "#d1fae5"} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#ballGrad)" stroke={dm ? "#00FF88" : "#10b981"} strokeWidth="2" />
    <g fill={dm ? "#00FF88" : "#10b981"} opacity="0.8">
      <path d="M50 25 L73 42 L65 68 H35 L27 42 Z" fill={dm ? "#00FF88" : "#047857"} />
      <path d="M50 25 L50 2 M20 10 L27 42 M80 10 L73 42 M65 68 L85 90 M35 68 L15 90" stroke={dm ? "#00FF88" : "#10b981"} strokeWidth="2" fill="none" />
      <path d="M50 2 L30 8 L20 10 M50 2 L70 8 L80 10" stroke={dm ? "#00FF88" : "#10b981"} strokeWidth="2" fill="none" />
    </g>
  </svg>
);

const LeftCard = ({ ACADEMY_DATA }) => {
  const dm = useSelector((state) => state.theme.darkMode);
  const address = `${ACADEMY_DATA.academy.address}, ${ACADEMY_DATA.academy.city}, ${ACADEMY_DATA.academy.state}, ${ACADEMY_DATA.academy.country}`;
  
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-3 space-y-6"
    >
      {/* Main Profile Card */}
      <div className={`rounded-3xl p-6 shadow-sm border flex flex-col items-center text-center relative overflow-hidden group transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
        {/* Animated Header */}
        <div className={`absolute top-0 left-0 w-full h-32 -z-0 overflow-hidden ${dm ? "bg-[#00FF88]/5" : "bg-emerald-50/50"}`}>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(${dm ? "#00FF88" : "#10b981"} 1px, transparent 1px)`,
              backgroundSize: "12px 12px",
            }}
          ></div>

          <svg className="absolute inset-0 w-full h-full opacity-30">
            <motion.path
              d="M -10 20 Q 50 80 110 30"
              fill="none"
              stroke={dm ? "#00FF88" : "#059669"}
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>

          <motion.div
            className="absolute -right-6 -top-6 w-32 h-32 opacity-20"
            animate={{ y: [0, 15, 0], rotate: [0, 10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <FloatingFootball dm={dm} />
          </motion.div>

          <motion.div
            className={`absolute left-8 top-8 w-2 h-2 rounded-full ${dm ? "bg-[#00FF88]" : "bg-emerald-400"}`}
            animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 mt-4 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wide backdrop-blur-md px-3 py-1 rounded-full border shadow-sm ${dm ? "text-[#00FF88] bg-[#121212]/80 border-[#00FF88]/20" : "text-emerald-800 bg-white/80 border-emerald-100"}`}>
            14 People Interested
          </span>
        </div>

        <div className={`relative w-32 h-32 rounded-2xl p-1.5 shadow-xl mb-4 mt-2 border transform group-hover:scale-105 transition-transform duration-300 ${dm ? "bg-[#121212] shadow-[#00FF88]/5 border-[#87A98D]/20" : "bg-white shadow-emerald-100/50 border-emerald-50"}`}>
          <img
            src="https://images.unsplash.com/photo-1551966775-a4ddc8df052b?auto=format&fit=crop&q=80&w=200"
            alt="Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <h1 className={`text-2xl font-extrabold leading-tight mb-2 ${dm ? "text-gray-100" : "text-gray-900"}`}>
          {ACADEMY_DATA.academy.name} <br /> Academy
        </h1>

        <div className={`flex items-center gap-1.5 text-sm font-medium mb-6 px-3 py-1 rounded-lg ${dm ? "text-gray-400 bg-[#121212]" : "text-gray-500 bg-gray-50"}`}>
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className={dm ? "text-gray-300 font-bold" : "text-gray-900 font-bold"}></span>
          <span className={dm ? "text-gray-500" : "text-gray-400"}>{ACADEMY_DATA.academy.rating}</span>
          <span className={dm ? "text-gray-400" : "text-gray-600"}>124 Reviews</span>
        </div>

        {/* Sports Available */}
        <div className={`w-full border-t pt-6 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
          <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center justify-center gap-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
            <span>Sports Available</span>
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            {["Football", "Fitness", "Athletics"].map((sport) => (
              <span
                key={sport}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-default ${dm ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20 hover:bg-[#00FF88]/20" : "bg-emerald-50/50 text-emerald-800 border-emerald-100 hover:bg-emerald-100"}`}
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className={`rounded-3xl p-4 shadow-sm border transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}>
        <div className={`relative w-full h-48 rounded-2xl overflow-hidden group cursor-pointer border ${dm ? "bg-[#2a2a2a] border-[#87A98D]/15" : "bg-gray-200 border-gray-200"}`}>
          <img
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=600"
            alt="Map"
            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`backdrop-blur px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold border ${dm ? "bg-[#121212]/90 text-gray-200 border-[#87A98D]/20" : "bg-white/95 text-gray-800 border-gray-100"}`}
            >
              <MapPin className="w-4 h-4 text-red-500 fill-red-500" />
              View on Map
            </motion.div>
          </div>
        </div>
        <p className={`mt-4 text-xs text-center leading-relaxed px-4 font-medium ${dm ? "text-gray-500" : "text-gray-500"}`}>
          {address}
        </p>
      </div>
    </motion.aside>
  );
};

export default LeftCard;
