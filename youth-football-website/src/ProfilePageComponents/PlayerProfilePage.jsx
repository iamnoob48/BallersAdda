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
import { User, Trophy, BarChart3, Award, Settings, School, CalendarIcon } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import { CalendarPicker } from "../components/ui/calenderpicker.jsx";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover.jsx";

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

const FormField = ({ label, name, type = "text", value, onChange, dm }) => (
  <div>
    <label className={`block text-xs font-extrabold uppercase mb-1.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
    <input
      type={type} name={name} value={value || ""} onChange={onChange}
      className={`w-full border rounded-xl px-4 py-2.5 font-semibold focus:ring-2 outline-none transition-all ${dm ? "bg-[#111] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:ring-[#00FF88]/30 focus:border-[#00FF88]" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-green-600 focus:border-green-600"}`}
      placeholder={`Enter ${label}`}
    />
  </div>
);

function EditProfileModal({ onClose, player, onSave, dm }) {
  const [formData, setFormData] = useState({
    firstName: player?.firstName || "", lastName: player?.lastName || "",
    displayName: player?.displayName || "",
    dateOfBirth: player?.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split("T")[0] : "",
    gender: player?.gender || "", position: player?.position || "",
    height: player?.height || "", weight: player?.weight || "",
    dominantFoot: player?.dominantFoot || "", bio: player?.bio || "",
  });
  const [calOpen, setCalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedDob = formData.dateOfBirth ? new Date(formData.dateOfBirth + "T00:00:00") : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-2xl rounded-2xl max-h-[85vh] flex flex-col overflow-hidden font-['Nunito'] ${dm ? "bg-[#1a1a1a] shadow-[0_8px_0_0_rgba(0,0,0,0.3)] border border-[#2a2a2a]" : "bg-white shadow-[0_8px_0_0_rgba(0,0,0,0.08)]"}`}
      >
        <div className={`p-5 border-b flex justify-between items-center ${dm ? "border-[#2a2a2a] bg-[#151515]" : "border-gray-100 bg-gray-50"}`}>
          <h3 className={`font-extrabold text-lg ${dm ? "text-white" : "text-gray-800"}`}>Edit Profile</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition ${dm ? "text-gray-400 hover:bg-[#2a2a2a] hover:text-white" : "hover:bg-gray-200"}`}><FaTimes /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <FormField dm={dm} label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <FormField dm={dm} label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <FormField dm={dm} label="Display Name" name="displayName" value={formData.displayName} onChange={handleChange} />
            <div>
              <label className={`block text-xs font-extrabold uppercase mb-1.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>Date of Birth</label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-left font-semibold focus:ring-2 outline-none transition-all ${dm ? "bg-[#111] border-[#2a2a2a] focus:ring-[#00FF88]/30 focus:border-[#00FF88]" : "bg-gray-50 border-gray-200 focus:ring-green-600 focus:border-green-600"}`}
                  >
                    <span className={selectedDob ? (dm ? "text-white" : "text-gray-900") : (dm ? "text-gray-600" : "text-gray-400")}>
                      {selectedDob
                        ? selectedDob.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "Pick a date"}
                    </span>
                    <CalendarIcon className={`w-4 h-4 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-0 bg-transparent shadow-none" align="start">
                  <CalendarPicker
                    className={dm ? "" : "!bg-white !text-gray-900 !border-gray-200 [&_button]:!text-gray-700 [&_button:hover]:!bg-green-50 [&_button:hover]:!text-green-700 [&_[data-selected-single=true]]:!bg-green-600 [&_[data-selected-single=true]]:!text-white [&_[data-selected-single=true]:hover]:!bg-green-700 [&_[data-selected-single=true]:hover]:!text-white"}
                    {...(!dm && {
                      classNames: {
                        caption_label: "font-medium select-none text-gray-800 flex h-8 items-center gap-1 rounded-xl pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-gray-400",
                        dropdown_root: "relative rounded-xl border border-gray-200 shadow-sm has-focus:border-green-600 has-focus:ring-[3px] has-focus:ring-green-600/20",
                        dropdown: "absolute inset-0 bg-white opacity-0",
                        weekday: "flex-1 rounded-xl text-[0.8rem] font-normal text-gray-500 select-none",
                        button_previous: "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all size-(--cell-size) p-0 select-none aria-disabled:opacity-50 hover:bg-green-50 hover:text-green-600 text-gray-500",
                        button_next: "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all size-(--cell-size) p-0 select-none aria-disabled:opacity-50 hover:bg-green-50 hover:text-green-600 text-gray-500",
                        today: "rounded-xl bg-green-50 text-green-600 data-[selected=true]:rounded-none",
                        outside: "text-gray-300 aria-selected:text-gray-400",
                      }
                    })}
                    mode="single"
                    captionLayout="dropdown"
                    selected={selectedDob}
                    defaultMonth={selectedDob || new Date(2005, 0)}
                    onSelect={(date) => {
                      if (date) {
                        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                        setFormData((prev) => ({ ...prev, dateOfBirth: iso }));
                      } else {
                        setFormData((prev) => ({ ...prev, dateOfBirth: "" }));
                      }
                      setCalOpen(false);
                    }}
                    fromYear={1926}
                    toYear={new Date().getFullYear()}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-5">
              <FormField dm={dm} label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
              <FormField dm={dm} label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            </div>
            <FormField dm={dm} label="Position" name="position" value={formData.position} onChange={handleChange} />
            <div>
              <label className={`block text-xs font-extrabold uppercase mb-1.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>Dominant Foot</label>
              <select name="dominantFoot" value={formData.dominantFoot} onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 font-semibold focus:ring-2 outline-none transition-all ${dm ? "bg-[#111] border-[#2a2a2a] text-white focus:ring-[#00FF88]/30 focus:border-[#00FF88]" : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-green-600"}`}>
                <option value="">Select Foot</option>
                <option value="RIGHT">Right</option>
                <option value="LEFT">Left</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-extrabold uppercase mb-1.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>Bio</label>
              <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-3 font-semibold focus:ring-2 outline-none resize-none ${dm ? "bg-[#111] border-[#2a2a2a] text-white focus:ring-[#00FF88]/30 focus:border-[#00FF88]" : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-green-600"}`} />
            </div>
          </form>
        </div>
        <div className={`p-5 border-t flex justify-end gap-3 ${dm ? "border-[#2a2a2a] bg-[#1a1a1a]" : "border-gray-100 bg-white"}`}>
          <button onClick={onClose} className={`px-6 py-2.5 rounded-xl font-extrabold transition ${dm ? "text-gray-400 hover:bg-[#2a2a2a] hover:text-white" : "text-gray-600 hover:bg-gray-50"}`}>Cancel</button>
          <button onClick={() => onSave(formData)} className={`px-8 py-2.5 rounded-xl text-white font-extrabold active:shadow-none active:translate-y-[4px] transition-all ${dm ? "bg-[#00FF88] text-[#121212] shadow-[0_4px_0_0_#00CC6A] hover:bg-[#00e67a]" : "bg-green-600 shadow-[0_4px_0_0_#15803d] hover:bg-green-700"}`}>
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
            dm={dm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
