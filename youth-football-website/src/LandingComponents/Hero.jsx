import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { IoFootball } from "react-icons/io5";
import { WavyBackground } from "./WavyBackground";

const line1Words = ["Every", "Baller", "Deserves"];
const accentWord = "A Stage.";

function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0510] flex items-center justify-center overflow-hidden">

      {/* SHADER BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#0a0510] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <WavyBackground
            colors={["#064e3b", "#0f766e", "#0d9488", "#134e4a"]}
            blur={50}
            waveOpacity={0.7}
            speed="slow"
            waveWidth={200}
            origin="bottom-left"
            containerClassName="absolute inset-0 w-full h-full"
          />
        </div>

        <div className="absolute inset-0 z-10 mix-blend-screen">
          <WavyBackground
            colors={["#10b981", "#34d399", "#00FF88", "#0d9488"]}
            blur={25}
            waveOpacity={0.8}
            speed="fast"
            waveWidth={120}
            origin="bottom-left"
            containerClassName="absolute inset-0 w-full h-full"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0510]/90 via-[#0a0510]/30 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(10,5,16,0.7)_100%)] z-20 pointer-events-none" />
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-[1440px] w-full mx-auto relative min-h-screen flex items-center justify-center px-6 lg:px-20 z-20">

        <div className="flex flex-col items-center text-center space-y-8 w-full max-w-[900px] relative z-10">

          {/* Football icon accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <IoFootball className="w-10 h-10 text-emerald-400/60" />
          </motion.div>

          <div>
            <h1 className="text-white" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.95 }}>
              {/* Line 1: EVERY BALLER DESERVES */}
              <span className="block text-4xl md:text-5xl lg:text-6xl">
                {line1Words.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block mr-[0.18em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>

              {/* Line 2: A STAGE. — accent */}
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: line1Words.length * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="block text-5xl md:text-7xl lg:text-8xl mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400"
              >
                {accentWord}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 text-gray-400 text-base md:text-lg max-w-[520px] mx-auto"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.5 }}
            >
              Tournaments, academies, and player profiles — all in one place. Built for grassroots football, from local grounds to competitive leagues.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-1"
          >
            <Link
              to="/Register"
              className="group relative flex items-center gap-3 px-7 py-3.5 bg-emerald-500 text-emerald-950 font-bold rounded-full shadow-[0_4px_20px_rgb(16,185,129,0.3)] hover:shadow-[0_6px_30px_rgb(16,185,129,0.45)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="text-[14px] tracking-wide">Get Started</span>
              <FiArrowRight className="text-emerald-950 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              to="/tournaments"
              className="group relative flex items-center gap-3 px-7 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 text-gray-300 font-semibold rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
            >
              <span className="text-[14px] tracking-wide">Browse Tournaments</span>
              <FiArrowRight className="text-current w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

export default Hero;
