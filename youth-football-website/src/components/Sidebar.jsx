import { createContext, useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  FiHome,
  FiAward,
  FiMapPin,
  FiUser,
  FiLogOut,
  FiSettings,
  FiSun,
  FiMoon,
  FiShield,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import { logout } from "../redux/slices/authSlice";
import { toggleDarkMode } from "../redux/slices/themeSlice";
import api from "../api/axios";

// ── Sidebar Context ─────────────────────────────────────────────────────
const SidebarContext = createContext(undefined);
const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within Sidebar");
  return ctx;
};

// ── Navigation links config ─────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/home", icon: <FiHome /> },
  { label: "Tournaments", href: "/tournaments", icon: <FaTrophy /> },
  { label: "Academies", href: "/academies", icon: <FiMapPin /> },
  { label: "Profile", href: "/profile", icon: <FiUser /> },
];

// ── Main Sidebar (desktop only — hidden on mobile via `hidden md:flex`) ─
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const dm = useSelector((state) => state.theme.darkMode);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // even if the call fails, clear client state
    }
    dispatch(logout());
    navigate("/Login");
  };

  return (
    <SidebarContext.Provider value={{ open }}>
      <motion.aside
        onMouseEnter={() => setOpen(true)}
        animate={{ width: open ? 260 : 68 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`hidden md:flex flex-col h-screen sticky top-0 z-40 shrink-0 select-none border-r ${
          dm
            ? "bg-[#121212] border-[#87A98D]/15"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Logo */}
        <div className="px-4 pt-6 pb-4 overflow-hidden">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-extrabold shrink-0 ${
                dm ? "bg-[#00FF88]/15 text-[#00FF88]" : "bg-green-100 text-green-600"
              }`}
            >
              B
            </div>
            <motion.span
              animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }}
              className={`text-xl font-extrabold whitespace-nowrap overflow-hidden ${
                dm ? "text-[#00FF88]" : "text-green-600"
              }`}
            >
              Ballers<span className={dm ? "text-gray-300 font-normal" : "text-gray-800 font-normal"}>Adda</span>
            </motion.span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
          {NAV_LINKS.map((link) => (
            <SidebarLink key={link.href} link={link} />
          ))}
        </nav>

        {/* Bottom section — theme toggle + user + logout */}
        <div className={`px-3 py-4 border-t space-y-1 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              dm
                ? "text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/5"
                : "text-gray-600 hover:text-green-600 hover:bg-green-50"
            }`}
          >
            <span className="text-lg shrink-0">{dm ? <FiSun /> : <FiMoon />}</span>
            <motion.span
              animate={{ opacity: open ? 1 : 0, display: open ? "inline-block" : "none" }}
              className="whitespace-nowrap"
            >
              {dm ? "Light Mode" : "Dark Mode"}
            </motion.span>
          </button>

          {/* User avatar */}
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
              dm ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50"
            }`}
          >
            <img
              src={user?.profilePic || "/default-avatar.png"}
              alt="avatar"
              className={`w-8 h-8 rounded-full object-cover border shrink-0 ${
                dm ? "border-[#00FF88]/30" : "border-green-300"
              }`}
              referrerPolicy="no-referrer"
            />
            <motion.span
              animate={{ opacity: open ? 1 : 0, display: open ? "inline-block" : "none" }}
              className={`text-sm font-medium truncate whitespace-nowrap ${dm ? "text-gray-300" : "text-gray-700"}`}
            >
              {user?.username || "Player"}
            </motion.span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              dm
                ? "text-gray-500 hover:text-red-400 hover:bg-red-400/5"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <span className="text-lg shrink-0"><FiLogOut /></span>
            <motion.span
              animate={{ opacity: open ? 1 : 0, display: open ? "inline-block" : "none" }}
              className="whitespace-nowrap"
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </SidebarContext.Provider>
  );
}

// ── SidebarLink ─────────────────────────────────────────────────────────
function SidebarLink({ link }) {
  const { open } = useSidebar();
  const dm = useSelector((state) => state.theme.darkMode);

  return (
    <NavLink
      to={link.href}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isActive
            ? dm
              ? "bg-[#00FF88]/10 text-[#00FF88]"
              : "bg-green-50 text-green-700"
            : dm
              ? "text-gray-400 hover:text-[#00FF88] hover:bg-[#00FF88]/5"
              : "text-gray-600 hover:text-green-600 hover:bg-green-50"
        }`
      }
    >
      <span className="text-lg shrink-0">{link.icon}</span>
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          display: open ? "inline-block" : "none",
        }}
        className="whitespace-nowrap group-hover:translate-x-1 transition-transform duration-150"
      >
        {link.label}
      </motion.span>
    </NavLink>
  );
}
