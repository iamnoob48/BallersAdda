import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaTrophy,
  FaSchool,
  FaChartLine,
  FaMedal,
  FaFutbol,
} from "react-icons/fa";
import { GiSoccerKick } from "react-icons/gi";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function PlayerProfilePage({ player }) {
  const [activeSection, setActiveSection] = useState("personal");
  const [showPopup, setShowPopup] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  const isPlayerData = Boolean(player);
  const fetchUserName = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUserName(res.data.username);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchUserName();
  }, []);

  // Use effect for this if player data is not passed

  const sections = [
    { key: "personal", icon: <FaUser />, label: "Personal Info" },
    { key: "tournaments", icon: <FaTrophy />, label: "Tournaments" },
    { key: "academy", icon: <FaSchool />, label: "Academy" },
    { key: "performance", icon: <FaChartLine />, label: "Performance" },
    { key: "achievements", icon: <FaMedal />, label: "Achievements" },
    { key: "settings", icon: <FaFutbol />, label: "Settings" },
  ];

  // Logout
  const handleLogout = async () => {
    try {
      const res = await api.post("/auth/logout");
      if (res.status === 200) window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleSectionClick = (key) => {
    if (!isPlayerData && key !== "personal") {
      setShowPopup(true);
      return;
    }
    setActiveSection(key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex flex-col md:flex-row px-4 md:px-10 py-10 gap-8 relative">
      {/* LEFT SIDEBAR */}
      <motion.aside
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="md:w-1/4 bg-white rounded-2xl shadow-lg border border-gray-200 h-fit sticky top-8"
      >
        <div className="p-6 flex flex-col items-center border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-4xl text-green-600 font-bold shadow-md">
            {player?.firstName?.[0] || userName[0] || "P"}
          </div>
          <h2 className="mt-3 text-xl font-bold text-gray-900">
            {player?.displayName ||
              `${player?.firstName} ${player?.lastName}` ||
              userName ||
              "Player Name"}
          </h2>
          <p className="text-gray-500 text-sm">
            {player?.position || "Unassigned Position"}
          </p>
        </div>

        <nav className="flex flex-col divide-y divide-gray-100">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => handleSectionClick(s.key)}
              className={`flex items-center gap-3 px-6 py-4 text-left text-sm font-medium transition-all ${
                activeSection === s.key
                  ? "bg-green-100 text-green-700 border-l-4 border-green-600"
                  : "text-gray-700 hover:bg-gray-50"
              } ${!isPlayerData && s.key !== "personal" ? "opacity-70" : ""}`}
            >
              <span className="text-lg">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* RIGHT CONTENT */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          {activeSection === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
            >
              {!isPlayerData ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">
                    You haven’t completed your profile yet.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/profile-complete")}
                    className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-green-700 transition"
                  >
                    Complete My Profile
                  </motion.button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Personal Information
                    </h3>

                    {/* Edit Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditModal(true)}
                      className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold shadow-md hover:bg-green-700 transition-all flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a2.25 2.25 0 113.182 3.183l-9.193 9.193a4.5 4.5 0 01-1.897 1.13l-3.434.985.985-3.434a4.5 4.5 0 011.13-1.897l7.54-7.54z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 7.125L17.88 5.505M18 14.25v6.375a.375.375 0 01-.375.375H5.25a.375.375 0 01-.375-.375V6.375A.375.375 0 015.25 6h6.375"
                        />
                      </svg>
                      Edit
                    </motion.button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Info
                      label="Full Name"
                      value={`${player.firstName} ${player.lastName}`}
                    />
                    <Info label="Age" value={player.age || "N/A"} />
                    <Info label="Gender" value={player.gender || "N/A"} />
                    <Info
                      label="Height"
                      value={player.height ? `${player.height} cm` : "N/A"}
                    />
                    <Info
                      label="Weight"
                      value={player.weight ? `${player.weight} kg` : "N/A"}
                    />
                    <Info label="Position" value={player.position || "N/A"} />
                    <Info
                      label="Dominant Foot"
                      value={player.dominantFoot || "N/A"}
                    />
                    <Info
                      label="Experience Level"
                      value={player.experienceLevel || "BEGINNER"}
                    />
                  </div>

                  {player.bio && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Bio
                      </h4>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {player.bio}
                      </p>
                    </div>
                  )}

                  {/* Edit Modal */}
                  <AnimatePresence>
                    {showEditModal && (
                      <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white dark:bg-[#121417] rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border border-green-100 dark:border-green-900/40"
                        >
                          {/* Header */}
                          <div className="bg-green-600 p-4 text-white flex items-center justify-between shadow-sm">
                            <h3 className="text-lg md:text-xl font-bold">
                              Edit Personal Information
                            </h3>
                            <button
                              onClick={() => setShowEditModal(false)}
                              className="text-white hover:scale-110 transition"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Form */}
                          <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              {/* First Name */}
                              <FormField
                                label="First Name"
                                defaultValue={player.firstName}
                              />
                              <FormField
                                label="Last Name"
                                defaultValue={player.lastName}
                              />
                              <FormField
                                label="Display Name"
                                defaultValue={player.displayName}
                              />
                              <FormField
                                label="Age"
                                type="number"
                                defaultValue={player.age}
                              />
                              <FormSelect
                                label="Gender"
                                defaultValue={player.gender}
                                options={["Male", "Female", "Other"]}
                              />
                              <FormField
                                label="Position"
                                defaultValue={player.position}
                              />
                              <FormField
                                label="Height (cm)"
                                type="number"
                                defaultValue={player.height}
                              />
                              <FormField
                                label="Weight (kg)"
                                type="number"
                                defaultValue={player.weight}
                              />
                              <FormSelect
                                label="Dominant Foot"
                                defaultValue={player.dominantFoot}
                                options={["Left", "Right", "Both"]}
                              />

                              {/* Bio */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Bio
                                </label>
                                <textarea
                                  placeholder="Tell us something about yourself..."
                                  defaultValue={player.bio}
                                  rows={4}
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1D21] text-gray-800 dark:text-gray-200 px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                              </div>
                            </form>

                            {/* Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                              <button
                                onClick={() => setShowEditModal(false)}
                                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1A1D21] transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: send update request to backend
                                  setShowEditModal(false);
                                }}
                                className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-green-700 transition-all"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {/* ✅ Only show these if profile is completed */}
          {isPlayerData && activeSection === "tournaments" && (
            <Section title="Tournaments Played">
              {player.tournaments.length ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {player.tournaments.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 bg-green-50 rounded-xl border border-green-100 shadow-sm hover:shadow-md transition"
                    >
                      <h4 className="font-semibold text-gray-800">{t.name}</h4>
                      <p className="text-sm text-gray-600">
                        Position: {t.position || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined: {new Date(t.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No tournaments played yet.
                </p>
              )}
            </Section>
          )}

          {isPlayerData && activeSection === "academy" && (
            <Section title="Academy Information">
              {player.academy ? (
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{player.academy}</h4>
                    <p className="text-sm text-green-50">
                      Joined on{" "}
                      {new Date(player.academyJoinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <GiSoccerKick className="text-4xl opacity-80" />
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-green-300 rounded-2xl bg-green-50">
                  <p className="text-gray-700 font-medium mb-2">
                    Not enrolled in any academy yet.
                  </p>
                  <button className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition">
                    Enroll Now
                  </button>
                </div>
              )}
            </Section>
          )}

          {isPlayerData && activeSection === "performance" && (
            <Section title="Performance Overview">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <StatCard
                  label="Tournaments Played"
                  value={player.tournamentsPlayed}
                />
                <StatCard label="Badges" value={player.badges} />
                <StatCard label="Ratings" value={`${player.ratings}/5`} />
                <StatCard label="Regional Rank" value={player.regionalRank} />
                <StatCard label="National Rank" value={player.nationalRank} />
              </div>
            </Section>
          )}

          {isPlayerData && activeSection === "achievements" && (
            <Section title="Achievements & Badges">
              {player.badges > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {[...Array(player.badges)].map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md text-white font-bold"
                    >
                      🏅
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No badges earned yet. Participate in more tournaments!
                </p>
              )}
            </Section>
          )}

          {isPlayerData && activeSection === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Settings
              </h3>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <p className="font-medium text-gray-700">Dark Mode</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Account Management */}
              <div className="py-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Account Management
                </h4>
                <button className="text-green-600 font-medium hover:underline text-sm">
                  Change Password
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Update your login credentials securely.
                </p>
              </div>

              {/* Notifications */}
              <div className="py-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Notifications
                </h4>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="accent-green-600"
                      defaultChecked
                    />
                    Match Reminders
                  </label>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="accent-green-600"
                      defaultChecked
                    />
                    Tournament Updates
                  </label>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input type="checkbox" className="accent-green-600" />
                    Academy Announcements
                  </label>
                </div>
              </div>

              {/* Privacy */}
              <div className="py-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Privacy Settings
                </h4>
                <label className="block text-sm text-gray-700 mb-1">
                  Profile Visibility
                </label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500">
                  <option>Public</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-green-600"
                    defaultChecked
                  />
                  Show stats publicly
                </div>
              </div>

              {/* Logout */}
              <div className="pt-6 text-center">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Logging out will end your current session.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ⚠️ Popup for locked sections */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4"
              >
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  Complete Your Profile
                </h4>
                <p className="text-gray-600 mb-6">
                  You need to complete your profile before accessing other
                  sections.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate("/profile-complete")}
                    className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
                  >
                    Complete Profile
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="border border-gray-300 px-5 py-2 rounded-full hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper Components
function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-8"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      {children}
    </motion.div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold text-green-700 mt-1">{value}</p>
    </div>
  );
}

{
  /* Reusable Components */
}
function FormField({ label, type = "text", defaultValue }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1D21] text-gray-800 dark:text-gray-200 px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-all"
      />
    </div>
  );
}

function FormSelect({ label, defaultValue, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        defaultValue={defaultValue || ""}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1D21] text-gray-800 dark:text-gray-200 px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-all"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
