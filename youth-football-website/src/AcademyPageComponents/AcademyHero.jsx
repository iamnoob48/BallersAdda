import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import AcademyFilterBar from "./AcademyFilterBar";
import AcademyResults from "./AcademyResults";
import { AcademyPagination } from "./AcademyPagination";
import { useGetAcademiesQuery, useFilterAcademiesQuery } from "../redux/slices/academySlice";

export default function AcademyPage({ userAcademy }) {
  const dm = useSelector((state) => state.theme.darkMode);

  // UI / filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ location: [], rating: [], ageGroup: "" });
  const [viewMode, setViewMode] = useState("list");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Check if any filter is active
  const hasActiveFilters = filters.location.length > 0 || filters.rating.length > 0 || filters.ageGroup;
  const activeFilterCount =
    (filters.location.length > 0 ? 1 : 0) +
    (filters.rating.length > 0 ? 1 : 0) +
    (filters.ageGroup ? 1 : 0);

  // RTK Query
  const filterParams = {
    page,
    limit,
    city: filters.location[0] || undefined,
    rating: filters.rating[0] || undefined,
    ageGroup: filters.ageGroup || undefined,
  };

  const defaultQuery = useGetAcademiesQuery({ page, limit }, { skip: hasActiveFilters });
  const filterQuery = useFilterAcademiesQuery(filterParams, { skip: !hasActiveFilters });

  const activeQuery = hasActiveFilters ? filterQuery : defaultQuery;
  const { data, isLoading, error, refetch, isFetching } = activeQuery;

  const academiesFromApi = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? null;

  const filtered = useMemo(() => {
    return academiesFromApi.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [academiesFromApi, searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ location: [], rating: [], ageGroup: "" });
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
      {/* ─── Compact Page Header ─── */}
      <section className={`relative z-10 pt-8 pb-4 md:pt-10 md:pb-6 px-4 md:px-6 overflow-hidden ${dm ? "bg-[#121212]" : "bg-gray-50"}`}>
        {/* Subtle ambient glow */}
        <div className={`absolute -top-20 left-1/3 w-[400px] h-[200px] rounded-full blur-[100px] pointer-events-none ${dm ? "bg-[#00FF88]/6" : "bg-green-200/30"}`} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>
                Explore Academies
              </h1>
              <p className={`text-sm md:text-base mt-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                Find top-rated academies and connect with expert coaches near you.
              </p>
            </motion.div>

            {pagination && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}
              >
                {pagination.totalItems} academies found
              </motion.span>
            )}
          </div>
        </div>
      </section>

      {/* ─── Horizontal Filter Bar ─── */}
      <AcademyFilterBar
        query={searchTerm}
        setQuery={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showMobileFilters={showMobileFilters}
        setShowMobileFilters={setShowMobileFilters}
        activeFilterCount={activeFilterCount}
        resetFilters={resetFilters}
        setPage={setPage}
      />

      {/* ─── Results Section ─── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Refresh indicator */}
        {isFetching && !isLoading && (
          <div className="flex justify-end mb-3">
            <span className={`text-xs animate-pulse ${dm ? "text-[#00FF88]" : "text-green-600"}`}>Refreshing...</span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading ? (
          <div className={viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`animate-pulse rounded-2xl overflow-hidden ${dm ? "bg-[#1a1a1a]" : "bg-white"}`}>
                <div className={`h-40 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                <div className="p-5 space-y-3">
                  <div className={`h-4 rounded w-3/4 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                  <div className={`h-3 rounded w-1/2 ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                  <div className={`h-10 rounded-xl ${dm ? "bg-[#2a2a2a]" : "bg-gray-200"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`p-8 rounded-2xl border text-center ${dm ? "bg-red-950/20 border-red-900/20" : "bg-red-50 border-red-100"}`}>
            <p className={dm ? "text-red-400" : "text-red-600"}>Failed to load academies.</p>
            <button
              onClick={() => refetch()}
              className={`mt-3 px-5 py-2 rounded-full font-bold text-sm ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 text-white"}`}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <AcademyResults viewMode={viewMode} academies={filtered} />

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <div className={`inline-flex p-4 rounded-full mb-4 ${dm ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
                  <Search className={`w-7 h-7 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                </div>
                <h3 className={`text-lg font-semibold ${dm ? "text-gray-200" : "text-gray-800"}`}>
                  No academies found
                </h3>
                <p className={`mt-1 text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  Try adjusting your filters or search for something else.
                </p>
                <button
                  onClick={resetFilters}
                  className={`mt-4 px-6 py-2 rounded-full font-bold text-sm transition ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}
                >
                  Reset Filters
                </button>
              </motion.div>
            )}

            {pagination && (
              <div className="mt-8 flex items-center justify-center">
                <AcademyPagination
                  currentPage={pagination.currentPage}
                  totalItems={pagination.totalItems}
                  pageSize={pagination.limit}
                  onPageChange={(p) => handlePageChange(p)}
                  onPageSizeChange={(s) => handlePageSizeChange(s)}
                  maxButtons={7}
                  showFirstLast={true}
                  className="w-full max-w-3xl"
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
