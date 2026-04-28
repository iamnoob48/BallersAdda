import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrophy } from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";
import { IoMdFootball } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { fetchPlayerProfile, fetchPlayerAcademy } from "../redux/slices/playerSlice";

import LeftCardProfile from "./Left-Card-Profile";
import ProfileTab      from "./Profile-Tab";
import AcademyTab      from "./Academy-Tab";
import Stats           from "./Stats";
import Badges          from "./Badges";
import Settings        from "./Settings";

// ── Shared section wrapper (used for tournaments inline) ────────────────────
const SectionWrapper = ({ children, dm }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className={`rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/20 shadow-green-950/20" : "bg-white border border-white shadow-gray-200/50"}`}
  >
    {children}
  </motion.div>
);

// ── Tournaments section ─────────────────────────────────────────────────────
const TournamentsSection = ({ dm, tournaments }) => (
  <SectionWrapper dm={dm}>
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
        <FaTrophy className="text-xl" />
      </div>
      <div>
        <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Tournament History</h3>
        <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>Track your competitive journey.</p>
      </div>
    </div>

    {tournaments?.length > 0 ? (
      <div className="grid grid-cols-1 gap-4">
        {tournaments.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group ${dm ? "bg-[#1a1a1a] border border-green-900/20 hover:border-yellow-600/30" : "bg-white border border-gray-100 hover:border-green-200"}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dm ? "bg-green-950/40 text-green-600 group-hover:bg-green-900/50 group-hover:text-yellow-400" : "bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600"}`}>
                <IoMdFootball className="text-xl" />
              </div>
              <div>
                <h4 className={`font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>{t.name}</h4>
                <p className={`text-xs mt-0.5 flex items-center gap-2 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  <span>{new Date(t.joinedAt).toLocaleDateString()}</span>
                  {" • "}
                  <span className="text-green-600 font-medium">{t.position || "Player"}</span>
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${dm ? "bg-green-950/30 text-green-400 border-green-900/30" : "bg-gray-50 text-gray-600 border-gray-100"}`}>
                Played
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl text-gray-200 mb-4"><GiWhistle /></div>
        <p className="text-gray-500 font-medium">No tournaments played yet.</p>
      </div>
    )}
  </SectionWrapper>
);

// ── Root page component ─────────────────────────────────────────────────────
export default function PlayerProfilePage() {
  const [activeSection, setActiveSection] = useState("personal");

  const dispatch   = useDispatch();
  const dm         = useSelector((state) => state.theme.darkMode);
  const player     = useSelector((state) => state.player.profile);
  const academy    = useSelector((state) => state.player.academy);
  const tournaments = useSelector((state) => state.player.myTournaments);

  useEffect(() => {
    if (!player)  dispatch(fetchPlayerProfile());
    if (!academy) dispatch(fetchPlayerAcademy());
  }, []);

  return (
    <div className={`min-h-screen font-sans pb-20 md:pb-10 transition-colors duration-300 ${dm ? "bg-[#0a0a0a] selection:bg-yellow-400/30 selection:text-yellow-200" : "bg-[#F0FDF4] selection:bg-green-200 selection:text-green-900"}`}>
      {/* Background decoration */}
      <div className={`fixed top-0 left-0 w-full h-80 -z-10 transition-colors duration-300 ${dm ? "bg-gradient-to-b from-green-950/40 to-transparent" : "bg-gradient-to-b from-green-100/50 to-transparent"}`} />
      <div className={`fixed -top-20 -right-20 w-96 h-96 rounded-full blur-3xl -z-10 transition-colors duration-300 ${dm ? "bg-green-900/20" : "bg-green-200/30"}`} />
      <div className={`fixed top-40 -left-20 w-72 h-72 rounded-full blur-3xl -z-10 transition-colors duration-300 ${dm ? "bg-emerald-900/15" : "bg-emerald-200/20"}`} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        <LeftCardProfile activeSection={activeSection} setActiveSection={setActiveSection} />

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {activeSection === "personal"     && <ProfileTab      key="personal"     />}
            {activeSection === "tournaments"  && <TournamentsSection key="tournaments" dm={dm} tournaments={tournaments} />}
            {activeSection === "academy"      && <AcademyTab      key="academy"      />}
            {activeSection === "performance"  && <Stats           key="performance"  />}
            {activeSection === "achievements" && <Badges          key="achievements" />}
            {activeSection === "settings"     && <Settings        key="settings"     />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
