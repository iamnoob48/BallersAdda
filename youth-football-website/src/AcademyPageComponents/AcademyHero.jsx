import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import FilterSidebar from "./FilterSideBar";
import AcademyResults from "./AcademyResults";
import { AcademyPagination } from "./AcademyPagination";
import { useGetAcademiesQuery, useFilterAcademiesQuery } from "../redux/slices/academySlice";

export default function AcademyPage({ userAcademy }) {
  const dm = useSelector((state) => state.theme.darkMode);

  // UI / filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ location: [], rating: [], ageGroup: "" });
  const [viewMode, setViewMode] = useState("list");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Check if any filter is active
  const hasActiveFilters = filters.location.length > 0 || filters.rating.length > 0 || filters.ageGroup;

  // RTK Query: use filter endpoint when filters are active, otherwise use default
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
  const { data, isLoading, error, refetch } = activeQuery;

  const academiesFromApi = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination ?? null;

  const filtered = useMemo(() => {
    return academiesFromApi.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [academiesFromApi, searchTerm]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-gradient-to-b from-green-50 via-white to-green-100"}`}>
      {/* Hero Section */}
      <section className={`relative z-10 pt-32 pb-20 px-6 overflow-hidden transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-white"}`}>
        {/* Dot pattern */}
        <div className={`absolute inset-0 -z-10 h-full w-full [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] ${dm ? "bg-[#121212] bg-[radial-gradient(#87A98D20_1.5px,transparent_1.5px)]" : "bg-white bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)]"}`}></div>

        {/* Ambient Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[90px] -z-10 ${dm ? "bg-[#00FF88]/8" : "bg-green-200/50 mix-blend-multiply"}`} />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-2 shadow-sm border ${dm ? "bg-[#00FF88]/10 border-[#00FF88]/20 text-[#00FF88]" : "bg-green-50 border-green-200 text-green-700"}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dm ? "bg-[#00FF88]" : "bg-green-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dm ? "bg-[#00FF88]" : "bg-green-600"}`}></span>
            </span>
            Live Academy Registrations
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] ${dm ? "text-gray-100" : "text-gray-900"}`}
          >
            Kickstart Your <br className="hidden md:block" />
            <span className={`text-transparent bg-clip-text ${dm ? "bg-gradient-to-r from-[#00FF88] via-[#00DCFF] to-[#00FF88]" : "bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500"}`}>
              Football Journey
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto leading-relaxed ${dm ? "text-gray-400" : "text-gray-500"}`}
          >
            Find top-rated academies, connect with expert coaches, and elevate
            your game. The best pitch is the one closest to you.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 relative max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className={`relative flex items-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border p-2 transition-all ${dm ? "bg-[#1a1a1a] border-[#87A98D]/20 focus-within:ring-4 focus-within:ring-[#00FF88]/10 focus-within:border-[#00FF88]/50" : "bg-white border-gray-200 focus-within:ring-4 focus-within:ring-green-100 focus-within:border-green-500"}`}>
                <div className={`pl-4 transition-colors ${dm ? "text-gray-500 group-focus-within:text-[#00FF88]" : "text-gray-400 group-focus-within:text-green-600"}`}>
                  <Search className="w-5 h-5" />
                </div>

                <input
                  type="text"
                  placeholder="Search by academy name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`flex-1 bg-transparent h-12 px-4 outline-none text-base w-full ${dm ? "text-gray-200 placeholder:text-gray-600" : "text-gray-700 placeholder:text-gray-400"}`}
                />

                <button className={`hidden sm:flex items-center gap-2 px-6 h-11 rounded-full font-bold transition-all shadow-md active:scale-95 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 shadow-[#00FF88]/10" : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"}`}>
                  Search
                </button>

                <button className={`sm:hidden p-3 rounded-full transition-colors ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 hover:bg-green-700 text-white"}`}>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Popular Tags */}
            <div className={`mt-4 flex flex-wrap justify-center gap-2 text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <span>Popular:</span>
              {["Mumbai", "Under-15", "Goalkeeping", "Bangalore"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className={`font-medium underline decoration-dotted transition-all ${dm ? "decoration-gray-600 hover:text-[#00FF88] hover:decoration-[#00FF88]" : "decoration-gray-300 hover:text-green-600 hover:decoration-green-600"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 flex flex-col md:flex-row gap-8 mt-10">
        {/* FILTER SIDEBAR */}
        <FilterSidebar
          filters={filters}
          setFilters={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
          }}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* RESULTS + Pagination */}
        <div className="flex-1">
          {isLoading ? (
            <div className={`p-12 rounded-2xl shadow-md border text-center ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 text-gray-400" : "bg-white border-gray-100"}`}>
              Loading academies...
            </div>
          ) : error ? (
            <div className={`p-8 rounded-2xl border text-center ${dm ? "bg-red-950/20 border-red-900/20" : "bg-red-50 border-red-100"}`}>
              <p className={dm ? "text-red-400" : "text-red-600"}>Failed to load academies.</p>
              <button
                onClick={() => refetch()}
                className={`mt-3 px-4 py-2 rounded-full ${dm ? "bg-[#00FF88] text-[#121212]" : "bg-green-600 text-white"}`}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <AcademyResults viewMode={viewMode} academies={filtered} />

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
        </div>
      </div>
    </div>
  );
}
