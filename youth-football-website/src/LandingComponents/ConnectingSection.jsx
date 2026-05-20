import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { Link } from "react-router-dom";

const panels = [
  {
    keyword: "academies",
    title: "For Academies",
    description:
      "Manage your sessions, showcase talent, and grow enrollment — all from one dashboard.",
    cta: "List your academy",
    ctaLink: "/academy",
    image: "/images/Soccer.jpg",
    imagePosition: "center",
  },
  {
    keyword: "players",
    title: "For Players",
    description:
      "Find academies near you, register for tournaments, build your profile, and get seen by scouts.",
    cta: "Join as player",
    ctaLink: "/Register",
    image: "/images/bicycle-kick.png",
    imagePosition: "25% center",
  },
  {
    keyword: "coaches",
    title: "For Coaches",
    description:
      "Track player progress, manage your squads, and discover talent across the platform.",
    cta: "Start coaching",
    ctaLink: "/Register",
    image: "/images/stadium-hero.png",
    imagePosition: "center 30%",
  },
];

const headlineWords = [
  { text: "Connecting", type: "plain" },
  { text: "\n" },
  { text: "academies,", type: "keyword", index: 0 },
  { text: " " },
  { text: "players", type: "keyword", index: 1 },
  { text: "\n" },
  { text: "and ", type: "plain" },
  { text: "coaches", type: "keyword", index: 2 },
];

function Headline({ activeIndex, style, className }) {
  return (
    <h2
      className={`italic ${className || ""}`}
      style={{
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        ...style,
      }}
    >
      {headlineWords.map((word, i) => {
        if (word.text === "\n") return <br key={i} />;
        if (word.text === " ") return <span key={i}> </span>;

        if (word.type === "keyword") {
          const isActive = activeIndex === word.index;
          return (
            <span
              key={i}
              className="transition-all duration-300"
              style={{
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#6ee7b7" : "rgba(52, 211, 153, 0.5)",
              }}
            >
              {word.text}
            </span>
          );
        }

        return (
          <span key={i} className="text-emerald-400/50 font-normal">
            {word.text}
          </span>
        );
      })}
    </h2>
  );
}

function ConnectingSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [introComplete, setIntroComplete] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Intro phase: 0–0.15 of scroll = headline shrink
  // Panel phase: 0.15–1.0 = 3 panels
  const introProgress = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const headlineScale = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const headlineFontSize = useTransform(scrollYProgress, [0, 0.15], [4.5, 2.25]);
  const panelsOpacity = useTransform(scrollYProgress, [0.1, 0.18], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIntroComplete(v > 0.15);

    const panelProgress = Math.max(0, (v - 0.15) / 0.85);
    if (panelProgress < 0.33) setActiveIndex(0);
    else if (panelProgress < 0.66) setActiveIndex(1);
    else setActiveIndex(2);
  });

  return (
    <>
      {/* Desktop */}
      <section
        ref={sectionRef}
        className="hidden lg:block relative bg-[#080b0a]"
        style={{ height: "550vh" }}
      >
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">

          {/* PHASE 1: Large centered headline that shrinks */}
          <motion.div
            className="absolute inset-0 flex items-center justify-start px-20 pointer-events-none"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.12, 0.18], [1, 1, 0]) }}
          >
            <motion.div style={{ fontSize: useTransform(headlineFontSize, (v) => `${v}rem`) }}>
              <Headline activeIndex={-1} style={{ fontSize: "inherit" }} />
            </motion.div>
          </motion.div>

          {/* PHASE 2: 3-column panel layout */}
          <motion.div
            className="max-w-[1440px] w-full mx-auto px-20"
            style={{ opacity: panelsOpacity }}
          >
            <div className="grid grid-cols-[1fr_1.2fr_1fr] gap-12 items-center">

              {/* LEFT: Small headline */}
              <div>
                <Headline activeIndex={activeIndex} className="text-4xl" />
              </div>

              {/* CENTER: Image card */}
              <div className="relative w-full aspect-[4/5] max-h-[520px] rounded-2xl overflow-hidden border border-white/5">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIndex}
                    src={panels[activeIndex].image}
                    alt={panels[activeIndex].title}
                    initial={{ opacity: 0, y: 80, scale: 1.03 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -80, scale: 0.97 }}
                    transition={{
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition: panels[activeIndex].imagePosition,
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* RIGHT: Text + CTA */}
              <div className="min-h-[200px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <h3
                      className="text-white text-xl mb-4"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {panels[activeIndex].title}
                    </h3>
                    <p
                      className="text-white/50 mb-6 max-w-[320px]"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        lineHeight: 1.6,
                        fontSize: "1rem",
                      }}
                    >
                      {panels[activeIndex].description}
                    </p>
                    <Link
                      to={panels[activeIndex].ctaLink}
                      className="inline-block px-6 py-3 bg-emerald-400 text-emerald-950 font-semibold rounded-full text-sm hover:bg-emerald-300 transition-colors duration-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {panels[activeIndex].cta}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile: stacked layout */}
      <section className="lg:hidden bg-[#080b0a] py-20 px-6">
        <h2
          className="text-3xl italic text-emerald-400 mb-16 max-w-[300px]"
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          <span className="text-emerald-400/50 font-normal">Connecting </span>
          <span className="font-bold">academies, </span>
          <span className="font-bold">players </span>
          <span className="text-emerald-400/50 font-normal">and </span>
          <span className="font-bold">coaches</span>
        </h2>

        <div className="flex flex-col gap-20">
          {panels.map((panel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={panel.image}
                  alt={panel.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: panel.imagePosition }}
                />
              </div>
              <div>
                <h3
                  className="text-white text-lg mb-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {panel.title}
                </h3>
                <p
                  className="text-white/50 mb-5"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    fontSize: "0.95rem",
                  }}
                >
                  {panel.description}
                </p>
                <Link
                  to={panel.ctaLink}
                  className="inline-block px-6 py-3 bg-emerald-400 text-emerald-950 font-semibold rounded-full text-sm hover:bg-emerald-300 transition-colors duration-300"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {panel.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export default ConnectingSection;
