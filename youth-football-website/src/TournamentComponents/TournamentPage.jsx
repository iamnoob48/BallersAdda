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
  FiChevronDown,
} from "react-icons/fi";
import { FaTrophy, FaUsers } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useGetTournamentsQuery } from "../redux/slices/tournamentSlice";
import WorldMap from "../components/WorldMap";

// ── Helpers ─────────────────────────────────────────────────────────────

/** Map backend tournament object → card-friendly shape */
const mapTournament = (t) => {
  const maxTeams = t.maxTeams ?? 0;
  const registeredTeams = t._count?.teams ?? 0;
  const seatsLeft = Math.max(maxTeams - registeredTeams, 0);

  // Pick a deterministic gradient based on id
  const gradients = [
    "from-green-500 to-emerald-700",
    "from-blue-500 to-indigo-700",
    "from-purple-500 to-pink-700",
    "from-orange-400 to-red-600",
    "from-teal-400 to-cyan-600",
  ];

  return {
    id: t.id,
    tournamentUid: t.tournamentUid,
    name: t.name,
    description: t.description,
    location: t.location,
    category: t.category || "Open",
    startDate: t.startDate,
    dateLabel: new Date(t.startDate).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    dateISO: t.startDate,
    price: Number(t.price) || 0,
    prizeLabel: `₹${Number(t.price)?.toLocaleString("en-IN") || 0}`,
    registrationFee: Number(t.registrationFee) || 0,
    registrationDeadline: t.registrationDeadline,
    status: t.status,
    maxTeams,
    totalSeats: maxTeams,
    seatsLeft,
    registeredTeams,
    registeredPlayers: t._count?.players ?? 0,
    imageGradient: gradients[t.id % gradients.length],
  };
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// =====================================================================
//  Main Component
// =====================================================================
export default function TournamentPage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    city: "All",
    status: "All",
  });
  const [sortBy, setSortBy] = useState("date-asc");

  // ── RTK Query — live backend data ──────────────────────────────────
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error: apiError,
  } = useGetTournamentsQuery({
    page,
    limit: 12,
    status: filters.status !== "All" ? filters.status : undefined,
    location: filters.city !== "All" ? filters.city : undefined,
    sort: sortBy !== "recommended" ? sortBy : "date-asc",
  });

  const tournaments = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map(mapTournament);
  }, [apiResponse]);

  const pagination = apiResponse?.pagination;

  // Client-side search filter (on top of server-side filters)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tournaments;
    return tournaments.filter((t) => {
      const searchStr = `${t.name} ${t.location} ${t.category}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [query, tournaments]);

  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const bgY = useTransform(scrollY, [0, 500], [0, 100]);

  const resetFilters = () => {
    setFilters({ city: "All", status: "All" });
    setQuery("");
    setSortBy("date-asc");
    setPage(1);
  };

  const activeFilterCount =
    (filters.city !== "All" ? 1 : 0) +
    (filters.status !== "All" ? 1 : 0);

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${dm ? "bg-[#121212] selection:bg-[#00FF88]/20 selection:text-[#00FF88]" : "bg-gray-50 selection:bg-green-100 selection:text-green-800"}`}
      ref={containerRef}
    >
      {/* ================= HERO SECTION ================= */}
      <section className={`relative h-[55vh] md:h-[65vh] flex items-center justify-center overflow-hidden ${dm ? "bg-[#0a0f12]" : "bg-white"}`}>
        {/* Breathing glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: dm ? [0.3, 0.6, 0.3] : [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 blur-[100px] rounded-full ${dm ? "bg-green-500/20" : "bg-green-400/25"}`}
        />

        {/* Secondary accent glow */}
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: dm ? [0.15, 0.35, 0.15] : [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute -top-20 -right-20 w-[500px] h-[500px] blur-[120px] rounded-full ${dm ? "bg-[#00DCFF]/15" : "bg-emerald-300/20"}`}
        />

        {/* World Map background */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${dm ? "opacity-40" : "opacity-30"}`}>
          <div className="w-full max-w-6xl px-4">
            <WorldMap
              lineColor={dm ? "#00ff55" : "#006331"}
              dots={[
                {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
                
              ]}
            />
          </div>
        </div>

        {/* Text */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight ${dm ? "text-white" : "text-gray-900"}`}
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
            className={`mt-6 text-lg md:text-xl max-w-2xl mx-auto ${dm ? "text-gray-400" : "text-gray-500"}`}
          >
            Discover tournaments, join leagues, and showcase your skills. The
            journey to pro starts here.
          </motion.p>
        </motion.div>

        {/* Bottom fade */}
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
                <select
                  value={filters.status}
                  onChange={(e) => { setFilters((s) => ({ ...s, status: e.target.value })); setPage(1); }}
                  className={`bg-transparent text-sm font-medium cursor-pointer outline-none ${dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-700 hover:text-green-700"}`}
                >
                  <option value="All">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className={`bg-transparent text-sm font-medium cursor-pointer outline-none ${dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-700 hover:text-green-700"}`}
                >
                  <option value="date-asc">Nearest First</option>
                  <option value="date-desc">Latest First</option>
                  <option value="prize-desc">Highest Prize</option>
                </select>
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
                      <select
                        value={filters.status}
                        onChange={(e) => { setFilters(s => ({ ...s, status: e.target.value })); setPage(1); }}
                        className={`w-full p-2 rounded-lg text-sm border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300" : "bg-gray-50 border-gray-200"}`}
                      >
                        <option value="All">All Statuses</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        className={`w-full p-2 rounded-lg text-sm border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300" : "bg-gray-50 border-gray-200"}`}
                      >
                        <option value="date-asc">Nearest First</option>
                        <option value="date-desc">Latest First</option>
                        <option value="prize-desc">Highest Prize</option>
                      </select>
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

      {/* ================= RESULTS ================= */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`font-bold text-xl ${dm ? "text-gray-100" : "text-gray-900"}`}>
            Tournaments{" "}
            {pagination && (
              <span className={`font-normal text-base ml-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                ({pagination.totalItems})
              </span>
            )}
          </h2>
          {isFetching && !isLoading && (
            <span className={`text-xs animate-pulse ${dm ? "text-[#00FF88]" : "text-green-600"}`}>Refreshing...</span>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`animate-pulse rounded-2xl overflow-hidden ${dm ? "bg-[#1a1a1a]" : "bg-white"}`}>
                <div className={`h-40 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                <div className="p-5 space-y-3">
                  <div className={`h-4 rounded w-3/4 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                  <div className={`h-3 rounded w-1/2 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                  <div className={`h-3 rounded w-2/3 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                  <div className={`h-10 rounded-xl ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {apiError && !isLoading && (
          <div className="col-span-full py-20 text-center">
            <h3 className={`text-lg font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}>
              Failed to load tournaments
            </h3>
            <p className={`mb-4 ${dm ? "text-gray-500" : "text-gray-500"}`}>
              {apiError?.data?.message || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => setPage(1)}
              className={`px-6 py-2 rounded-full transition ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              Retry
            </button>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && !apiError && (
          <>
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${dm ? "bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                >
                  Previous
                </button>
                <span className={`text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-30 disabled:cursor-not-allowed ${dm ? "bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"}`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// =====================================================================
//  TournamentCard (kept inline — same pattern as before)
// =====================================================================
const TournamentCard = ({ data, view, dm }) => {
  const isFull = data.totalSeats > 0 && data.seatsLeft === 0;
  const fillPercentage =
    data.totalSeats > 0
      ? ((data.totalSeats - data.seatsLeft) / data.totalSeats) * 100
      : 0;
  const isFillingFast = !isFull && data.totalSeats > 0 && data.seatsLeft <= 5;

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
          {data.category?.substring(0, 3) || "TRN"}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <span className={`backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide ${dm ? "bg-[#121212]/80 text-gray-200" : "bg-white/90 text-gray-900"}`}>
            {data.category}
          </span>
          {data.status && data.status !== "UPCOMING" && (
            <span className={`backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide ${
              data.status === "ONGOING"
                ? "bg-yellow-500/90 text-yellow-900"
                : "bg-gray-500/80 text-white"
            }`}>
              {data.status}
            </span>
          )}
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
            {data.registrationFee > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  dm ? "bg-purple-900/30 text-purple-400 border-purple-800/30" : "bg-purple-50 text-purple-700 border-purple-100"
                }`}
              >
                ₹{data.registrationFee.toLocaleString("en-IN")} entry
              </span>
            )}
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
            {data.registeredPlayers > 0 && (
              <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                <FaUsers className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
                {data.registeredPlayers} players registered
              </div>
            )}
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

            {view === "grid" && data.totalSeats > 0 && (
              <div className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {isFull ? "Full" : `${data.seatsLeft} spots left`}
              </div>
            )}
          </div>

          {view === "grid" && !isFull && data.totalSeats > 0 && (
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
