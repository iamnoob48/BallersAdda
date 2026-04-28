import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { FaTrophy } from "react-icons/fa";

import { TeamHubHeader, OverviewTab } from "./TeamHubHeader";
import { RosterTab } from "./RosterTab";
import { FixturesTab } from "./FixturesTab";
import { StatsTab } from "./StatsTab";
import DetailViewSkeleton from "../components/skeletons/DetailViewSkeleton";

// =====================================================================
//  TeamHubPage — "Locker Room"
// =====================================================================
export default function TeamHubPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // ── Fetch team hub data ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/player/team-hub/${teamId}`);
        if (!cancelled) setTeam(res.data.team);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load team data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return <DetailViewSkeleton avatarShape="card" tabCount={4} contentRows={5} />;
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (error || !team) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
        <div className="text-center space-y-4">
          <FaTrophy className={`text-5xl mx-auto ${dm ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-lg font-semibold ${dm ? "text-gray-300" : "text-gray-700"}`}>
            {error || "Team not found."}
          </p>
          <button
            onClick={() => navigate("/home")}
            className={`px-5 py-2 rounded-xl font-semibold text-sm ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-gray-900 text-white"}`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { tournament, players = [], tournamentStats = [], homeMatches = [], awayMatches = [], captain } = team;

  // ── Merge & sort fixtures ─────────────────────────────────────────────
  const fixtures = [
    ...homeMatches.map((m) => ({ ...m, side: "home", opponent: m.awayTeam })),
    ...awayMatches.map((m) => ({ ...m, side: "away", opponent: m.homeTeam })),
  ].sort((a, b) => new Date(a.kickoffAt) - new Date(b.kickoffAt));

  // ── Format helpers ────────────────────────────────────────────────────
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

  // ── Format & Rules split ──────────────────────────────────────────────
  const rulesArr = (tournament.formatAndRules || "")
    .split(".")
    .map((r) => r.trim())
    .filter(Boolean);

  // =====================================================================
  //  RENDER
  // =====================================================================
  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      <TeamHubHeader
        dm={dm}
        tournament={tournament}
        team={team}
        captain={captain}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={() => navigate("/home")}
      />

      {/* ── TAB CONTENT ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OverviewTab dm={dm} tournament={tournament} rulesArr={rulesArr} fmtDate={fmtDate} />
            )}
            {activeTab === "roster" && (
              <RosterTab dm={dm} players={players} captain={captain} />
            )}
            {activeTab === "fixtures" && (
              <FixturesTab dm={dm} fixtures={fixtures} teamName={team.name} fmtDate={fmtDate} fmtTime={fmtTime} />
            )}
            {activeTab === "stats" && (
              <StatsTab dm={dm} stats={tournamentStats} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
