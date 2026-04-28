import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { fetchPlayerProfile, fetchPlayerAcademy, fetchMyTournaments } from "../redux/slices/playerSlice";

// --- Tactical Pattern (inside player card) ---
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
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#tactical-grid)" />
    <circle cx="50%" cy="50%" r="40" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="1" opacity="0.3" />
  </svg>
);

// --- Radar Chart ---
const StatRadar = () => (
  <div className="relative w-40 h-40 mx-auto mt-4">
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-2xl">
      <polygon points="50,5 95,35 80,90 20,90 5,35" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
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
    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white tracking-widest">PAC</div>
    <div className="absolute top-[35%] right-0 translate-x-2 text-[10px] font-bold text-white tracking-widest">SHO</div>
    <div className="absolute bottom-0 right-2 text-[10px] font-bold text-white tracking-widest">PAS</div>
    <div className="absolute bottom-0 left-2 text-[10px] font-bold text-white tracking-widest">DRI</div>
    <div className="absolute top-[35%] left-0 -translate-x-2 text-[10px] font-bold text-white tracking-widest">PHY</div>
  </div>
);

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/**
 * HeroHome — Welcome hero section only.
 *
 * Also dispatches the data-fetching thunks (fetchPlayerProfile, fetchPlayerAcademy)
 * so the parent can pass the resolved data down to sibling sections.
 *
 * Props received from HomePageMain:
 *   - user, profile, academy, loading, dm
 */
export default function HeroHome({ user, profile, academy, loading, dm }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch player data once on mount
  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerAcademy());
    dispatch(fetchMyTournaments());
  }, [dispatch]);

  const firstName = user?.username?.split(" ")[0] || "Player";
  const hasAcademy = !!academy;
  const hasProfile = !!profile;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative pt-24 pb-32 px-6 sm:px-12 md:px-20 overflow-visible"
    >
      {/* Background */}
      <div className={`absolute inset-0 -z-20 ${dm ? "bg-gradient-to-br from-[#0a1a0f] via-[#121212] to-[#0f1f1a]" : "bg-gradient-to-br from-green-50 via-white to-emerald-100"}`} />
      <motion.div
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -z-10 ${dm ? "bg-gradient-to-bl from-[#00FF88]/10 to-[#00DCFF]/5" : "bg-gradient-to-bl from-green-200/40 to-emerald-300/30"}`}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* LEFT: Welcome + CTA */}
        <div className="flex-1 text-center md:text-left space-y-6 z-10">
          <motion.div variants={fadeInUp} className="space-y-3">
            <p className={`text-lg ${dm ? "text-gray-500" : "text-gray-500"}`}>
              {getGreeting()},
            </p>
            <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Welcome back,{" "}
              <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-600 to-emerald-500"}`}>
                {firstName} 👋
              </span>
            </h1>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: dm ? "0px 10px 20px rgba(0, 255, 136, 0.15)" : "0px 10px 20px rgba(22, 163, 74, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tournaments")}
              className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              Browse Tournaments
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => hasAcademy ? navigate("/my-academy") : navigate("/academies")}
              className={`px-8 py-3.5 rounded-xl font-bold text-lg shadow-sm transition-all border-2 ${dm ? "bg-transparent border-[#87A98D]/30 text-[#00FF88] hover:bg-[#00FF88]/10" : "bg-white border-green-100 text-green-700 hover:bg-green-50"}`}
            >
              {hasAcademy ? "View Academy" : "Find Academy"}
            </motion.button>
          </motion.div>

          {/* Complete profile CTA */}
          {!hasProfile && !loading && (
            <motion.div
              variants={fadeInUp}
              className={`mt-2 p-4 rounded-2xl border flex items-center justify-between gap-4 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <div>
                <h3 className={`font-bold text-sm ${dm ? "text-gray-100" : "text-gray-900"}`}>Complete your player profile</h3>
                <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>Add your position, stats, and bio.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile-complete")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 text-white"}`}
              >
                Complete <FiArrowRight />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Tactical Board */}
        <motion.div variants={fadeInUp} className="relative flex-1 w-full max-w-md">
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
                    <p className={`text-xs font-bold tracking-wider uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>Player Card</p>
                    <h3 className="text-2xl font-bold">{user?.username || "Player"}</h3>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>Rating</p>
                    <div className="text-3xl font-bold bg-white/10 px-3 py-1 rounded-lg backdrop-blur-md">8.2</div>
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
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                      <p className={`text-[10px] font-bold uppercase ${dm ? "text-[#00FF88]" : "text-green-300"}`}>{s.label}</p>
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
  );
}
