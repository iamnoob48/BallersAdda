// ── AcademyBanner ─────────────────────────────────────────────────────────
// B2B registration banner — shown when the logged-in player has no academy.
// Prompts academy owners/managers to register their club on BallersAdda.

import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AcademyBanner({ profile, user, dm }) {
  const navigate = useNavigate();

  // Hide for players who already belong to an academy, or for ACADEMY-role users
  if (profile?.academyId || user?.role === "ACADEMY") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 md:p-6 border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
        dm
          ? "bg-gradient-to-r from-[#1a1a1a] to-[#122218] border-[#00FF88]/20"
          : "bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200"
      }`}
    >
      <div className="text-center sm:text-left">
        <h3 className={`text-lg font-extrabold ${dm ? "text-[#00FF88]" : "text-emerald-800"}`}>
          For Academies: Register Your Club
        </h3>
        <p className={`text-sm mt-1 max-w-lg ${dm ? "text-gray-400" : "text-emerald-700/80"}`}>
          Are you an academy owner or manager? Bring your entire club to BallersAdda. Manage your
          rosters, set schedules, and track player performance in one ultimate dashboard.
        </p>
      </div>

      <button
        onClick={() => navigate("/register-academy")}
        className={`shrink-0 w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 ${
          dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"
        }`}
      >
        Start Free Setup <ChevronUp className="w-4 h-4 rotate-90" />
      </button>
    </motion.div>
  );
}
