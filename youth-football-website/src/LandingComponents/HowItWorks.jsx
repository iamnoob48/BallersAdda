import { motion } from "motion/react";
import { FiUserPlus, FiSearch, FiStar } from "react-icons/fi";

const steps = [
  {
    number: "01",
    icon: FiUserPlus,
    title: "Create your profile",
    description:
      "Sign up as a player, coach, or academy. Set up your football profile in under two minutes.",
  },
  {
    number: "02",
    icon: FiSearch,
    title: "Find your match",
    description:
      "Browse academies, register for tournaments, or scout talent — all filtered to your location and level.",
  },
  {
    number: "03",
    icon: FiStar,
    title: "Get discovered",
    description:
      "Build your stats, earn badges, and get noticed by coaches and scouts across the platform.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[#080b0a] py-28 px-6 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <span
            className="text-emerald-400/70 text-xs tracking-[0.2em] uppercase block mb-4"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
          >
            How it works
          </span>
          <h2
            className="text-white text-3xl lg:text-5xl"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Three steps to the
            <span className="text-emerald-400"> pitch</span>
          </h2>
        </motion.div>

        {/* Desktop — horizontal steps with connecting line */}
        <div className="hidden md:block">
          <div className="relative grid grid-cols-3 gap-16">
            {/* Connecting line */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-[34px] left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-500/40 via-emerald-400/20 to-emerald-500/40 origin-left"
            />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Number circle */}
                <div className="relative mb-10">
                  <div className="w-[68px] h-[68px] rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-emerald-400/80" />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 text-[11px] text-emerald-400/60 tracking-wider"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Text */}
                <h3
                  className="text-white text-xl mb-3"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/40 max-w-[280px]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile — vertical with left line */}
        <div className="md:hidden relative pl-12">
          {/* Vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/40 via-emerald-400/20 to-emerald-500/40 origin-top"
          />

          <div className="flex flex-col gap-16">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                {/* Dot on the line */}
                <div className="absolute -left-12 top-1 w-[14px] h-[14px] rounded-full border-2 border-emerald-400/40 bg-[#080b0a] flex items-center justify-center">
                  <div className="w-[5px] h-[5px] rounded-full bg-emerald-400/60" />
                </div>

                <span
                  className="text-emerald-400/50 text-xs tracking-wider block mb-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                >
                  {step.number}
                </span>
                <h3
                  className="text-white text-lg mb-2"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-white/40 text-sm leading-relaxed"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                >
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
