import { useState, useEffect } from "react";
import { FiMessageCircle } from "react-icons/fi";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MobileTopBar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dm = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 md:hidden 
        ${
          scrolled
            ? dm
              ? "bg-[#121212]/80 backdrop-blur-lg shadow-md border-[#87A98D]/20"
              : "bg-white/60 backdrop-blur-lg shadow-md border-green-200/60"
            : dm
              ? "bg-[#121212]/40 backdrop-blur-sm border-[#87A98D]/10"
              : "bg-white/20 backdrop-blur-sm border-green-100/40"
        }
        transition-all duration-300 
        flex justify-between items-center px-5 py-3
      `}
    >
      <h1
        onClick={() => navigate("/home")}
        className={`text-xl font-extrabold flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform ${dm ? "text-[#00FF88]" : "text-green-600"}`}
      >
        Ballers<span className={dm ? "text-gray-300 font-normal" : "text-gray-800 font-normal"}>Adda</span>
      </h1>

      <div className={`flex items-center gap-4 ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
        <IoMdNotifications
          size={24}
          className={`hover:scale-110 cursor-pointer transition-transform duration-150 ${dm ? "hover:text-[#00DCFF]" : "hover:text-green-800"}`}
        />
        <FiMessageCircle
          size={22}
          className={`hover:scale-110 cursor-pointer transition-transform duration-150 ${dm ? "hover:text-[#00DCFF]" : "hover:text-green-800"}`}
        />
      </div>
    </header>
  );
}
