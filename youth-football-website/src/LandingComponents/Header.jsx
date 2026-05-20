import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/button";
import { Menu, X } from "lucide-react";

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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0510]/90 shadow-lg backdrop-blur-xl border-b border-white/5 py-2"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold flex items-center gap-1 hover:scale-105 transition-transform duration-300">
          <a href="/">
            <span className="text-emerald-400">Ballers</span>
            <span className="text-white/80 font-normal">Adda</span>
          </a>
        </h1>

        <ul className="hidden md:flex gap-10 font-medium">
          {navLinks.map((item) => (
            <li key={item.name} className="relative group cursor-pointer">
              <Link
                to={item.path}
                className="text-white/70 group-hover:text-emerald-400 transition-all duration-300 text-sm tracking-wide"
              >
                {item.name}
              </Link>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-400 transition-all duration-300 group-hover:w-full" />
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3">
          <Button
            className="border border-white/15 bg-white/5 text-white/80 font-medium px-5 py-2 rounded-full text-sm hover:bg-white/10 hover:text-white transition duration-300 backdrop-blur-sm"
            onClick={() => navigate("/Login")}
          >
            Login
          </Button>
          <Button
            className="bg-emerald-500 text-emerald-950 font-semibold px-5 py-2 rounded-full text-sm shadow-[0_4px_20px_rgb(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_4px_25px_rgb(16,185,129,0.4)] transition duration-300"
            onClick={() => navigate("/Register")}
          >
            Register
          </Button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/80 hover:text-emerald-400 hover:scale-110 transition-all duration-200"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-[#0a0510]/95 backdrop-blur-xl shadow-lg transform transition-transform duration-300 ease-in-out z-40 border-l border-white/5 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start p-6 gap-6 mt-16">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-white/70 text-lg font-medium hover:text-emerald-400 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <hr className="w-full border-t border-white/10 my-2" />

          <Button
            className="w-full border border-white/15 bg-white/5 text-white/80 font-medium py-2 rounded-full hover:bg-white/10 transition"
            onClick={() => {
              navigate("/Login");
              setMenuOpen(false);
            }}
          >
            Login
          </Button>
          <Button
            className="w-full bg-emerald-500 text-emerald-950 font-semibold py-2 rounded-full shadow-md hover:bg-emerald-400 transition"
            onClick={() => {
              navigate("/Register");
              setMenuOpen(false);
            }}
          >
            Register
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}

export default Header;
