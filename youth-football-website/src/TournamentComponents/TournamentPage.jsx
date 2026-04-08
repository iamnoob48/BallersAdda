import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiX,
  FiCheck,
  FiChevronDown,
} from "react-icons/fi";
import { FaTrophy, FaFutbol, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";

// --- Mock Data ---
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
    totalSeats: 16,
    seatsLeft: 4,
    imageGradient: "from-green-500 to-emerald-700",
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
    totalSeats: 10,
    seatsLeft: 6,
    imageGradient: "from-blue-500 to-indigo-700",
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
    totalSeats: 32,
    seatsLeft: 24,
    imageGradient: "from-purple-500 to-pink-700",
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
    totalSeats: 12,
    seatsLeft: 0,
    imageGradient: "from-orange-400 to-red-600",
  },
  {
    id: 5,
    name: "Bangalore Super Cup",
    dateISO: "2025-12-15",
    dateLabel: "Dec 15, 2025",
    location: "Bangalore",
    type: "Knockout",
    prize: 25000,
    prizeLabel: "₹25,000",
    level: "Open",
    totalSeats: 20,
    seatsLeft: 18,
    imageGradient: "from-teal-400 to-cyan-600",
  },
];

// --- Components ---

export default function TournamentPage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: "All",
    type: "All",
    level: "All",
  });
  const [sortBy, setSortBy] = useState("recommended");

  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const bgY = useTransform(scrollY, [0, 500], [0, 100]);
  const shape1Y = useTransform(scrollY, [0, 500], [0, -150]);
  const shape2Y = useTransform(scrollY, [0, 500], [0, -80]);

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
      items = items.sort((a, b) => {
        if (a.seatsLeft === 0 && b.seatsLeft > 0) return 1;
        if (b.seatsLeft === 0 && a.seatsLeft > 0) return -1;
        return new Date(a.dateISO) - new Date(b.dateISO);
      });
    }
    return items;
  }, [query, filters, sortBy]);

  const resetFilters = () => {
    setFilters({ city: "All", type: "All", level: "All" });
    setQuery("");
    setSortBy("recommended");
  };

  const activeFilterCount =
    (filters.city !== "All" ? 1 : 0) +
    (filters.type !== "All" ? 1 : 0) +
    (filters.level !== "All" ? 1 : 0);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${dm ? "bg-[#121212] selection:bg-[#00FF88]/20 selection:text-[#00FF88]" : "bg-gray-50 selection:bg-green-100 selection:text-green-800"}`}
      ref={containerRef}
    >
      {/* ================= HERO SECTION ================= */}
      <section className={`relative h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${dm ? "bg-gradient-to-b from-[#0a1a0f]/50 via-[#121212] to-[#121212]" : "bg-gradient-to-b from-green-50/50 via-gray-50 to-gray-50"}`} />
          <div className={`absolute inset-0 [background-size:24px_24px] ${dm ? "opacity-15 bg-[radial-gradient(#00FF88_1px,transparent_1px)]" : "opacity-40 bg-[radial-gradient(#22c55e_1px,transparent_1px)]"}`} />
        </motion.div>

        <motion.div
          style={{ y: shape1Y }}
          className={`absolute top-1/4 left-10 text-9xl z-0 blur-[2px] ${dm ? "text-[#00FF88]/5" : "text-green-600/5"}`}
        >
          <FaFutbol />
        </motion.div>
        <motion.div
          style={{ y: shape2Y }}
          className={`absolute bottom-1/4 right-10 text-[12rem] z-0 ${dm ? "text-[#00FF88]/5" : "text-green-600/10"}`}
        >
          <FaFutbol />
        </motion.div>

        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight ${dm ? "text-gray-100" : "text-gray-900"}`}
          >
            Compete on the <br />
            <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] to-[#00DCFF]" : "bg-gradient-to-r from-green-600 to-emerald-500"}`}>
              Big Stage.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto ${dm ? "text-gray-400" : "text-gray-600"}`}
          >
            Discover tournaments, join leagues, and showcase your skills. The
            journey to pro starts here.
          </motion.p>
        </motion.div>

        <div className={`absolute bottom-0 left-0 w-full h-32 z-10 pointer-events-none ${dm ? "bg-gradient-to-t from-[#121212] to-transparent" : "bg-gradient-to-t from-gray-50 to-transparent"}`} />
      </section>

      {/* ================= FILTER SECTION (Sticky) ================= */}
      <div className="sticky top-0 z-40 px-4 md:px-8 -mt-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`max-w-6xl mx-auto backdrop-blur-xl shadow-lg rounded-2xl border overflow-hidden ${dm ? "bg-[#1a1a1a]/90 shadow-black/20 border-[#87A98D]/15" : "bg-white/90 shadow-gray-200/50 border-white/50"}`}
        >
          <div className="p-3 md:p-4">
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tournaments..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"}`}
                />
              </div>

              <div className={`h-8 w-px mx-2 ${dm ? "bg-[#87A98D]/15" : "bg-gray-200"}`} />

              <div className="flex items-center gap-2">
                {[
                  { key: "city", options: ["All Cities", "Hyderabad", "Mumbai", "Chennai", "Bangalore"], stateKey: "city" },
                  { key: "type", options: ["All Types", "Knockout", "League"], stateKey: "type" },
                  { key: "level", options: ["All Levels", "U-14", "U-16", "U-18", "Open"], stateKey: "level" },
                ].map(({ key, options, stateKey }) => (
                  <select
                    key={key}
                    value={filters[stateKey]}
                    onChange={(e) => setFilters((s) => ({ ...s, [stateKey]: e.target.value }))}
                    className={`bg-transparent text-sm font-medium cursor-pointer outline-none ${dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-700 hover:text-green-700"}`}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt === options[0] ? "All" : opt}>{opt}</option>
                    ))}
                  </select>
                ))}
              </div>

              <div className="flex-1" />

              <div className={`flex p-1 rounded-lg ${dm ? "bg-[#121212]" : "bg-gray-100"}`}>
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-all ${
                    view === "grid"
                      ? dm ? "bg-[#1a1a1a] shadow-sm text-[#00FF88]" : "bg-white shadow-sm text-green-600"
                      : dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-all ${
                    view === "list"
                      ? dm ? "bg-[#1a1a1a] shadow-sm text-[#00FF88]" : "bg-white shadow-sm text-green-600"
                      : dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiList />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            <div className="md:hidden flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 placeholder:text-gray-600 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:border-green-500"}`}
                  />
                </div>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition-colors ${
                    showMobileFilters || activeFilterCount > 0
                      ? dm ? "bg-[#00FF88]/10 border-[#00FF88]/20 text-[#00FF88]" : "bg-green-50 border-green-200 text-green-700"
                      : dm ? "bg-[#1a1a1a] border-[#87A98D]/20 text-gray-400" : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  <FiFilter className="text-lg" />
                  {activeFilterCount > 0 && (
                    <span className={`text-[10px] w-5 h-5 flex items-center justify-center rounded-full ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 text-white"}`}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden border-t pt-3 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}
                  >
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[
                        { val: filters.city, onChange: (v) => setFilters(s => ({ ...s, city: v })), opts: ['All Cities:All', 'Hyderabad', 'Mumbai', 'Chennai'] },
                        { val: filters.type, onChange: (v) => setFilters(s => ({ ...s, type: v })), opts: ['All Types:All', 'Knockout', 'League'] },
                        { val: filters.level, onChange: (v) => setFilters(s => ({ ...s, level: v })), opts: ['All Levels:All', 'U-14', 'U-16', 'U-18', 'Open'] },
                        { val: sortBy, onChange: setSortBy, opts: ['Recommended:recommended', 'Prize: High-Low:prize-desc'] },
                      ].map(({ val, onChange, opts }, idx) => (
                        <select
                          key={idx}
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          className={`w-full p-2 rounded-lg text-sm border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300" : "bg-gray-50 border-gray-200"}`}
                        >
                          {opts.map((o) => {
                            const [label, value] = o.includes(':') ? o.split(':') : [o, o];
                            return <option key={label} value={value}>{label}</option>;
                          })}
                        </select>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setView(view === "grid" ? "list" : "grid")}
                        className={`text-sm flex items-center gap-1 ${dm ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {view === "grid" ? <FiList /> : <FiGrid />} Switch to{" "}
                        {view === "grid" ? "List" : "Grid"}
                      </button>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-red-500 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= RESULTS GRID ================= */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold text-xl ${dm ? "text-gray-100" : "text-gray-900"}`}>
            Upcoming Tournaments{" "}
            <span className={`font-normal text-base ml-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
              ({results.length})
            </span>
          </h2>
        </div>

        <motion.div
          layout
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
          }
        >
          <AnimatePresence mode="popLayout">
            {results.map((t) => (
              <TournamentCard key={t.id} data={t} view={view} dm={dm} />
            ))}
          </AnimatePresence>

          {results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center"
            >
              <div className={`inline-flex p-4 rounded-full mb-4 ${dm ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
                <FiSearch className={`text-3xl ${dm ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <h3 className={`text-lg font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}>
                No tournaments found
              </h3>
              <p className={`mb-6 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                Try adjusting your filters or search for something else.
              </p>
              <button
                onClick={resetFilters}
                className={`px-6 py-2 rounded-full transition ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

const TournamentCard = ({ data, view, dm }) => {
  const isFull = data.seatsLeft === 0;
  const fillPercentage =
    ((data.totalSeats - data.seatsLeft) / data.totalSeats) * 100;
  const isFillingFast = !isFull && data.seatsLeft <= 5;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group border overflow-hidden relative ${
        view === "grid"
          ? `rounded-2xl shadow-sm ${dm ? "hover:shadow-lg hover:shadow-[#00FF88]/5" : "hover:shadow-xl hover:shadow-green-900/5"}`
          : `rounded-xl shadow-sm ${dm ? "hover:shadow-md" : "hover:shadow-md"} flex flex-row`
      } ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}
    >
      {/* Card Header / Image */}
      <div
        className={`${
          view === "grid" ? "h-40" : "w-32 md:w-48 shrink-0"
        } relative overflow-hidden bg-gradient-to-br ${data.imageGradient}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:12px_12px]" />

        <div className="absolute inset-0 flex items-center justify-center text-white/90 font-bold text-3xl tracking-widest uppercase opacity-30">
          {data.type.substring(0, 3)}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <span className={`backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide ${dm ? "bg-[#121212]/80 text-gray-200" : "bg-white/90 text-gray-900"}`}>
            {data.level}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div
        className={`flex-1 p-5 ${
          view === "list" && "flex items-center justify-between gap-4"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                data.type === "League"
                  ? dm ? "bg-purple-900/30 text-purple-400 border-purple-800/30" : "bg-purple-50 text-purple-700 border-purple-100"
                  : dm ? "bg-orange-900/30 text-orange-400 border-orange-800/30" : "bg-orange-50 text-orange-700 border-orange-100"
              }`}
            >
              {data.type}
            </span>
            {isFillingFast && (
              <span className="text-[10px] font-bold text-red-500 animate-pulse">
                Filling Fast!
              </span>
            )}
          </div>

          <h3 className={`font-bold text-lg leading-tight transition-colors ${dm ? "text-gray-100 group-hover:text-[#00FF88]" : "text-gray-900 group-hover:text-green-600"}`}>
            {data.name}
          </h3>

          <div className="mt-3 space-y-1.5">
            <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <FiCalendar className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              {data.dateLabel}
            </div>
            <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <FiMapPin className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              {data.location}
            </div>
          </div>
        </div>

        {view === "list" && (
          <div className={`hidden md:block w-px h-12 mx-4 ${dm ? "bg-[#87A98D]/10" : "bg-gray-100"}`} />
        )}

        {/* Footer / Action */}
        <div
          className={`mt-5 ${
            view === "list" ? "mt-0 text-right min-w-[140px]" : ""
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 ${
              view === "list" && "flex-col items-end justify-center gap-0 mb-0"
            }`}
          >
            <div className={`flex items-center gap-1.5 font-bold ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
              <FaTrophy className="text-yellow-500" />
              <span>{data.prizeLabel}</span>
            </div>

            {view === "grid" && (
              <div className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {isFull ? "Full" : `${data.seatsLeft} spots left`}
              </div>
            )}
          </div>

          {view === "grid" && !isFull && (
            <div className={`h-1.5 w-full rounded-full mb-4 overflow-hidden ${dm ? "bg-[#2a2a2a]" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full ${
                  isFillingFast ? "bg-red-500" : dm ? "bg-[#00FF88]" : "bg-green-500"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          )}

          <button
            disabled={isFull}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isFull
                ? dm ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 hover:shadow-lg hover:shadow-[#00FF88]/10 active:scale-95" : "bg-gray-900 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-600/20 active:scale-95"
            }`}
          >
            {isFull ? (
              "Registration Closed"
            ) : (
              <>
                Register Now <FiChevronDown className="-rotate-90" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
};
