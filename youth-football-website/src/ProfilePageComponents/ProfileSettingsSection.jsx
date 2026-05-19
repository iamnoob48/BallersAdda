import { motion } from "motion/react";
import { FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { FiUser, FiBell, FiShield, FiChevronRight } from "react-icons/fi";
import { Settings } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import { logout } from "../redux/slices/authSlice";
import { resetPlayerState } from "../redux/slices/playerSlice";
import { signOut } from "../lib/auth-client.js";

export default function ProfileSettingsSection({ dm }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await signOut(); } catch {}
    dispatch(logout());
    dispatch(resetPlayerState());
    navigate("/login");
  };

  const settingItems = [
    {
      id: "darkmode",
      icon: dm ? <FaMoon /> : <FaSun />,
      iconBg: "bg-amber-500/10 text-amber-500",
      name: "Dark Mode",
      description: "Switch between light and dark theme",
      type: "toggle",
      active: dm,
      onToggle: () => dispatch(toggleDarkMode()),
    },
    {
      id: "privacy",
      icon: <FiUser />,
      iconBg: dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-50 text-green-600",
      name: "Account Privacy",
      description: "Manage who can see your profile",
      type: "nav",
    },
    {
      id: "notifications",
      icon: <FiBell />,
      iconBg: "bg-blue-500/10 text-blue-500",
      name: "Notifications",
      description: "Match reminders and updates",
      type: "nav",
    },
    {
      id: "security",
      icon: <FiShield />,
      iconBg: dm ? "bg-purple-400/10 text-purple-400" : "bg-purple-50 text-purple-500",
      name: "Security",
      description: "Password and login settings",
      type: "nav",
    },
  ];

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] ${
          dm
            ? "bg-[#1a1a1a] border border-[#87A98D]/15"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dm ? "bg-gray-700/50" : "bg-gray-100"}`}>
            <Settings className={`w-5 h-5 ${dm ? "text-gray-400" : "text-gray-500"}`} />
          </div>
          <h3 className={`text-xl font-extrabold ${dm ? "text-gray-100" : "text-gray-900"}`}>
            Settings
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {settingItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_0_0_rgba(0,0,0,0.06)] transition-all ${
              dm
                ? "bg-[#1a1a1a] border border-[#87A98D]/15"
                : "bg-white border border-gray-200"
            }`}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg shrink-0 ${item.iconBg}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-extrabold text-sm ${dm ? "text-gray-100" : "text-gray-900"}`}>
                {item.name}
              </h4>
              <p className={`text-xs mt-0.5 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {item.description}
              </p>
            </div>

            {item.type === "toggle" ? (
              <button
                onClick={item.onToggle}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none shadow-[0_2px_0_0_rgba(0,0,0,0.1)] ${
                  item.active
                    ? dm ? "bg-[#00FF88]" : "bg-green-600"
                    : dm ? "bg-gray-700" : "bg-gray-300"
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-6 h-6 rounded-full shadow-md ${
                    item.active
                      ? "left-[30px] bg-white"
                      : "left-1 bg-white"
                  }`}
                />
              </button>
            ) : (
              <FiChevronRight className={`w-5 h-5 shrink-0 ${dm ? "text-gray-500" : "text-gray-400"}`} />
            )}
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl font-extrabold text-sm transition-all ${
          dm
            ? "bg-red-950/30 text-red-400 border border-red-900/30 hover:bg-red-950/50"
            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
        }`}
      >
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          dm ? "bg-red-950/50 text-red-400" : "bg-red-100 text-red-600"
        }`}>
          <FaSignOutAlt />
        </div>
        <div className="text-left">
          <h4 className="font-extrabold">Log Out</h4>
          <p className="text-xs opacity-70 font-semibold">Sign out of your account</p>
        </div>
      </motion.button>
    </div>
  );
}
