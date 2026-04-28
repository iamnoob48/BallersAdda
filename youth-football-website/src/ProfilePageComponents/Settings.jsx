import { motion } from "framer-motion";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import { logout } from "../redux/slices/authSlice";
import { resetPlayerState } from "../redux/slices/playerSlice";
import api from "../api/axios";

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

export default function Settings() {
  const dm       = useSelector((state) => state.theme.darkMode);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      dispatch(resetPlayerState());
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <SectionWrapper dm={dm}>
      <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>Account Settings</h3>
      <div className="space-y-3">
        {/* Dark mode toggle */}
        <div className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left border ${dm ? "bg-[#1a1a1a] border-green-900/20" : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dm ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-100 text-gray-600"}`}>
            {dm ? <FaMoon /> : <FaSun />}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>Dark Mode</h4>
            <p className={`text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>Switch between light and dark theme</p>
          </div>
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

        <SettingsItem icon={<FaUser />}    title="Account Privacy"  desc="Manage who can see your profile" dm={dm} />
        <SettingsItem icon={<GiWhistle />} title="Notifications"    desc="Match reminders and updates"    dm={dm} />

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left group ${dm ? "bg-red-950/30 text-red-400 hover:bg-red-950/50" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dm ? "bg-red-950/50 text-red-400 group-hover:bg-red-900/50" : "bg-red-100 text-red-600 group-hover:bg-red-200"}`}>
            <FaSignOutAlt />
          </div>
          <div>
            <h4 className="font-bold">Log Out</h4>
            <p className="text-xs opacity-70">Sign out of your account</p>
          </div>
        </button>
      </div>
    </SectionWrapper>
  );
}
