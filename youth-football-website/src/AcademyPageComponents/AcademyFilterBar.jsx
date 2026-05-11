import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiX,
} from "react-icons/fi";
import { FaStar, FaChevronDown } from "react-icons/fa";
import { useSelector } from "react-redux";

const AVAILABLE_CITIES = ["Hyderabad", "Bangalore", "Delhi", "Chennai", "Mumbai", "Pune", "Gohana", "Sonipat"];
const RATING_OPTIONS = [
  { val: 3.0, label: "3.0+" },
  { val: 4.0, label: "4.0+" },
  { val: 4.5, label: "4.5+" },
  { val: 5.0, label: "5.0" },
];

export default function AcademyFilterBar({
  query,
  setQuery,
  filters,
  setFilters,
  viewMode,
  setViewMode,
  showMobileFilters,
  setShowMobileFilters,
  activeFilterCount,
  resetFilters,
  setPage,
}) {
  const dm = useSelector((state) => state.theme.darkMode);

  const handleRatingChange = (ratingVal) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating.includes(ratingVal) ? [] : [ratingVal],
    }));
    setPage(1);
  };

  return (
    <>
      {/* ================= MAIN FILTER BAR (Sticky) ================= */}
      <div className="sticky top-0 z-40 px-4 md:px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`max-w-7xl mx-auto backdrop-blur-xl shadow-lg rounded-2xl border overflow-hidden ${dm ? "bg-[#1a1a1a]/90 shadow-black/20 border-[#87A98D]/15" : "bg-white/90 shadow-gray-200/50 border-white/50"}`}
        >
          <div className="p-3 md:p-4">
            {/* ─── Desktop Filters ─── */}
            <div className="hidden md:flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${dm ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search academies..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 placeholder:text-gray-600 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"}`}
                />
              </div>

              <div className={`h-8 w-px ${dm ? "bg-[#87A98D]/15" : "bg-gray-200"}`} />

              {/* Location dropdown */}
              <div className="relative">
                <select
                  value={filters.location[0] || ""}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, location: e.target.value ? [e.target.value] : [] }));
                    setPage(1);
                  }}
                  className={`appearance-none pr-8 pl-3 py-2 rounded-xl text-sm font-medium cursor-pointer outline-none border transition-all ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 text-gray-700 focus:border-green-500"}`}
                >
                  <option value="">All Locations</option>
                  {AVAILABLE_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FaChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${dm ? "text-gray-500" : "text-gray-400"}`} />
              </div>

              {/* Rating pills */}
              <div className="flex items-center gap-1.5">
                {RATING_OPTIONS.map((r) => {
                  const isActive = filters.rating.includes(r.val);
                  return (
                    <button
                      key={r.val}
                      onClick={() => handleRatingChange(r.val)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isActive
                          ? dm
                            ? "bg-[#00FF88] text-[#121212] border-[#00FF88] shadow-sm shadow-[#00FF88]/10"
                            : "bg-green-600 text-white border-green-600 shadow-sm"
                          : dm
                            ? "bg-transparent text-gray-400 border-[#87A98D]/20 hover:border-[#00FF88]/40 hover:text-[#00FF88]"
                            : "bg-transparent text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600"
                      }`}
                    >
                      <FaStar className={`text-[10px] ${isActive ? (dm ? "text-[#121212]" : "text-yellow-300") : (dm ? "text-gray-600" : "text-gray-300")}`} />
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className={`text-xs font-bold transition-colors ${dm ? "text-gray-500 hover:text-[#00FF88]" : "text-gray-400 hover:text-green-600"}`}
                >
                  Clear All
                </button>
              )}

              {/* View mode toggle */}
              <div className={`flex p-1 rounded-lg ${dm ? "bg-[#121212]" : "bg-gray-100"}`}>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? dm ? "bg-[#1a1a1a] shadow-sm text-[#00FF88]" : "bg-white shadow-sm text-green-600"
                      : dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiList />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? dm ? "bg-[#1a1a1a] shadow-sm text-[#00FF88]" : "bg-white shadow-sm text-green-600"
                      : dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiGrid />
                </button>
              </div>
            </div>

            {/* ─── Mobile Filters ─── */}
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

              {/* Expandable mobile filter panel */}
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden border-t pt-3 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}
                  >
                    <div className="space-y-3">
                      {/* Location */}
                      <div className="relative">
                        <select
                          value={filters.location[0] || ""}
                          onChange={(e) => {
                            setFilters((prev) => ({ ...prev, location: e.target.value ? [e.target.value] : [] }));
                            setPage(1);
                          }}
                          className={`w-full appearance-none rounded-xl px-3 py-2.5 text-sm border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300" : "bg-gray-50 border-gray-200"}`}
                        >
                          <option value="">All Locations</option>
                          {AVAILABLE_CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none ${dm ? "text-gray-500" : "text-gray-400"}`} />
                      </div>

                      {/* Rating pills — horizontal scroll on mobile */}
                      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {RATING_OPTIONS.map((r) => {
                          const isActive = filters.rating.includes(r.val);
                          return (
                            <button
                              key={r.val}
                              onClick={() => handleRatingChange(r.val)}
                              className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                isActive
                                  ? dm
                                    ? "bg-[#00FF88] text-[#121212] border-[#00FF88]"
                                    : "bg-green-600 text-white border-green-600"
                                  : dm
                                    ? "bg-[#121212] text-gray-400 border-[#87A98D]/20"
                                    : "bg-white text-gray-500 border-gray-200"
                              }`}
                            >
                              <FaStar className={`text-[10px] ${isActive ? (dm ? "text-[#121212]" : "text-yellow-300") : (dm ? "text-gray-600" : "text-gray-300")}`} />
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <div className="flex justify-between items-center pt-3 mt-2">
                      <button
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        className={`text-sm flex items-center gap-1 ${dm ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {viewMode === "grid" ? <FiList /> : <FiGrid />} Switch to{" "}
                        {viewMode === "grid" ? "List" : "Grid"}
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
    </>
  );
}
