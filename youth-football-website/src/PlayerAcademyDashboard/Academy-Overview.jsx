// ── Academy-Overview ──────────────────────────────────────────────────────
// Compact academy history cards — current academy + previous academies.
// Each card has a "View Performance" button.
// Props:
//   enrollments      – array from /player/academyHistory (sorted newest first)
//   onViewPerformance – callback(academyId) — parent switches to performance tab
//   dm               – dark mode flag

import { motion } from "framer-motion";
import { Trophy, MapPin, ChevronRight, Clock } from "lucide-react";

function AcademyCard({ enrollment, onViewPerformance, dm, index }) {
  const { academy, status, joinedAt, leftAt } = enrollment;
  const isActive = status === "ACTIVE";

  const joined = new Date(joinedAt).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
  const left = leftAt
    ? new Date(leftAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.015, y: -1 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        dm
          ? isActive
            ? "bg-[#1a1a1a] border-[#00FF88]/20"
            : "bg-[#141414] border-[#87A98D]/10"
          : isActive
          ? "bg-white border-emerald-200 shadow-sm"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Crest */}
      <div
        className={`w-10 h-10 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 ${
          dm
            ? "border-[#87A98D]/20 bg-[#0a0f12]"
            : "border-gray-200 bg-gray-100"
        }`}
      >
        {academy?.academyLogoURL ? (
          <img
            src={academy.academyLogoURL}
            alt={`${academy.name} crest`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Trophy
            className={`w-4 h-4 ${
              isActive
                ? dm
                  ? "text-[#00FF88]/60"
                  : "text-emerald-400"
                : dm
                ? "text-gray-600"
                : "text-gray-300"
            }`}
          />
        )}
      </div>

      {/* Academy info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-bold truncate ${
              dm ? "text-white" : "text-gray-900"
            }`}
          >
            {academy?.name || "Academy"}
          </p>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
              isActive
                ? dm
                  ? "bg-[#00FF88]/15 text-[#00FF88]"
                  : "bg-emerald-50 text-emerald-700"
                : dm
                ? "bg-gray-800 text-gray-500"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "Active" : "Former"}
          </span>
        </div>

        <div
          className={`flex items-center gap-1 mt-0.5 ${
            dm ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {(academy?.city || academy?.state) && (
            <>
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="text-xs truncate">
                {[academy.city, academy.state].filter(Boolean).join(", ")}
              </span>
              <span className="text-xs mx-1">·</span>
            </>
          )}
          <Clock className="w-3 h-3 shrink-0" />
          <span className="text-xs">
            {joined}
            {left ? ` – ${left}` : " – Present"}
          </span>
        </div>
      </div>

      {/* View Performance button */}
      <motion.button
        whileHover={isActive ? { scale: 1.06 } : undefined}
        whileTap={isActive ? { scale: 0.95 } : undefined}
        onClick={() => onViewPerformance(academy?.id, isActive)}
        disabled={!isActive}
        className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isActive
            ? dm
              ? "bg-[#00FF88]/15 text-[#00FF88] hover:bg-[#00FF88]/25"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : dm
            ? "bg-transparent text-gray-700 cursor-not-allowed"
            : "bg-transparent text-gray-300 cursor-not-allowed"
        }`}
        title={
          isActive
            ? "View performance stats"
            : "Performance data available for current academy only"
        }
      >
        {isActive ? (
          <>
            Stats <ChevronRight className="w-3 h-3" />
          </>
        ) : (
          "Former"
        )}
      </motion.button>
    </motion.div>
  );
}

export default function AcademyOverview({
  enrollments = [],
  onViewPerformance,
  dm,
}) {
  if (!enrollments.length) return null;

  const current = enrollments.filter((e) => e.status === "ACTIVE");
  const former = enrollments.filter((e) => e.status !== "ACTIVE");
  const hasPrevious = former.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Academy history"
      className={`rounded-2xl border p-4 ${
        dm
          ? "bg-[#1a1a1a] border-[#87A98D]/15"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Header */}
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
          dm ? "text-gray-600" : "text-gray-400"
        }`}
      >
        Academy History
      </p>

      <div className="space-y-2">
        {/* Current academy first */}
        {current.map((enrollment, i) => (
          <AcademyCard
            key={enrollment.id}
            enrollment={enrollment}
            onViewPerformance={onViewPerformance}
            dm={dm}
            index={i}
          />
        ))}

        {/* Previous academies — only rendered when they exist */}
        {hasPrevious && (
          <>
            {current.length > 0 && (
              <p
                className={`text-[10px] font-semibold uppercase tracking-wider pt-1 ${
                  dm ? "text-gray-700" : "text-gray-300"
                }`}
              >
                Previous
              </p>
            )}
            {former.map((enrollment, i) => (
              <AcademyCard
                key={enrollment.id}
                enrollment={enrollment}
                onViewPerformance={onViewPerformance}
                dm={dm}
                index={current.length + i}
              />
            ))}
          </>
        )}
      </div>
    </motion.section>
  );
}
