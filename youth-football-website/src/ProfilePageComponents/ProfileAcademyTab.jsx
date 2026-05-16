import { motion } from "motion/react";
import { Trophy, MapPin, Clock, School } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AcademyCard({ enrollment, dm, index }) {
  const { academy, status, joinedAt, leftAt } = enrollment;
  const isActive = status === "ACTIVE";
  const navigate = useNavigate();

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => isActive && navigate("/academy-dashboard")}
      className={`rounded-2xl p-5 transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
        isActive ? "cursor-pointer" : "cursor-default"
      } ${
        dm
          ? isActive
            ? "bg-[#1a1a1a] border border-[#00FF88]/20 hover:border-[#00FF88]/40"
            : "bg-[#1a1a1a] border border-[#87A98D]/15 opacity-70"
          : isActive
          ? "bg-white border border-green-200 hover:border-green-400"
          : "bg-white border border-gray-200 opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Crest */}
        <div
          className={`w-12 h-12 rounded-xl overflow-hidden border flex items-center justify-center shrink-0 ${
            dm ? "border-[#87A98D]/20 bg-[#121212]" : "border-gray-200 bg-gray-50"
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
              className={`w-5 h-5 ${
                isActive
                  ? dm ? "text-[#00FF88]" : "text-green-600"
                  : dm ? "text-gray-600" : "text-gray-300"
              }`}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className={`text-sm font-extrabold truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
              {academy?.name || "Academy"}
            </h4>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                isActive
                  ? dm
                    ? "bg-[#00FF88]/15 text-[#00FF88]"
                    : "bg-green-50 text-green-700"
                  : dm
                  ? "bg-gray-800 text-gray-500"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {isActive ? "Active" : "Former"}
            </span>
          </div>

          <div className={`flex items-center gap-3 flex-wrap text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
            {(academy?.city || academy?.state) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {[academy.city, academy.state].filter(Boolean).join(", ")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {joined}{left ? ` – ${left}` : " – Present"}
            </span>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between"
          style={{ borderColor: dm ? "rgba(135,169,141,0.15)" : "#e5e7eb" }}
        >
          <span className={`text-xs font-bold ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Tap to view dashboard
          </span>
          <span className={`text-xs font-extrabold ${dm ? "text-[#00FF88]" : "text-green-600"}`}>
            View →
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function ProfileAcademyTab({ dm, academyHistory, academyHistoryLoading }) {
  const navigate = useNavigate();
  const current = (academyHistory || []).filter((e) => e.status === "ACTIVE");
  const former = (academyHistory || []).filter((e) => e.status !== "ACTIVE");

  if (academyHistoryLoading) {
    return (
      <div className={`rounded-2xl p-10 text-center shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
        dm ? "bg-[#1a1a1a] border border-[#87A98D]/15" : "bg-white border border-gray-200"
      }`}>
        <div className="w-8 h-8 border-3 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto" />
        <p className={`text-sm font-bold mt-3 ${dm ? "text-gray-400" : "text-gray-500"}`}>Loading academy history...</p>
      </div>
    );
  }

  const hasHistory = current.length > 0 || former.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            dm ? "bg-[#00FF88]/10" : "bg-green-50"
          }`}>
            <School className={`w-5 h-5 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
          </div>
          <div>
            <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
              Academy History
            </h3>
            <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
              Your training journey across academies
            </p>
          </div>
        </div>
      </div>

      {!hasHistory ? (
        <div
          className={`rounded-2xl p-10 text-center shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
            dm
              ? "bg-[#1a1a1a] border border-[#87A98D]/15"
              : "bg-white border border-gray-200"
          }`}
        >
          <School className={`w-12 h-12 mx-auto mb-3 ${dm ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-sm font-extrabold ${dm ? "text-gray-300" : "text-gray-700"}`}>
            No Academy Joined
          </p>
          <p className={`text-xs mt-1 mb-5 ${dm ? "text-gray-500" : "text-gray-400"}`}>
            Find and join a football academy to level up your skills!
          </p>
          <motion.button
            whileTap={{ y: 4 }}
            onClick={() => navigate("/academies")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all active:shadow-none active:translate-y-[4px] ${
              dm
                ? "bg-[#00FF88] text-[#121212] shadow-[0_4px_0_0_#00CC6A] hover:bg-[#33FF9F]"
                : "bg-green-600 text-white shadow-[0_4px_0_0_#15803d] hover:bg-green-700"
            }`}
          >
            Explore Academies
          </motion.button>
        </div>
      ) : (
        <>
          {/* Current Academy */}
          {current.length > 0 && (
            <div className="space-y-3">
              <p className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
                dm ? "text-[#00FF88]" : "text-green-600"
              }`}>
                Current
              </p>
              {current.map((enrollment, i) => (
                <AcademyCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  dm={dm}
                  index={i}
                />
              ))}
            </div>
          )}

          {/* Former Academies */}
          {former.length > 0 && (
            <div className="space-y-3">
              <p className={`text-xs font-extrabold uppercase tracking-wider px-1 ${
                dm ? "text-gray-500" : "text-gray-400"
              }`}>
                Previous
              </p>
              {former.map((enrollment, i) => (
                <AcademyCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  dm={dm}
                  index={current.length + i}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
