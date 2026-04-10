import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchPlayerProfile, fetchPlayerAcademy } from "../redux/slices/playerSlice";
import {
  Flame,
  Trophy,
  Target,
  Star,
  ChevronUp,
  ArrowLeft,
  Zap,
  Check,
  X,
} from "lucide-react";

// ── Mock data (replace with API once backend supports it) ────────────────
const MOCK = {
  squad: "U-15 Elite Squad",
  status: "Active Roster",
  attendance: { attended: 17, total: 20 },
  recentForm: [true, true, false, true, true],
  streak: 5,
  stats: {
    caps: 23,
    goals: 8,
    assists: 12,
    motm: 4,
    avgRating: 7.6,
  },
  leaderboard: [
    { rank: 1, name: "Arjun Mehta", rating: 8.4, avatar: null },
    { rank: 2, name: "Ravi Singh", rating: 8.1, avatar: null },
    { rank: 3, name: "Karthik Nair", rating: 7.9, avatar: null },
    { rank: 4, name: "You", rating: 7.6, avatar: null, isUser: true },
    { rank: 5, name: "Aditya Sharma", rating: 7.5, avatar: null },
    { rank: 6, name: "Prateek Joshi", rating: 7.2, avatar: null },
    { rank: 7, name: "Vikram Patel", rating: 6.9, avatar: null },
  ],
};

// ── Circular progress ring ───────────────────────────────────────────────
const AttendanceRing = ({ attended, total, dm }) => {
  const pct = Math.round((attended / total) * 100);
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="10"
          className={dm ? "stroke-[#1a2a1f]" : "stroke-gray-100"} />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none" strokeWidth="10" strokeLinecap="round"
          className={dm ? "stroke-[#00FF88]" : "stroke-emerald-500"}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-extrabold ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>{pct}%</span>
        <span className={`text-xs mt-0.5 ${dm ? "text-gray-500" : "text-gray-400"}`}>Attendance</span>
      </div>
    </div>
  );
};

// ── FIFA-style stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, delay, dm }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`relative overflow-hidden rounded-2xl p-5 border text-center group transition-colors ${
      dm
        ? "bg-gradient-to-br from-[#1a1a1a] to-[#0a0f12] border-[#87A98D]/15 hover:border-[#00FF88]/30"
        : "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-emerald-300 shadow-sm"
    }`}
  >
    <div className={`absolute top-3 right-3 ${dm ? "text-[#00FF88]/20" : "text-emerald-100"}`}>
      <Icon className="w-8 h-8" />
    </div>
    <p className={`text-3xl font-black ${dm ? "text-white" : "text-gray-900"}`}>{value}</p>
    <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────────────────
export default function PlayerAcademyDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);
  const { profile, profilePic, academy, loading } = useSelector((s) => s.player);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerAcademy());
  }, [dispatch]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-10 h-10 border-4 rounded-full ${dm ? "border-[#00FF88] border-t-transparent" : "border-emerald-500 border-t-transparent"}`}
        />
      </div>
    );
  }

  const playerName = profile ? `${profile.firstName} ${profile.lastName}` : user?.name || "Player";
  const lb = MOCK.leaderboard.map((p) =>
    p.isUser ? { ...p, name: profile?.firstName || "You", rating: MOCK.stats.avgRating } : p
  );

  return (
    <div className={`min-h-screen py-6 px-4 md:px-8 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back */}
        <button onClick={() => navigate("/home")}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${dm ? "text-gray-500 hover:text-[#00FF88]" : "text-gray-400 hover:text-emerald-600"}`}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* ══════ B2B REGISTRATION BANNER ══════ */}
        {(!profile?.academyId && user?.role !== "ACADEMY") && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 md:p-6 border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${dm ? "bg-gradient-to-r from-[#1a1a1a] to-[#122218] border-[#00FF88]/20" : "bg-gradient-to-r from-emerald-50 to-green-100 border-emerald-200"}`}
          >
            <div>
              <h3 className={`text-lg font-extrabold ${dm ? "text-[#00FF88]" : "text-emerald-800"}`}>For Academies: Register Your Club</h3>
              <p className={`text-sm mt-1 max-w-lg ${dm ? "text-gray-400" : "text-emerald-700/80"}`}>
                Are you an academy owner or manager? Bring your entire club to BallersAdda. Manage your rosters, set schedules, and track player performance in one ultimate dashboard.
              </p>
            </div>
            <button 
              onClick={() => navigate("/register-academy")}
              className={`shrink-0 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-emerald-600 text-white"}`}
            >
              Start Free Setup <ChevronUp className="w-4 h-4 rotate-90" />
            </button>
          </motion.div>
        )}

        {/* ══════ ZONE 1: Identity Header ══════ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 md:p-8 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Player */}
            <div className="flex items-center gap-4">
              <div className={`relative w-16 h-16 rounded-full overflow-hidden ring-2 ${dm ? "ring-[#00FF88]/40" : "ring-emerald-300"}`}>
                <img src={profilePic || user?.profilePic || "/default-avatar.png"} alt="avatar"
                  className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className={`absolute inset-0 rounded-full ring-2 ring-inset ${dm ? "ring-[#00FF88]/20" : "ring-emerald-200/50"}`} />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${dm ? "text-white" : "text-gray-900"}`}>{playerName}</h1>
                <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  {profile?.position || "Player"} • {MOCK.squad}
                </p>
              </div>
            </div>

            {/* Center: Status */}
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-emerald-50 text-emerald-700"}`}>
              {MOCK.status}
            </span>

            {/* Right: Academy */}
            <div className="flex items-center gap-3">
              <div>
                <p className={`text-xs text-right ${dm ? "text-gray-600" : "text-gray-400"}`}>Academy</p>
                <p className={`font-bold text-right ${dm ? "text-white" : "text-gray-900"}`}>{academy?.name || "Academy"}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl overflow-hidden border flex items-center justify-center ${dm ? "border-[#87A98D]/20 bg-[#0a0f12]" : "border-gray-200 bg-gray-50"}`}>
                {academy?.academyLogoURL ? (
                  <img src={academy.academyLogoURL} alt="crest" className="w-full h-full object-cover" />
                ) : (
                  <Trophy className={`w-6 h-6 ${dm ? "text-[#00FF88]/40" : "text-emerald-200"}`} />
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════ ZONE 2: Grind Engine ══════ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-2xl border p-6 md:p-8 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"}`}>
          <h2 className={`text-lg font-bold mb-6 ${dm ? "text-white" : "text-gray-900"}`}>Training Consistency</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Ring */}
            <div className="flex flex-col items-center">
              <AttendanceRing attended={MOCK.attendance.attended} total={MOCK.attendance.total} dm={dm} />
              <p className={`text-sm mt-3 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {MOCK.attendance.attended} of {MOCK.attendance.total} sessions this month
              </p>
            </div>

            {/* Form Tracker */}
            <div className="flex flex-col items-center gap-4">
              <p className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-gray-600" : "text-gray-400"}`}>Recent Form</p>
              <div className="flex gap-2">
                {MOCK.recentForm.map((hit, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
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

            {/* Streak */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-16 h-16 rounded-full flex items-center justify-center ${dm ? "bg-orange-500/10" : "bg-orange-50"}`}
              >
                <Flame className={`w-8 h-8 ${dm ? "text-orange-400" : "text-orange-500"}`} />
              </motion.div>
              <p className={`text-2xl font-black ${dm ? "text-white" : "text-gray-900"}`}>{MOCK.streak}</p>
              <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-400"}`}>Sessions in a Row</p>
            </div>
          </div>
        </motion.section>

        {/* ══════ ZONE 3: Glory Metrics ══════ */}
        <div>
          <h2 className={`text-lg font-bold mb-4 ${dm ? "text-white" : "text-gray-900"}`}>Academy Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Academy Caps" value={MOCK.stats.caps} icon={Target} delay={0.1} dm={dm} />
            <StatCard label="Goals & Assists" value={`${MOCK.stats.goals}G ${MOCK.stats.assists}A`} icon={Zap} delay={0.2} dm={dm} />
            <StatCard label="MOTM Awards" value={MOCK.stats.motm} icon={Trophy} delay={0.3} dm={dm} />
            <StatCard label="Avg Rating" value={MOCK.stats.avgRating.toFixed(1)} icon={Star} delay={0.4} dm={dm} />
          </div>
        </div>

        {/* ══════ ZONE 4: Internal Crucible ══════ */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`rounded-2xl border overflow-hidden ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200 shadow-sm"}`}>
          <div className="p-6 pb-3">
            <h2 className={`text-lg font-bold ${dm ? "text-white" : "text-gray-900"}`}>Squad Leaderboard</h2>
            <p className={`text-xs mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>{MOCK.squad} • Ranked by Match Rating</p>
          </div>

          <div className="divide-y">
            {lb.map((p, i) => {
              const isCloseGap = !p.isUser && i > 0 && lb[i - 1]?.isUser === undefined && p.isUser === undefined
                ? false
                : p.isUser && i > 0 && (lb[i - 1].rating - p.rating) <= 0.3;

              const abovePlayer = p.isUser && i > 0 ? lb[i - 1] : null;
              const gap = abovePlayer ? (abovePlayer.rating - p.rating).toFixed(1) : null;

              return (
                <motion.div key={p.rank}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={`flex items-center justify-between px-6 py-3.5 transition-colors ${
                    p.isUser
                      ? dm ? "bg-[#00FF88]/8 border-l-2 border-l-[#00FF88]" : "bg-emerald-50/80 border-l-2 border-l-emerald-500"
                      : dm ? `border-[#87A98D]/8 ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#161616]"}` : `border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      p.rank === 1 ? "bg-yellow-500/15 text-yellow-500"
                        : p.rank === 2 ? (dm ? "bg-gray-400/15 text-gray-400" : "bg-gray-200 text-gray-500")
                          : p.rank === 3 ? "bg-orange-500/15 text-orange-500"
                            : dm ? "bg-[#0a0f12] text-gray-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {p.rank}
                    </div>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full overflow-hidden ${dm ? "bg-[#0a0f12]" : "bg-gray-100"}`}>
                      {p.isUser ? (
                        <img src={profilePic || user?.profilePic || "/default-avatar.png"} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${dm ? "text-gray-600" : "text-gray-300"}`}>
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <span className={`text-sm font-semibold ${p.isUser ? (dm ? "text-[#00FF88]" : "text-emerald-700") : (dm ? "text-gray-300" : "text-gray-700")}`}>
                      {p.isUser ? `${p.name} (You)` : p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Close gap indicator */}
                    {p.isUser && gap && parseFloat(gap) <= 0.3 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${dm ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-500"}`}>
                        <ChevronUp className="w-3 h-3" /> Close gap! ({gap})
                      </span>
                    )}

                    {/* Rating */}
                    <span className={`text-sm font-bold tabular-nums ${p.isUser ? (dm ? "text-[#00FF88]" : "text-emerald-600") : (dm ? "text-gray-400" : "text-gray-500")}`}>
                      {p.rating.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
