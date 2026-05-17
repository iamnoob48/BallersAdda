import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPlayerProfile,
  fetchPlayerAcademy,
  fetchMyTournaments,
  fetchAcademyHistory,
  updatePlayerProfile,
} from "../redux/slices/playerSlice";
import { useGetAchievementsQuery } from "../redux/achievementsApi.js";
import { User, Trophy, BarChart3, Award, Settings, School } from "lucide-react";
import { FaTimes } from "react-icons/fa";

import ProfileIdentityHeader from "./ProfileIdentityHeader";
import ProfileStatsGrid from "./ProfileStatsGrid";
import ProfileBadgesRow from "./ProfileBadgesRow";
import ProfileTournaments from "./ProfileTournaments";
import ProfilePersonalDetails from "./ProfilePersonalDetails";
import ProfileSettingsSection from "./ProfileSettingsSection";
import ProfileAcademyTab from "./ProfileAcademyTab";

const TABS = [
  { id: "about", label: "About", icon: User },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "academy", label: "Academy", icon: School },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "badges", label: "Badges", icon: Award },
  { id: "settings", label: "Settings", icon: Settings },
];

const FormField = ({ label, name, type = "text", value, onChange }) => (
  <div>
    <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1.5">{label}</label>
    <input
      type={type} name={name} value={value || ""} onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-semibold focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all placeholder:text-gray-400"
      placeholder={`Enter ${label}`}
    />
  </div>
);

function EditProfileModal({ onClose, player, onSave }) {
  const [formData, setFormData] = useState({
    firstName: player?.firstName || "", lastName: player?.lastName || "",
    displayName: player?.displayName || "", age: player?.age || "",
    gender: player?.gender || "", position: player?.position || "",
    height: player?.height || "", weight: player?.weight || "",
    dominantFoot: player?.dominantFoot || "", bio: player?.bio || "",
  });

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
        className="bg-white w-full max-w-2xl rounded-2xl shadow-[0_8px_0_0_rgba(0,0,0,0.08)] max-h-[85vh] flex flex-col overflow-hidden font-['Nunito']"
      >
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-extrabold text-lg text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><FaTimes /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <FormField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <FormField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <FormField label="Display Name" name="displayName" value={formData.displayName} onChange={handleChange} />
            <FormField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
            <div className="md:col-span-2 grid grid-cols-2 gap-5">
              <FormField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
              <FormField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            </div>
            <FormField label="Position" name="position" value={formData.position} onChange={handleChange} />
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1.5">Dominant Foot</label>
              <select name="dominantFoot" value={formData.dominantFoot} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-semibold focus:ring-2 focus:ring-green-600 outline-none transition-all">
                <option value="">Select Foot</option>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-gray-500 uppercase mb-1.5">Bio</label>
              <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold focus:ring-2 focus:ring-green-600 outline-none resize-none" />
            </div>
          </form>
        </div>
        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 font-extrabold hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-extrabold shadow-[0_4px_0_0_#15803d] hover:bg-green-700 active:shadow-none active:translate-y-[4px] transition-all">
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PlayerProfilePage() {
  const dispatch = useDispatch();
  const dm = useSelector((state) => state.theme.darkMode);
  const player = useSelector((state) => state.player.profile);
  const profilePic = useSelector((state) => state.player.profilePic);
  const user = useSelector((state) => state.auth.user);
  const academy = useSelector((state) => state.player.academy);
  const tournaments = useSelector((state) => state.player.myTournaments);
  const academyHistory = useSelector((state) => state.player.academyHistory);
  const academyHistoryLoading = useSelector((state) => state.player.academyHistoryLoading);
  const [activeTab, setActiveTab] = useState("about");
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: achievementData } = useGetAchievementsQuery();

  useEffect(() => {
    if (!player) dispatch(fetchPlayerProfile());
    if (!academy) dispatch(fetchPlayerAcademy());
    if (!tournaments?.length) dispatch(fetchMyTournaments());
    if (academyHistory === null) dispatch(fetchAcademyHistory());
  }, []);

  const handleSaveProfile = async (formData) => {
    await dispatch(updatePlayerProfile(formData));
    setShowEditModal(false);
  };

  return (
    <div
      className={`min-h-screen font-['Nunito'] pb-20 md:pb-10 transition-colors duration-300 ${dm
          ? "bg-[#121212] selection:bg-green-400/30 selection:text-green-200"
          : "bg-[#F7F7F7] selection:bg-green-200 selection:text-green-900"
        }`}
    >
      <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <ProfileIdentityHeader
          dm={dm}
          player={player}
          profilePic={profilePic}
          user={user}
          academy={academy}
          achievementData={achievementData}
          onEditProfile={() => setShowEditModal(true)}
        />

        {player && (
          <div
            className={`rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${dm
                ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                : "bg-white border border-gray-200"
              }`}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all whitespace-nowrap flex-1 justify-center ${isActive
                      ? dm
                        ? "bg-[#00FF88] text-[#121212] shadow-[0_4px_0_0_#00CC6A]"
                        : "bg-green-600 text-white shadow-[0_4px_0_0_#15803d]"
                      : dm
                        ? "text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/5"
                        : "text-gray-500 hover:text-green-700 hover:bg-green-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {player && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {activeTab === "about" && (
                <ProfileStatsGrid
                  dm={dm}
                  player={player}
                  achievementData={achievementData}
                />
              )}
              {activeTab === "tournaments" && (
                <ProfileTournaments dm={dm} tournaments={tournaments} />
              )}
              {activeTab === "academy" && (
                <ProfileAcademyTab
                  dm={dm}
                  academyHistory={academyHistory}
                  academyHistoryLoading={academyHistoryLoading}
                />
              )}
              {activeTab === "stats" && (
                <ProfilePersonalDetails
                  dm={dm}
                  player={player}
                  achievementData={achievementData}
                />
              )}
              {activeTab === "badges" && (
                <ProfileBadgesRow dm={dm} achievementData={achievementData} />
              )}
              {activeTab === "settings" && <ProfileSettingsSection dm={dm} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            onClose={() => setShowEditModal(false)}
            player={player}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
