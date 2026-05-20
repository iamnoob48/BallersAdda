import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiAward,
  FiUsers,
  FiBarChart2,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";

const features = [
  {
    title: "Discover Academies",
    description:
      "Find top-rated football academies near you. Filter by location, age group, and skill level to find the perfect fit.",
    icon: FiMapPin,
    span: "col-span-2 row-span-1",
    accent: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/15",
    size: "large",
  },
  {
    title: "Player Profiles",
    description:
      "Build your football CV. Track stats, showcase highlights, and get discovered by scouts and coaches.",
    icon: FiUsers,
    span: "col-span-1 row-span-2",
    accent: "from-cyan-500/20 to-blue-500/10",
    iconBg: "bg-cyan-500/15",
    size: "tall",
  },
  {
    title: "Live Tournaments",
    description:
      "Register your team, track fixtures, and follow live scores — all in one place.",
    icon: FiAward,
    span: "col-span-1 row-span-1",
    accent: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/15",
    size: "small",
  },
  {
    title: "Coach Dashboard",
    description:
      "Manage squads, track player development, and scout talent across the platform.",
    icon: FiBarChart2,
    span: "col-span-1 row-span-1",
    accent: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/15",
    size: "small",
  },
  {
    title: "Session Booking",
    description:
      "Book training sessions, trials, and academy visits with real-time availability.",
    icon: FiCalendar,
    span: "col-span-1 row-span-1",
    accent: "from-rose-500/20 to-pink-500/10",
    iconBg: "bg-rose-500/15",
    size: "small",
  },
  {
    title: "Scout Network",
    description:
      "Scouts and coaches browse verified player profiles, stats, and match footage to find the next star.",
    icon: FiSearch,
    span: "col-span-2 row-span-1",
    accent: "from-emerald-500/15 to-cyan-500/10",
    iconBg: "bg-emerald-500/15",
    size: "wide",
  },
];

function BentoCard({ feature, index }) {
  const { title, description, icon: Icon, span, accent, iconBg, size } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`${span} group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.04]`}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Subtle glow on hover */}
      <div className="absolute -top-[50%] -right-[50%] w-[100%] h-[100%] bg-white/[0.02] rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div
        className={`relative z-10 h-full flex flex-col ${
          size === "tall" ? "p-8 justify-between" : "p-7"
        }`}
      >
        {/* Icon */}
        <div
          className={`${iconBg} w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110`}
        >
          <Icon className="w-5 h-5 text-white/80" />
        </div>

        {/* Text */}
        <div className={size === "tall" ? "mt-auto" : ""}>
          <h3
            className="text-white text-lg mb-2.5"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
          >
            {title}
          </h3>
          <p
            className="text-white/40 leading-relaxed"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: size === "large" || size === "wide" ? "0.95rem" : "0.9rem",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        </div>

        {/* Corner accent line */}
        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-emerald-400/60 to-transparent group-hover:w-full transition-all duration-700" />
      </div>
    </motion.div>
  );
}

function Academy() {
  return (
    <section id="features" className="bg-[#080b0a] py-28 px-6 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <span
            className="text-emerald-400/70 text-xs tracking-[0.2em] uppercase block mb-4"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            Everything you need
          </span>
          <h2
            className="text-white text-3xl lg:text-5xl max-w-[600px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Built for the
            <span className="text-emerald-400"> beautiful game</span>
          </h2>
        </motion.div>

        {/* Bento grid — desktop */}
        <div className="hidden md:grid grid-cols-3 auto-rows-[220px] gap-4">
          {features.map((feature, i) => (
            <BentoCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Mobile — stacked */}
        <div className="md:hidden flex flex-col gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative z-10">
                <div
                  className={`${feature.iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-4.5 h-4.5 text-white/80" />
                </div>
                <h3
                  className="text-white text-base mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-white/40 text-sm leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 text-center"
        >
          <Link
            to="/Register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-400 text-emerald-950 font-semibold rounded-full text-sm hover:bg-emerald-300 transition-colors duration-300 shadow-[0_4px_24px_rgb(16,185,129,0.2)]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default Academy;
