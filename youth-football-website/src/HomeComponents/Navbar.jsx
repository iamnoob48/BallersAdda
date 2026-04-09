import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { FiMessageCircle } from "react-icons/fi";
import { IoMdNotifications } from "react-icons/io";
import { useSelector } from "react-redux";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dm = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  const IconButton = ({ icon: Icon, size = 32, onClick }) => (
    <Button
      variant="ghost"
      className={dm ? "hover:bg-[#1a1a1a] text-[#00FF88]" : "hover:bg-green-50 text-green-700"}
      onClick={onClick}
    >
      <Icon style={{ width: size, height: size }} />
    </Button>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? dm
            ? "bg-[#121212]/90 backdrop-blur-md shadow-md border-[#87A98D]/20 py-2"
            : "md:bg-white/80 md:backdrop-blur-md md:shadow-md border-green-200 py-2 bg-white shadow-sm"
          : dm
            ? "bg-[#121212] border-[#87A98D]/10 py-4"
            : "bg-white border-green-400 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <h1 className={`text-2xl font-extrabold flex items-center gap-1 hover:scale-105 transition-transform duration-300 ${dm ? "text-[#00FF88]" : "text-green-600"}`}>
          <Link to="/">
            Ballers<span className={dm ? "text-gray-300 font-normal" : "text-gray-800 font-normal"}>Adda</span>
          </Link>
        </h1>

        

        <div className="hidden md:flex gap-4 items-center ">
          <IconButton icon={FiMessageCircle} size={25} />
          <IconButton icon={IoMdNotifications} size={25} />
          
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
