import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaTrophy,
  FaSchool,
  FaChartLine,
  FaMedal,
  FaCog,
  FaSignOutAlt,
  FaCamera,
  FaPen,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa";
import { GiSoccerKick, GiWhistle } from "react-icons/gi";
import { IoMdFootball } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import api from "../api/axios";

export default function PlayerProfilePage({ player }) {
  const [activeSection, setActiveSection] = useState("personal");
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({});
  const [academyDetails, setAcademyDetails] = useState({});

  // --- DARK MODE (from Redux) ---
  const dm = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();

  // Determine if we have valid player profile data
  const isPlayerData = Boolean(player);

  //For updating after hitting edit
  const handleUpdate = async () => {
    try {
      const res = await api.post("/player/updatePlayerProfile", formData);
      console.log(res.data);
    } catch (error) {
      console.error("Error updating player profile:", error);
    }
  };

  //For fetching academy details of player based on academy id
  const fetchAcademyDetails = async () => {
    try {
      const res = await api.get("/player/academyDetailsOfPlayer");
      const data = res.data.academy;
      setAcademyDetails(data);
    } catch (error) {
      console.error("Error fetching academy details:", error);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUserName(res.data.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (!player) fetchUserName();

    // Initialize form data when player data loads
    if (player) {
      setFormData({
        firstName: player.firstName || "",
        lastName: player.lastName || "",
        displayName: player.displayName || "",
        age: player.age || "",
        gender: player.gender || "",
        position: player.position || "",
        height: player.height || "",
        weight: player.weight || "",
        dominantFoot: player.dominantFoot || "",
        bio: player.bio || "",
      });
    }
  }, [player]);

  useEffect(() => {
    fetchAcademyDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const sections = [
    { key: "personal", icon: <FaUser />, label: "Profile" },
    { key: "tournaments", icon: <FaTrophy />, label: "Tournaments" },
    { key: "academy", icon: <FaSchool />, label: "Academy" },
    { key: "performance", icon: <FaChartLine />, label: "Stats" },
    { key: "achievements", icon: <FaMedal />, label: "Badges" },
    { key: "settings", icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div className={`min-h-screen font-sans pb-20 md:pb-10 transition-colors duration-300 ${dm ? "bg-[#0a0a0a] selection:bg-yellow-400/30 selection:text-yellow-200" : "bg-[#F0FDF4] selection:bg-green-200 selection:text-green-900"}`}>
      {/* --- BACKGROUND DECORATION --- */}
      <div className={`fixed top-0 left-0 w-full h-80 -z-10 transition-colors duration-300 ${dm ? "bg-gradient-to-b from-green-950/40 to-transparent" : "bg-gradient-to-b from-green-100/50 to-transparent"}`} />
      <div className={`fixed -top-20 -right-20 w-96 h-96 rounded-full blur-3xl -z-10 transition-colors duration-300 ${dm ? "bg-green-900/20" : "bg-green-200/30"}`} />
      <div className={`fixed top-40 -left-20 w-72 h-72 rounded-full blur-3xl -z-10 transition-colors duration-300 ${dm ? "bg-emerald-900/15" : "bg-emerald-200/20"}`} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* --- LEFT SIDEBAR (Desktop) / TOP NAV (Mobile) --- */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-1/4 flex-shrink-0"
        >
          {/* Profile Card */}
          <div className={`rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/30 shadow-green-950/30" : "bg-white border border-green-50 shadow-green-100/50"}`}>
            <div className={`absolute top-0 left-0 w-full h-24 ${dm ? "bg-gradient-to-br from-green-800 to-emerald-950" : "bg-gradient-to-br from-green-400 to-emerald-600"}`} />

            <div className="relative flex flex-col items-center mt-8">
              <div className="relative">
                <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-md overflow-hidden transition-colors duration-300 ${dm ? "border-[#1a1a1a] bg-green-950/50 text-green-400" : "border-white bg-green-50 text-green-600"}`}>
                  {/* Fallback avatar or image */}
                  {player?.image ? (
                    <img
                      src={player.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {player?.firstName?.[0] || userName?.[0] || "P"}
                    </span>
                  )}
                </div>
                {isPlayerData && (
                  <button className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full text-xs shadow-lg hover:scale-110 transition">
                    <FaCamera />
                  </button>
                )}
              </div>

              <h2 className={`mt-4 text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {player?.displayName || userName || "Guest Player"}
              </h2>
              <p className={`text-sm font-medium px-3 py-1 rounded-full mt-1 border ${dm ? "text-green-400 bg-green-950/50 border-green-800/50" : "text-green-600 bg-green-50 border-green-100"}`}>
                {player?.position || "Position Unassigned"}
              </p>
            </div>

            {/* Navigation (Desktop Vertical List) */}
            <nav className="mt-8 space-y-1 hidden md:block">
              {sections.map((s) => (
                <button
                  key={s.key}
                  disabled={!isPlayerData && s.key !== "personal"}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group/btn ${
                    activeSection === s.key
                      ? (dm ? "bg-green-700 text-yellow-300 shadow-lg shadow-green-900/40" : "bg-green-600 text-white shadow-lg shadow-green-200")
                      : (dm ? "text-gray-400 hover:bg-green-950/40 hover:text-green-400 disabled:opacity-40 disabled:cursor-not-allowed" : "text-gray-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed")
                  }`}
                >
                  <span
                    className={`text-lg transition-transform group-hover/btn:scale-110 ${
                      activeSection === s.key ? (dm ? "text-yellow-300" : "text-white") : (dm ? "text-green-600" : "text-green-500")
                    }`}
                  >
                    {s.icon}
                  </span>
                  {s.label}
                  {activeSection === s.key && (
                    <motion.div
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation (Horizontal Scroll) */}
          <div className={`md:hidden mt-6 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-3 pb-2 sticky top-2 z-40 backdrop-blur-md py-2 ${dm ? "bg-[#0a0a0a]/90" : "bg-[#F0FDF4]/90"}`}>
            {sections.map((s) => (
              <button
                key={s.key}
                disabled={!isPlayerData && s.key !== "personal"}
                onClick={() => setActiveSection(s.key)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  activeSection === s.key
                    ? (dm ? "bg-green-700 text-yellow-300 border-green-700 shadow-md" : "bg-green-600 text-white border-green-600 shadow-md")
                    : (dm ? "bg-[#1a1a1a] text-gray-400 border-green-900/30" : "bg-white text-gray-600 border-gray-200")
                } disabled:opacity-50`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </motion.aside>

        {/* --- RIGHT CONTENT AREA --- */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* 1. PERSONAL SECTION */}
            {activeSection === "personal" && (
              <SectionWrapper key="personal">
                {!isPlayerData ? (
                  <div className="text-center py-16 px-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${dm ? "bg-green-950/50 text-green-400" : "bg-green-100 text-green-600"}`}>
                      <FaUser />
                    </div>
                    <h3 className={`text-xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                      Incomplete Profile
                    </h3>
                    <p className={`max-w-sm mx-auto mt-2 mb-6 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                      Complete your profile to unlock stats, academy features,
                      and tournament tracking.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/profile-complete")}
                      className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
                    >
                      Complete Now
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                          About {player.firstName}
                        </h3>
                        <p className={`text-sm mt-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                          Manage your personal details and bio.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEditModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors ${dm ? "bg-[#1a1a1a] border border-green-900/30 text-gray-300 hover:border-yellow-500/50 hover:text-yellow-400" : "bg-white border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600"}`}
                      >
                        <FaPen className="text-xs" /> Edit
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InfoCard
                        label="Full Name"
                        value={`${player.firstName} ${player.lastName}`}
                      />
                      <InfoCard label="Age" value={`${player.age} Years`} />
                      <InfoCard label="Gender" value={player.gender} />
                      <InfoCard
                        label="Experience"
                        value={player.experienceLevel}
                        highlight
                      />

                      {/* Physical Stats Row */}
                      <div className="md:col-span-2 grid grid-cols-3 gap-4 mt-2">
                        <div className={`rounded-2xl p-4 text-center border ${dm ? "bg-green-950/30 border-green-900/30" : "bg-green-50 border-green-100"}`}>
                          <p className={`text-xs uppercase font-bold tracking-wider ${dm ? "text-gray-500" : "text-gray-500"}`}>
                            Height
                          </p>
                          <p className={`text-lg font-bold mt-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                            {player.height || "-"}{" "}
                            <span className={`text-xs font-normal ${dm ? "text-gray-500" : "text-gray-400"}`}>
                              cm
                            </span>
                          </p>
                        </div>
                        <div className={`rounded-2xl p-4 text-center border ${dm ? "bg-green-950/30 border-green-900/30" : "bg-green-50 border-green-100"}`}>
                          <p className={`text-xs uppercase font-bold tracking-wider ${dm ? "text-gray-500" : "text-gray-500"}`}>
                            Weight
                          </p>
                          <p className={`text-lg font-bold mt-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                            {player.weight || "-"}{" "}
                            <span className={`text-xs font-normal ${dm ? "text-gray-500" : "text-gray-400"}`}>
                              kg
                            </span>
                          </p>
                        </div>
                        <div className={`rounded-2xl p-4 text-center border ${dm ? "bg-green-950/30 border-green-900/30" : "bg-green-50 border-green-100"}`}>
                          <p className={`text-xs uppercase font-bold tracking-wider ${dm ? "text-gray-500" : "text-gray-500"}`}>
                            Foot
                          </p>
                          <p className={`text-lg font-bold mt-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                            {player.dominantFoot || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-2 mt-4">
                        <h4 className={`text-sm font-bold mb-3 ${dm ? "text-gray-200" : "text-gray-900"}`}>
                          Bio
                        </h4>
                        <div className={`p-5 rounded-2xl border text-sm leading-relaxed italic ${dm ? "bg-[#1a1a1a] border-green-900/20 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-600"}`}>
                          "
                          {player.bio ||
                            "No bio added yet. Click edit to add a description about your playing style."}
                          "
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </SectionWrapper>
            )}

            {/* 2. TOURNAMENTS SECTION */}
            {activeSection === "tournaments" && (
              <SectionWrapper key="tournaments">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                    <FaTrophy className="text-xl" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                      Tournament History
                    </h3>
                    <p className={`text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                      Track your competitive journey.
                    </p>
                  </div>
                </div>

                {player.tournaments?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {player.tournaments.map((t, idx) => (
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
                            <h4 className={`font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>
                              {t.name}
                            </h4>
                            <p className={`text-xs mt-0.5 flex items-center gap-2 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                              <span>
                                {new Date(t.joinedAt).toLocaleDateString()}
                              </span>{" "}
                              •{" "}
                              <span className="text-green-600 font-medium">
                                {t.position || "Player"}
                              </span>
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
                  <EmptyState
                    message="No tournaments played yet."
                    icon={<GiWhistle />}
                  />
                )}
              </SectionWrapper>
            )}

            {/* 3. ACADEMY SECTION */}
            {activeSection === "academy" && (
              <SectionWrapper key="academy">
                <div className="mb-6">
                  <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    Academy Details
                  </h3>
                </div>

                {academyDetails ? (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                      <FaSchool className="text-[150px]" />
                    </div>

                    <div className="relative z-10">
                      <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                        Current Academy
                      </span>
                      <h2 className="text-3xl font-extrabold mt-4 mb-2">
                        {academyDetails.name}
                      </h2>
                      <p className="text-emerald-100 text-sm mb-8">
                        Member since{" "}
                        {new Date(academyDetails.establishedAt).toLocaleDateString()}
                      </p>

                      <div className="flex gap-4">
                        <button className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-50 transition">
                          View Academy
                        </button>
                        <button className="bg-emerald-700/50 backdrop-blur text-white px-6 py-2.5 rounded-xl font-bold text-sm border border-emerald-500/30 hover:bg-emerald-700 transition">
                          Contact Coach
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center ${dm ? "border-green-900/30 bg-[#141414]" : "border-gray-200 bg-gray-50/50"}`}>
                    <FaSchool className={`text-4xl mb-4 ${dm ? "text-green-800" : "text-gray-300"}`} />
                    <h4 className={`text-lg font-bold ${dm ? "text-gray-300" : "text-gray-700"}`}>
                      Not enrolled in an academy
                    </h4>
                    <p className={`text-sm mt-2 mb-6 max-w-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>
                      Join an academy to get professional training and track
                      your progress.
                    </p>
                    <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                      Explore Academies
                    </button>
                  </div>
                )}
              </SectionWrapper>
            )}

            {/* 4. PERFORMANCE SECTION */}
            {activeSection === "performance" && (
              <SectionWrapper key="performance">
                <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  Performance Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Matches"
                    value={player.tournamentsPlayed || 0}
                    icon={<IoMdFootball />}
                    color="blue"
                  />
                  <StatCard
                    label="Badges"
                    value={player.badges || 0}
                    icon={<FaMedal />}
                    color="yellow"
                  />
                  <StatCard
                    label="Rating"
                    value={player.ratings || "N/A"}
                    icon={<FaChartLine />}
                    color="green"
                  />
                  <StatCard
                    label="Regional"
                    value={`#${player.regionalRank || "-"}`}
                    sub="Rank"
                    color="purple"
                  />
                  <StatCard
                    label="National"
                    value={`#${player.nationalRank || "-"}`}
                    sub="Rank"
                    color="red"
                  />
                </div>
              </SectionWrapper>
            )}

            {/* 5. ACHIEVEMENTS SECTION */}
            {activeSection === "achievements" && (
              <SectionWrapper key="achievements">
                <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  Badges & Awards
                </h3>
                {player.badges > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[...Array(player.badges)].map((_, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5, rotate: 2 }}
                        className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center shadow-sm"
                      >
                        <span className="text-4xl mb-2">🏅</span>
                        <span className="text-xs font-bold text-amber-800 uppercase">
                          Winner
                        </span>
                        <span className="text-[10px] text-amber-600">
                          Tournament {i + 1}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    message="No badges earned yet."
                    icon={<FaMedal />}
                  />
                )}
              </SectionWrapper>
            )}

            {/* 6. SETTINGS SECTION */}
            {activeSection === "settings" && (
              <SectionWrapper key="settings">
                <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                  Account Settings
                </h3>
                <div className="space-y-3">
                  {/* DARK MODE TOGGLE */}
                  <div className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left border ${dm ? "bg-[#1a1a1a] border-green-900/20" : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dm ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-100 text-gray-600"}`}>
                      {dm ? <FaMoon /> : <FaSun />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>Dark Mode</h4>
                      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>Switch between light and dark theme</p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      onClick={() => dispatch(toggleDarkMode())}
                      className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${dm ? "bg-green-600 focus:ring-green-500 focus:ring-offset-[#1a1a1a]" : "bg-gray-300 focus:ring-green-500 focus:ring-offset-white"}`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-md ${dm ? "left-[30px] bg-yellow-400" : "left-0.5 bg-white"}`}
                      />
                    </button>
                  </div>

                  <SettingsItem
                    icon={<FaUser />}
                    title="Account Privacy"
                    desc="Manage who can see your profile"
                    dm={dm}
                  />
                  <SettingsItem
                    icon={<GiWhistle />}
                    title="Notifications"
                    desc="Match reminders and updates"
                    dm={dm}
                  />
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left group ${dm ? "bg-red-950/30 text-red-400 hover:bg-red-950/50" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dm ? "bg-red-950/50 text-red-400 group-hover:bg-red-900/50" : "bg-red-100 text-red-600 group-hover:bg-red-200"}`}>
                      <FaSignOutAlt />
                    </div>
                    <div>
                      <h4 className="font-bold">Log Out</h4>
                      <p className="text-xs opacity-70">
                        Sign out of your account
                      </p>
                    </div>
                  </button>
                </div>
              </SectionWrapper>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
        {showEditModal && (
          <EditModal
            onClose={() => setShowEditModal(false)}
            formData={formData}
            setFormData={setFormData}
            // Add your submit handler here passing formData
            onSubmit={() => {
              handleUpdate();
              // Call API here
              setShowEditModal(false);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

const SectionWrapper = ({ children }) => {
  // Read dark mode from localStorage for sub-components
  const isDark = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 ${isDark ? "bg-[#141414] border border-green-900/20 shadow-green-950/20" : "bg-white border border-white shadow-gray-200/50"}`}
    >
      {children}
    </motion.div>
  );
};

const InfoCard = ({ label, value, highlight }) => {
  const isDark = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';
  return (
    <div className={`border-b py-2 ${isDark ? "border-green-900/20" : "border-gray-100"}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {label}
      </p>
      <p
        className={`text-lg font-semibold mt-1 ${
          highlight ? (isDark ? "text-yellow-400" : "text-green-600") : (isDark ? "text-gray-200" : "text-gray-900")
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon, color }) => {
  const isDark = typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';
  const colorStyles = isDark ? {
    blue: "bg-blue-950/40 text-blue-400",
    green: "bg-green-950/40 text-green-400",
    yellow: "bg-yellow-950/40 text-yellow-400",
    purple: "bg-purple-950/40 text-purple-400",
    red: "bg-red-950/40 text-red-400",
  } : {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`p-5 rounded-2xl shadow-sm text-center border ${isDark ? "bg-[#1a1a1a] border-green-900/20" : "bg-white border-gray-100"}`}
    >
      {icon && (
        <div
          className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-lg mb-3 ${
            colorStyles[color || "green"]
          }`}
        >
          {icon}
        </div>
      )}
      <div className={`text-2xl font-black ${isDark ? "text-gray-100" : "text-gray-900"}`}>{value}</div>
      <div className={`text-xs font-bold uppercase tracking-wide mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
        {label} {sub}
      </div>
    </motion.div>
  );
};

const EmptyState = ({ message, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl text-gray-200 mb-4">{icon}</div>
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

const SettingsItem = ({ icon, title, desc, dm }) => (
  <button className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left group border ${dm ? "border-transparent hover:bg-green-950/20 hover:border-green-900/20" : "border-transparent hover:bg-gray-50 hover:border-gray-100"}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dm ? "bg-green-950/40 text-green-500 group-hover:bg-green-900/40" : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:shadow-sm"}`}>
      {icon}
    </div>
    <div className="flex-1">
      <h4 className={`font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>{title}</h4>
      <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>{desc}</p>
    </div>
    <div className={dm ? "text-gray-600" : "text-gray-300"}>›</div>
  </button>
);

const EditModal = ({ onClose, formData, setFormData, onSubmit }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <FormField
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
            />
            <FormField
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
            <div className="md:col-span-2 grid grid-cols-2 gap-5">
              <FormField
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
              />
              <FormField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
            <FormField
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Dominant Foot
              </label>
              <select
                name="dominantFoot"
                value={formData.dominantFoot}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              >
                <option value="">Select Foot</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const FormField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
      placeholder={`Enter ${label}`}
    />
  </div>
);
