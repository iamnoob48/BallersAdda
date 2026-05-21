import React from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Star,
  Users,
  Trophy,
  Award,
  Calendar,
  ChevronDown,
} from "lucide-react";
import NavBar from "../components/Navbar.jsx";
import TopNav from "../components/TopNav.jsx";
import BottomNav from "../components/BottomNav.jsx";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { useSelector } from "react-redux";
import MiddleSection from "./Middle-Section.jsx";
import RightCard from "./Right-Card.jsx";

export default function AcademyDetailsPage({ ACADEMY_DATA }) {
  const isMobile = useIsMobile();
  const dm = useSelector((state) => state.theme.darkMode);
  const academy = ACADEMY_DATA?.academy;

  const yearsActive = academy?.establishedAt
    ? new Date().getFullYear() - new Date(academy.establishedAt).getFullYear()
    : null;

  const heroStats = [
    { icon: Users, label: "Players Trained", value: academy?.noOfStudents ? `${academy.noOfStudents}+` : "500+" },
    { icon: Calendar, label: "Years Active", value: yearsActive != null ? `${yearsActive}` : "15" },
    { icon: Award, label: "Certified Coaches", value: `${academy?.coaches?.length || 0}` },
    { icon: Trophy, label: "Tournaments Won", value: academy?.tournamentsWon ? `${academy.tournamentsWon}` : "38" },
  ];

  const heroImage =
    ACADEMY_DATA?.academy?.pictures?.[0]?.pictureURL ||
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1600";

  return (
    <div
      className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${
        dm ? "bg-[#0a0a0a] text-gray-200" : "bg-[#F8F9FA] text-gray-800"
      }`}
    >
      {isMobile ? <TopNav /> : <NavBar />}

      {/* ---------- HERO SECTION ---------- */}
      <section className="relative w-full h-[480px] md:h-[540px] lg:h-[600px] overflow-hidden mt-16">
        {/* Background image with ken-burns */}
        <motion.img
          src={heroImage}
          alt={ACADEMY_DATA.academy.name}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Noise texture overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')]" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="flex flex-col md:flex-row md:items-end gap-5 md:gap-8"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0 bg-white/10 backdrop-blur-md ring-1 ring-white/10"
              >
                <img
                  src="https://images.unsplash.com/photo-1551966775-a4ddc8df052b?auto=format&fit=crop&q=80&w=200"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]"
                >
                  {ACADEMY_DATA.academy.name}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center gap-3 mt-3"
                >
                  <div className="flex items-center gap-1.5 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {ACADEMY_DATA.academy.city},{" "}
                      {ACADEMY_DATA.academy.state}
                    </span>
                  </div>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(ACADEMY_DATA.academy.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20 fill-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white ml-1">
                      {ACADEMY_DATA.academy.rating}
                    </span>
                    <span className="text-sm text-white/50">
                      (124 reviews)
                    </span>
                  </div>
                </motion.div>

                {/* Services tags */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-2 mt-4"
                >
                  {ACADEMY_DATA.academy.services.map((service, i) => (
                    <motion.span
                      key={service}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.65 + i * 0.05 }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                    >
                      {service}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* CTA on hero (desktop) */}
              <div className="hidden lg:flex flex-col items-end gap-3 flex-shrink-0">
                <motion.a
                  href="#join-academy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base shadow-2xl transition-all ${
                    dm
                      ? "bg-[#00FF88] text-[#0a0a0a] hover:bg-[#00FF88]/90 shadow-[#00FF88]/25"
                      : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30"
                  }`}
                >
                  Join Academy
                  <ChevronDown className="w-4 h-4" />
                </motion.a>
                <span className="text-xs text-white/40 font-medium">
                  Open enrollment
                </span>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8"
            >
              {heroStats.map(({ icon: Icon, label, value }, idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.08 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.12] transition-all cursor-default"
                >
                  <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-emerald-500/20"}`}>
                    <Icon className={`w-4 h-4 ${dm ? "text-[#00FF88]" : "text-emerald-300"}`} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none tracking-tight">
                      {value}
                    </p>
                    <p className="text-[11px] text-white/45 font-medium mt-0.5">
                      {label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-8 lg:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <MiddleSection ACADEMY_DATA={ACADEMY_DATA} />
          <RightCard ACADEMY_DATA={ACADEMY_DATA} />
        </div>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}
