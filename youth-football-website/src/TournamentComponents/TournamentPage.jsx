// TournamentPage.jsx
import React, { useMemo, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { FaTrophy, FaFutbol } from "react-icons/fa";

/**
 * ⚽ Tournament Page — Modern + Parallax Hero
 * Combines your logic with dynamic hero section
 */

const sampleTournaments = [
  {
    id: 1,
    name: "Hyderabad U-18 Cup",
    dateISO: "2025-11-12",
    dateLabel: "Nov 12, 2025",
    location: "Hyderabad",
    type: "Knockout",
    prize: 10000,
    prizeLabel: "₹10,000",
    level: "U-18",
    seatsLeft: 12,
  },
  {
    id: 2,
    name: "Chennai Juniors League",
    dateISO: "2025-12-02",
    dateLabel: "Dec 2, 2025",
    location: "Chennai",
    type: "League",
    prize: 8000,
    prizeLabel: "₹8,000",
    level: "U-16",
    seatsLeft: 6,
  },
  {
    id: 3,
    name: "Mumbai Elite Tournament",
    dateISO: "2025-11-20",
    dateLabel: "Nov 20, 2025",
    location: "Mumbai",
    type: "Knockout",
    prize: 15000,
    prizeLabel: "₹15,000",
    level: "Open",
    seatsLeft: 24,
  },
  {
    id: 4,
    name: "Hyderabad School League",
    dateISO: "2025-11-30",
    dateLabel: "Nov 30, 2025",
    location: "Hyderabad",
    type: "League",
    prize: 5000,
    prizeLabel: "₹5,000",
    level: "U-14",
    seatsLeft: 0,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function TournamentPage() {
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "All",
    type: "All",
    level: "All",
  });
  const [sortBy, setSortBy] = useState("recommended");

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = sampleTournaments.filter((t) => {
      if (filters.city !== "All" && t.location !== filters.city) return false;
      if (filters.type !== "All" && t.type !== filters.type) return false;
      if (filters.level !== "All" && t.level !== filters.level) return false;
      if (q) {
        const searchStr =
          `${t.name} ${t.location} ${t.level} ${t.type}`.toLowerCase();
        if (!searchStr.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "prize-desc") {
      items = items.sort((a, b) => b.prize - a.prize);
    } else if (sortBy === "date-asc") {
      items = items.sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));
    } else {
      items = items.sort(
        (a, b) => new Date(a.dateISO) - new Date(b.dateISO) || b.prize - a.prize
      );
    }
    return items;
  }, [query, filters, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50 mt-18">
      {/* ✅ HERO with parallax */}
      <section
        ref={heroRef}
        className="relative h-[65vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-700 via-emerald-500 to-lime-400 text-white"
      >
        {/* Layered gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/30 z-0" />

        {/* ✨ Animated light sweep overlay */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -left-1/3 top-0 w-1/2 h-full bg-gradient-to-r from-white/10 via-white/30 to-transparent animate-sweep opacity-70 blur-3xl" />
        </div>

        {/* Floating football icons */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-16 left-20 opacity-30 text-5xl md:text-6xl"
        >
          <FaFutbol />
        </motion.div>
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-16 right-24 opacity-40 text-6xl md:text-7xl"
        >
          <FaFutbol />
        </motion.div>
        <motion.div
          style={{ y: y3 }}
          className="absolute top-1/2 right-1/3 opacity-20 text-[7rem]"
        >
          <FaFutbol />
        </motion.div>

        {/* Text + search */}
        <motion.div
          style={{ y: yText }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg text-white">
            Find & Compete in Football Tournaments
          </h1>
          <p className="mt-3 text-white/90 text-sm md:text-base max-w-xl mx-auto">
            Search, filter, and join tournaments near you — from local leagues
            to open competitions.
          </p>

          {/* Search bar */}
          <div className="mt-6 flex justify-center">
            <div className="bg-white flex items-center rounded-full shadow-xl overflow-hidden w-full max-w-md">
              <span className="px-4 text-green-600">
                <FiSearch className="text-xl" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tournaments, cities, or categories..."
                className="flex-1 px-3 py-3 text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => setQuery("")}
                className="px-4 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50/90 to-transparent" />
      </section>

      {/* ✅ FILTERS + RESULTS */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 -mt-10">
        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white shadow-md rounded-2xl p-4 md:p-5 border border-gray-100 flex flex-col md:flex-row items-center gap-3 md:gap-6 sticky top-4 z-20"
        >
          <div className="flex items-center gap-3 flex-1">
            <FiFilter className="text-green-600 text-xl" />
            <span className="text-sm text-gray-700 font-medium">Filters</span>

            <select
              value={filters.city}
              onChange={(e) =>
                setFilters((s) => ({ ...s, city: e.target.value }))
              }
              className="ml-2 text-sm border border-gray-200 rounded-full px-3 py-2 bg-white"
            >
              <option value="All">All cities</option>
              <option>Hyderabad</option>
              <option>Mumbai</option>
              <option>Chennai</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((s) => ({ ...s, type: e.target.value }))
              }
              className="text-sm border border-gray-200 rounded-full px-3 py-2 bg-white"
            >
              <option value="All">All types</option>
              <option>Knockout</option>
              <option>League</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) =>
                setFilters((s) => ({ ...s, level: e.target.value }))
              }
              className="text-sm border border-gray-200 rounded-full px-3 py-2 bg-white"
            >
              <option value="All">All levels</option>
              <option>U-14</option>
              <option>U-16</option>
              <option>U-18</option>
              <option>Open</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-full px-3 py-2 bg-white"
            >
              <option value="recommended">Recommended</option>
              <option value="prize-desc">Prize (High → Low)</option>
              <option value="date-asc">Date (Soonest)</option>
            </select>

            <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1 bg-white">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-full ${
                  view === "grid"
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600"
                }`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-full ${
                  view === "list"
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600"
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ RESULTS GRID / LIST */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          <AnimatePresence>
            {results.map((t) => (
              <motion.article
                key={t.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10 }}
                whileHover={{
                  y: -6,
                  boxShadow: "0 12px 30px rgba(16,185,129,0.08)",
                }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className={
                  view === "grid"
                    ? "bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    : "bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-4"
                }
              >
                {view === "grid" && (
                  <div className="h-36 bg-gradient-to-r from-green-200 to-green-100 flex items-center justify-center text-gray-800 font-semibold">
                    {t.name.split(" ")[0]}
                  </div>
                )}

                <div className={view === "grid" ? "p-5" : "flex-1"}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar /> {t.dateLabel}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin /> {t.location}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                          {t.type}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100">
                          {t.level}
                        </span>
                      </div>
                    </div>

                    {view === "list" && (
                      <div className="text-right">
                        <p className="text-sm text-gray-700 font-medium">
                          {t.prizeLabel}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.seatsLeft === 0
                            ? "Full"
                            : `${t.seatsLeft} seats left`}
                        </p>
                      </div>
                    )}
                  </div>

                  {view === "grid" && (
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="text-green-700 font-semibold flex items-center gap-2">
                          <FaTrophy /> <span>{t.prizeLabel}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {t.seatsLeft === 0
                            ? "Full"
                            : `${t.seatsLeft} seats left`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="text-sm px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50">
                          Details
                        </button>
                        <button
                          disabled={t.seatsLeft === 0}
                          className={`text-sm px-4 py-2 rounded-full font-medium ${
                            t.seatsLeft === 0
                              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {t.seatsLeft === 0 ? "Full" : "Join"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {results.length === 0 && (
          <div className="mt-12 text-center text-gray-600">
            <p className="mb-4">
              No tournaments found. Try changing filters or search terms.
            </p>
            <button
              onClick={() => {
                setFilters({ city: "All", type: "All", level: "All" });
                setQuery("");
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-full"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
