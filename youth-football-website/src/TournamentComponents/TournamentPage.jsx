import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useGetTournamentsQuery } from "../redux/slices/tournamentSlice";
import { mapTournamentToCardModel } from "../lib/tournamentUtils";

// ── Modular sub-components ──────────────────────────────────────────
import TournamentHero from "./TournamentHero";
import TournamentFilterBar from "./TournamentFilterBar";
import TournamentCard from "./TournamentCard";
import TournamentPagination from "./TournamentPagination";

// =====================================================================
//  Main Component — data orchestration only, all presentation is delegated
// =====================================================================
export default function TournamentPage() {
  const dm = useSelector((state) => state.theme.darkMode);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    city: "All",
    status: "UPCOMING",
  });
  const [sortBy, setSortBy] = useState("date-asc");

  // ── RTK Query — live backend data ──────────────────────────────────
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error: apiError,
    refetch,
  } = useGetTournamentsQuery({
    page,
    limit: 12,
    status: filters.status !== "All" ? filters.status : undefined,
    location: filters.city !== "All" ? filters.city : undefined,
    sort: sortBy !== "recommended" ? sortBy : "date-asc",
  });

  const tournaments = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.map(mapTournamentToCardModel);
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

  const resetFilters = () => {
    setFilters({ city: "All", status: "UPCOMING" });
    setQuery("");
    setSortBy("date-asc");
    setPage(1);
  };

  const activeFilterCount = filters.city !== "All" ? 1 : 0;

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${dm ? "bg-[#121212] selection:bg-[#00FF88]/20 selection:text-[#00FF88]" : "bg-gray-50 selection:bg-green-100 selection:text-green-800"}`}
      ref={containerRef}
    >
      {/* ─── Hero ─── */}
      <TournamentHero dm={dm} />

      {/* ─── Filter Bar + Status Tabs ─── */}
      <TournamentFilterBar
        dm={dm}
        query={query}
        setQuery={setQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
        filters={filters}
        setFilters={setFilters}
        setPage={setPage}
        showMobileFilters={showMobileFilters}
        setShowMobileFilters={setShowMobileFilters}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
      />

      {/* ─── Results Section ─── */}
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
              onClick={refetch}
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
            <TournamentPagination
              pagination={pagination}
              page={page}
              setPage={setPage}
              dm={dm}
            />
          </>
        )}
      </section>
    </div>
  );
}
