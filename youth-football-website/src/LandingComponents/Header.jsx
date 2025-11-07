import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; // icons

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Tournaments", path: "/tournaments" },
    { name: "Academies", path: "/academy" },
    { name: "About Us", path: "/host" },
    { name: "Features", path: "/register" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b bg-white mb-111 ${
        scrolled
          ? "bg-white/80 shadow-md backdrop-blur-md border-green-200 py-2"
          : "bg-transparent border-green-400 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-green-600 flex items-center gap-1 hover:scale-105 transition-transform duration-300">
          <a href="/">
            Ballers<span className="text-gray-800 font-normal">Adda</span>
          </a>
        </h1>

        <ul className="hidden md:flex gap-10 text-gray-800 font-medium">
          {navLinks.map((item) => (
            <li key={item.name} className="relative group cursor-pointer">
              <Link
                to={item.path}
                className="group-hover:text-green-600 transition-all duration-300"
              >
                {item.name}
              </Link>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-600 transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-4">
          <Button
            className="border-2 border-green-600 bg-white text-green-700 font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-green-50 hover:scale-105 transition duration-300"
            onClick={() => navigate("/Login")}
          >
            Login
          </Button>
          <Button
            className="bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-green-700 hover:shadow-green-500/40 hover:scale-105 transition duration-300"
            onClick={() => navigate("/Register")}
          >
            Register
          </Button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-green-700 hover:scale-110 transition-transform duration-200"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start p-6 gap-6 mt-16">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-gray-800 text-lg font-medium hover:text-green-600 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <hr className="w-full border-t border-gray-200 my-2" />

          <Button
            className="w-full border-2 border-green-600 bg-white text-green-700 font-semibold py-2 rounded-lg hover:bg-green-50 transition"
            onClick={() => {
              navigate("/Login");
              setMenuOpen(false);
            }}
          >
            Login
          </Button>
          <Button
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-green-700 transition"
            onClick={() => {
              navigate("/Register");
              setMenuOpen(false);
            }}
          >
            Register
          </Button>
        </div>
      </div>

      {/* Background overlay when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}

export default Header;
