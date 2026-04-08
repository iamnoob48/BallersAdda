import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AcademyListCard({ academy }) {
  const dm = useSelector((state) => state.theme.darkMode);
  const {
    name = "Unknown Academy",
    location = "Location not available",
    description = "A premier football academy focused on grassroots development and professional training.",
    image = "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop",
    rating = 4.5,
    features = ["Turf", "Night Lights"],
  } = academy || {};
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial="idle"
      whileHover="hover"
      className={`group relative flex flex-col md:flex-row w-full rounded-3xl overflow-hidden border transition-all duration-500 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,255,136,0.08)]" : "bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(22,163,74,0.1)]"}`}
    >
      {/* Tactical Border Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        <motion.rect
          width="100%"
          height="100%"
          rx="24"
          fill="none"
          stroke={dm ? "#00FF88" : "#84cc16"}
          strokeWidth="3"
          strokeDasharray="12 12"
          initial={{ pathLength: 0, opacity: 0 }}
          variants={{
            hover: { pathLength: 1, opacity: 1 },
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </svg>

      {/* IMAGE SECTION */}
      <div className="md:w-2/5 lg:w-1/3 relative h-64 md:h-auto overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <div className={`backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${dm ? "bg-[#121212]/80" : "bg-white/90"}`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? "text-gray-300" : "text-gray-800"}`}>
              Verified
            </span>
          </div>
        </div>

        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          variants={{
            idle: { scale: 1 },
            hover: { scale: 1.08 },
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent opacity-80" />

        <div className={`absolute bottom-4 left-4 md:hidden flex items-center gap-1 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold ${dm ? "bg-[#121212]/80 text-gray-200" : "bg-gray-900/80 text-white"}`}>
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {rating}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className={`flex-1 p-6 md:p-8 flex flex-col relative z-10 ${dm ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 mb-2">
              {features.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${dm ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20" : "bg-green-50 text-green-700 border-green-100"}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className={`text-2xl font-bold leading-tight transition-colors duration-300 ${dm ? "text-gray-100 group-hover:text-[#00FF88]" : "text-gray-900 group-hover:text-green-700"}`}>
              {name}
            </h3>

            <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <MapPin className={`w-4 h-4 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              {academy.address}
            </div>
          </div>

          {/* Desktop Rating Badge */}
          <div className="hidden md:flex flex-col items-end">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${dm ? "bg-yellow-500/10 border-yellow-500/20" : "bg-yellow-50 border-yellow-100"}`}>
              <span className={`text-sm font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>{rating}</span>
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            </div>
            <span className={`text-[10px] mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>120+ Reviews</span>
          </div>
        </div>

        <div className={`h-px w-full my-4 ${dm ? "bg-[#87A98D]/10" : "bg-gray-50"}`} />

        <p className={`text-sm leading-relaxed flex-1 ${dm ? "text-gray-400" : "text-gray-600"}`}>
          {description.length > 140
            ? `${description.slice(0, 140)}...`
            : description}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>
            <Zap className={`w-3.5 h-3.5 ${dm ? "text-[#00FF88]" : "text-lime-500"}`} />
            <span>Fast Response</span>
          </div>

          <motion.button
            className={`relative overflow-hidden px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 ${dm ? "bg-[#00FF88] text-[#121212] shadow-[#00FF88]/10 group-hover:shadow-[#00FF88]/20" : "bg-gray-900 text-white shadow-gray-200 group-hover:bg-green-600 group-hover:shadow-green-200"}`}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/academy/details/${academy.id}`)}
          >
            <span className="relative z-10">View Academy</span>
            <motion.span
              variants={{
                idle: { x: 0 },
                hover: { x: 4 },
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
