import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { WavyBackground } from "./WavyBackground";

const phrases = [
  { text: "Find Academies.", delay: 0 },
  { text: "Play Tournaments.", delay: 0.12 },
  { text: "Get Discovered.", delay: 0.24, accent: true },
];

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#080b0a] flex items-center justify-center overflow-hidden">

      {/* SHADER — cinematic emerald ribbon, bottom-left trajectory */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep atmospheric base layer */}
        <div className="absolute inset-0">
          <WavyBackground
            colors={["#064e3b", "#0f766e", "#0d9488", "#134e4a"]}
            blur={60}
            waveOpacity={0.5}
            speed="slow"
            waveWidth={220}
            origin="bottom-left"
            containerClassName="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Brighter accent ribbon — the "shot trajectory" */}
        <div className="absolute inset-0 z-10 mix-blend-screen">
          <WavyBackground
            colors={["#10b981", "#34d399", "#0d9488"]}
            blur={30}
            waveOpacity={0.6}
            speed="fast"
            waveWidth={100}
            origin="bottom-left"
            containerClassName="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Floodlight bloom — top-right, like stadium lighting */}
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none" />

        {/* Center readability darkening */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(8,11,10,0.65)_0%,_transparent_70%)] z-20 pointer-events-none" />

        {/* Edge vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(8,11,10,0.8)_100%)] z-20 pointer-events-none" />
      </div>

      {/* Tactical football geometry — subtle formation dots */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-[0.04]">
        {/* Formation circles — 4-3-3 inspired positions */}
        {[
          { x: "50%", y: "85%" },
          { x: "20%", y: "65%" }, { x: "40%", y: "60%" }, { x: "60%", y: "60%" }, { x: "80%", y: "65%" },
          { x: "30%", y: "40%" }, { x: "50%", y: "35%" }, { x: "70%", y: "40%" },
          { x: "25%", y: "18%" }, { x: "50%", y: "12%" }, { x: "75%", y: "18%" },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full border border-white"
            style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}
          />
        ))}
        {/* Passing lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="50%" y1="85%" x2="40%" y2="60%" stroke="white" strokeWidth="0.5" />
          <line x1="50%" y1="85%" x2="60%" y2="60%" stroke="white" strokeWidth="0.5" />
          <line x1="40%" y1="60%" x2="50%" y2="35%" stroke="white" strokeWidth="0.5" />
          <line x1="60%" y1="60%" x2="50%" y2="35%" stroke="white" strokeWidth="0.5" />
          <line x1="50%" y1="35%" x2="50%" y2="12%" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* CONTENT */}
      <div className="max-w-[1440px] w-full mx-auto relative min-h-screen flex items-center justify-center px-6 lg:px-20 pt-20 z-30">
        <div className="flex flex-col items-center text-center w-full max-w-[820px] relative">

          {/* Eyebrow — establishes category instantly */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-emerald-400 cursor-pointer"
              fill="currentColor"
              whileHover={{ rotate: 180, scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 1a11 11 0 0 1 6.36 2L14 7.5 12 3.5 10 7.5 7.64 3A11 11 0 0 1 12 1z" opacity="0.8" />
              <path d="M23 12a11 11 0 0 1-2 6.36L16.5 14l4-2-4-2 4.5-4.36A11 11 0 0 1 23 12z" opacity="0.8" />
              <path d="M12 23a11 11 0 0 1-6.36-2L10 16.5l2 4 2-4 2.36 4.5A11 11 0 0 1 12 23z" opacity="0.8" />
              <path d="M1 12a11 11 0 0 1 2-6.36L7.5 10l-4 2 4 2-4.5 4.36A11 11 0 0 1 1 12z" opacity="0.8" />
              <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
            </motion.svg>
            <span
              className="text-emerald-400/90 text-xs tracking-[0.2em] uppercase"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
            >
              Youth Football Platform
            </span>
            <motion.svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-emerald-400 cursor-pointer"
              fill="currentColor"
              whileHover={{ rotate: -180, scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 1a11 11 0 0 1 6.36 2L14 7.5 12 3.5 10 7.5 7.64 3A11 11 0 0 1 12 1z" opacity="0.8" />
              <path d="M23 12a11 11 0 0 1-2 6.36L16.5 14l4-2-4-2 4.5-4.36A11 11 0 0 1 23 12z" opacity="0.8" />
              <path d="M12 23a11 11 0 0 1-6.36-2L10 16.5l2 4 2-4 2.36 4.5A11 11 0 0 1 12 23z" opacity="0.8" />
              <path d="M1 12a11 11 0 0 1 2-6.36L7.5 10l-4 2 4 2-4.5 4.36A11 11 0 0 1 1 12z" opacity="0.8" />
              <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
            </motion.svg>
          </motion.div>

          {/* Headline — three action phrases, each a product feature */}
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0 }}>
            {phrases.map(({ text, delay, accent }) => (
              <motion.span
                key={text}
                initial={{ opacity: 0, y: 35, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`block text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] ${
                  accent
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400"
                    : "text-white"
                }`}
              >
                {text}
              </motion.span>
            ))}
          </h1>

          {/* Subheading — clear product explanation */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-white/50 max-w-[480px] mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.6, fontSize: "1.05rem" }}
          >
            One platform to discover academies, register for tournaments, build your player profile, and get seen by coaches and scouts.
          </motion.p>

          {/* CTAs — football-specific actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
          >
            <Link
              to="/Register"
              className="group inline-flex items-center justify-center gap-3 pl-6 pr-1.5 py-1.5 bg-emerald-400 text-emerald-950 font-bold rounded-full shadow-[0_4px_24px_rgb(16,185,129,0.25)] hover:shadow-[0_4px_32px_rgb(16,185,129,0.4)] hover:bg-emerald-300 transition-all duration-300"
            >
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Join as Player
              </span>
              <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 overflow-hidden">
                <FiChevronRight className="text-emerald-950 w-3 h-3 sm:w-3.5 sm:h-3.5 absolute transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:translate-x-3" />
                <FiArrowRight className="text-emerald-950 w-3 h-3 sm:w-3.5 sm:h-3.5 absolute transition-all duration-300 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            </Link>

            <Link
              to="/tournaments"
              className="group inline-flex items-center justify-center gap-3 pl-6 pr-1.5 py-1.5 border border-white/15 text-white/90 font-semibold rounded-full hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300"
            >
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                Explore Tournaments
              </span>
              <div className="relative flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/80 overflow-hidden">
                <FiChevronRight className="text-white w-3 h-3 sm:w-3.5 sm:h-3.5 absolute transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:translate-x-3" />
                <FiArrowRight className="text-white w-3 h-3 sm:w-3.5 sm:h-3.5 absolute transition-all duration-300 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            </Link>
          </motion.div>

          {/* Social proof hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex items-center gap-4 sm:gap-6 mt-10 sm:mt-14 text-white/25 text-[10px] sm:text-xs tracking-wide uppercase"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            <span>500+ Players</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>30+ Academies</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Live Tournaments</span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
