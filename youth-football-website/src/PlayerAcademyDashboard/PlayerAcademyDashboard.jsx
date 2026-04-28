// ── PlayerAcademyDashboard ────────────────────────────────────────────────
// Orchestrator — fetches data, manages tab state, composes zone components.
//
// Always visible:
//   AcademyBanner   → B2B banner (only when player has no academy)
//   AcademyOverview → Identity header (player + academy)
//   Tab nav         → Overview | Attendance | Performance | Leaderboard | Membership
//
// Data sources:
//   profile + academy   → fetchPlayerProfile / fetchPlayerAcademy (existing)
//   academyStats        → fetchPlayerAcademyStats  (GET /player/academyStats)
//   attendanceData      → fetchPlayerAttendance    (GET /player/attendance)
//
// Real data is used when available; MOCK leaderboard remains until a
// backend leaderboard endpoint is added.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  CalendarCheck,
  BarChart2,
  Trophy,
  CreditCard,
} from "lucide-react";

import {
  fetchPlayerProfile,
  fetchPlayerAcademy,
  fetchPlayerAcademyStats,
  fetchPlayerAttendance,
  fetchAcademyHistory,
} from "../redux/slices/playerSlice";
import { MOCK } from "./mockData";
import AcademyBanner from "./AcademyBanner";
import AcademyHero from "./AcademyHero";
import AcademyOverview from "./Academy-Overview";
import Attendance from "./Attendance";
import Performance from "./Performance";
import LeaderboardTab from "./LeaderboardTab";
import MembershipTab from "./MembershipTab";

// ── Tab definitions ───────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "performance", label: "Performance", icon: BarChart2 },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "membership", label: "Membership", icon: CreditCard },
];

// ── Fallback values used when real data hasn't loaded yet ─────────────────
const EMPTY_ATTENDANCE = { attended: 0, total: 0 };
const EMPTY_STATS = {
  officialCaps: 0,
  officialGoals: 0,
  officialAssists: 0,
  officialMotm: 0,
  officialAvgRating: 0.0,
};

export default function PlayerAcademyDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);
  const {
    profile,
    profilePic,
    academy,
    loading,
    academyStats,
    statsLoading,
    attendanceData,
    attendanceLoading,
    academyHistory,
    academyHistoryLoading,
  } = useSelector((s) => s.player);
  const { user } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("overview");

  // Step 1 — always fetch profile + academy + history on mount
  useEffect(() => {
    dispatch(fetchPlayerProfile());
    dispatch(fetchPlayerAcademy());
    dispatch(fetchAcademyHistory());
  }, [dispatch]);

  // Step 2 — fetch stats + attendance only once we know the player has an academy
  useEffect(() => {
    if (profile?.academyId) {
      dispatch(fetchPlayerAcademyStats());
      dispatch(fetchPlayerAttendance());
    }
  }, [dispatch, profile?.academyId]);

  // ── Loading spinner (profile + history in flight) ───────────────────────
  if (loading || academyHistoryLoading || academyHistory === null) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          dm ? "bg-[#121212]" : "bg-gray-50"
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`w-10 h-10 border-4 rounded-full ${
            dm
              ? "border-[#00FF88] border-t-transparent"
              : "border-emerald-500 border-t-transparent"
          }`}
        />
      </div>
    );
  }

  // ── Access gate — player has never been part of any academy ─────────────
  if (academyHistory.length === 0 && !profile?.academyId) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 px-4 ${
          dm ? "bg-[#121212]" : "bg-gray-50"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            dm
              ? "bg-[#1a1a1a] border border-[#87A98D]/15"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <span className="text-3xl">🏟️</span>
        </div>
        <div className="text-center">
          <h2
            className={`text-lg font-bold ${
              dm ? "text-white" : "text-gray-900"
            }`}
          >
            No Academy Yet
          </h2>
          <p
            className={`text-sm mt-1 max-w-xs ${
              dm ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Join an academy to unlock your dashboard — stats, attendance, and
            performance tracking.
          </p>
        </div>
        <button
          onClick={() => navigate("/home")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            dm
              ? "bg-[#00FF88]/15 text-[#00FF88] hover:bg-[#00FF88]/25"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Resolved data — real when available, safe fallback otherwise ──────────
  const resolvedAttendance = attendanceData?.attendance ?? EMPTY_ATTENDANCE;
  const resolvedRecentForm = attendanceData?.recentForm ?? [];
  const resolvedStreak = attendanceData?.streak ?? 0;

  const resolvedStats = academyStats
    ? {
        caps: academyStats.officialCaps,
        goals: academyStats.officialGoals,
        assists: academyStats.officialAssists,
        motm: academyStats.officialMotm,
        avgRating: academyStats.officialAvgRating,
      }
    : {
        caps: EMPTY_STATS.officialCaps,
        goals: EMPTY_STATS.officialGoals,
        assists: EMPTY_STATS.officialAssists,
        motm: EMPTY_STATS.officialMotm,
        avgRating: EMPTY_STATS.officialAvgRating,
      };

  // Leaderboard still uses MOCK — replace when backend endpoint exists
  const leaderboard = MOCK.leaderboard.map((p) =>
    p.isUser
      ? {
          ...p,
          name: profile?.firstName || "You",
          rating: resolvedStats.avgRating || MOCK.stats.avgRating,
        }
      : p
  );

  // Shared attendance props (avoids repeating inline)
  const attendanceProps = {
    attendance: resolvedAttendance,
    recentForm: resolvedRecentForm,
    streak: resolvedStreak,
    isLoading: attendanceLoading,
    dm,
  };

  // Shared performance props
  const performanceProps = {
    stats: resolvedStats,
    isLoading: statsLoading,
    dm,
  };

  return (
    <main
      className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 ${
        dm ? "bg-[#121212]" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate("/home")}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            dm
              ? "text-gray-500 hover:text-[#00FF88]"
              : "text-gray-400 hover:text-emerald-600"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* ── Current academy hero (venue + name + description) ── */}
        {academy && <AcademyHero academy={academy} dm={dm} />}

        {/* ── Tab navigation ── */}
        <div
          className={`flex gap-1 p-1 rounded-xl border overflow-x-auto scrollbar-none ${
            dm
              ? "bg-[#1a1a1a] border-[#87A98D]/15"
              : "bg-gray-100 border-gray-200"
          }`}
          role="tablist"
          aria-label="Dashboard sections"
        >
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <motion.button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(key)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? dm
                      ? "bg-[#00FF88] text-[#121212] shadow-sm"
                      : "bg-white text-emerald-700 shadow-sm"
                    : dm
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Tab: Overview — all zones stacked ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <AcademyOverview
              enrollments={academyHistory}
              onViewPerformance={(_academyId, isActive) => {
                if (isActive) setActiveTab("performance");
              }}
              dm={dm}
            />
          </div>
        )}

        {/* ── Tab: Attendance ── */}
        {activeTab === "attendance" && <Attendance {...attendanceProps} />}

        {/* ── Tab: Performance ── */}
        {activeTab === "performance" && <Performance {...performanceProps} />}

        {/* ── Tab: Leaderboard ── */}
        {activeTab === "leaderboard" && (
          <LeaderboardTab
            leaderboard={leaderboard}
            profilePic={profilePic}
            user={user}
            squad={MOCK.squad}
            dm={dm}
          />
        )}

        {/* ── Tab: Membership ── */}
        {activeTab === "membership" && (
          <MembershipTab profile={profile} academy={academy} dm={dm} />
        )}
      </div>
    </main>
  );
}
