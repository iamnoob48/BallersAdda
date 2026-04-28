// ── Attendance ────────────────────────────────────────────────────────────
// Zone 2: Training Consistency
//   - AttendanceRing  — animated circular progress (SVG)
//   - Recent Form     — last 5 session results (check / X)
//   - Streak counter  — consecutive sessions attended
//
// Layout: single column on mobile, 2-col on md, 3-col on lg.
// UIUX: ring is responsive (w-36→w-48), SVG is aria-hidden with sr-only label.

import { motion } from "framer-motion";
import { Flame, Check, X } from "lucide-react";

// ── Circular progress ring ────────────────────────────────────────────────
function AttendanceRing({ attended, total, dm }) {
  const pct = Math.round((attended / total) * 100);
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 mx-auto">
      {/* aria-hidden — decorative; sr-only label below carries the meaning */}
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none" strokeWidth="10"
          className={dm ? "stroke-[#2a3f30]" : "stroke-gray-200"}
        />
        {/* Progress */}
        <motion.circle
          cx="80" cy="80" r={radius}
          fill="none" strokeWidth="10" strokeLinecap="round"
          className={dm ? "stroke-[#00FF88]" : "stroke-emerald-500"}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>

      {/* Screen-reader label */}
      <span className="sr-only">
        {`Training attendance: ${attended} out of ${total} sessions, ${pct}%`}
      </span>

      {/* Visual label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className={`text-3xl font-extrabold ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
          {pct}%
        </span>
        <span className={`text-xs mt-0.5 ${dm ? "text-gray-500" : "text-gray-400"}`}>
          Attendance
        </span>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────
export default function Attendance({ attendance, recentForm, streak, isLoading, dm }) {
  if (isLoading) {
    return (
      <div className={`rounded-2xl border p-6 md:p-8 animate-pulse ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}>
        <div className={`h-5 w-44 rounded mb-6 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-40 rounded-xl ${dm ? "bg-[#2a2a2a]" : "bg-gray-100"}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      aria-label="Training consistency"
      className={`rounded-2xl border p-6 md:p-8 ${
        dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <h2 className={`text-lg font-bold mb-6 ${dm ? "text-white" : "text-gray-900"}`}>
        Training Consistency
      </h2>

      {/* 1-col mobile | 2-col tablet | 3-col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">

        {/* ── Attendance ring ── */}
        <div className="flex flex-col items-center">
          <AttendanceRing attended={attendance.attended} total={attendance.total} dm={dm} />
          <p className={`text-sm mt-3 text-center ${dm ? "text-gray-500" : "text-gray-400"}`}>
            {attendance.attended} of {attendance.total} sessions this month
          </p>
        </div>

        {/* ── Recent form ── */}
        <div className="flex flex-col items-center gap-4">
          <p className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-gray-600" : "text-gray-400"}`}>
            Recent Form
          </p>
          <div className="flex gap-2">
            {recentForm.map((hit, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 300 }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                  hit
                    ? dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-emerald-50 text-emerald-600"
                    : dm ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-400"
                }`}
              >
                {hit ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Streak ── */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              dm ? "bg-orange-500/10" : "bg-orange-50"
            }`}
          >
            <Flame className={`w-8 h-8 ${dm ? "text-orange-400" : "text-orange-500"}`} />
          </motion.div>
          <p className={`text-2xl font-black ${dm ? "text-white" : "text-gray-900"}`}>{streak}</p>
          <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Sessions in a Row</p>
        </div>
      </div>
    </motion.section>
  );
}
