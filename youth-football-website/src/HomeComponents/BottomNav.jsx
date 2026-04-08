// src/components/BottomNav.jsx
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaTrophy, FaUser, FaSchool, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const dm = useSelector((state) => state.theme.darkMode);

  const navItems = [
    { name: "Home", path: "/home", icon: <FaHome /> },
    { name: "Tournaments", path: "/tournaments", icon: <FaTrophy /> },
    { name: "Academies", path: "/academies", icon: <FaSchool /> },
    { name: "Community", path: "/community", icon: <FaUsers /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 w-full border-t shadow-lg z-50 md:hidden transition-colors duration-300 ${dm ? "bg-[#121212] border-[#87A98D]/20" : "bg-white border-gray-200"}`}>
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center text-sm transition-all ${
                isActive
                  ? dm
                    ? "text-[#00FF88] scale-110 font-semibold"
                    : "text-green-600 scale-110 font-semibold"
                  : dm
                    ? "text-gray-500 hover:text-[#00FF88]"
                    : "text-gray-500 hover:text-green-600"
              }`}
            >
              <div className="text-2xl">{item.icon}</div>
              <span className="text-[10px] mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
