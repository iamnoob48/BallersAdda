import { useEffect, useState } from "react";
import TournamentsList from "../pages/TournamentList";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={` fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b-2 ${
        scrolled ? "bg-white/80 shadow-md backdrop-blur" : "bg-transparent border-green-500"
      }`}
    >
      <div className="max-w-7xl mx-4 px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-600 animate-fade-in">
          <a href="/">Ballers<span className="text-black">Adda</span></a>
        </h1>
        <ul className="hidden md:flex gap-8 text-gray-700 font-medium">
        {[
        { name: "Tournaments", path: "/tournaments" },
        { name: "Academies", path: "/academy" },
        { name: "Host", path: "/host" },
        { name: "Register", path: "/register" },
        ].map((item) => (
        <li
        key={item.name}
        className="relative group cursor-pointer transition duration-200"
        >
        <Link
        to={item.path}
        className="group-hover:text-green-600 transition"
        >
        {item.name}
        </Link>
        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-600 transition-all duration-300 group-hover:w-full"></span>
        </li>
        ))}
        </ul>


        <button className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold shadow-md hover:shadow-green-500/60 transition hover:scale-105 duration-300 glow-button" onClick={()=>navigate("/Login")}>
          Login/Signup
        </button>
      </div>
    </nav>
  );
}

export default Header
