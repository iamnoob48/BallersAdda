import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
} from "react-icons/fi";

const STATUS_TABS = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
];

export default function TournamentFilterBar({
  dm,
  query,
  setQuery,
  sortBy,
  setSortBy,
  view,
  setView,
  filters,
  setFilters,
  setPage,
  showMobileFilters,
  setShowMobileFilters,
  activeFilterCount,
  resetFilters,
}) {
  return (
    <>
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
                    <div className="grid grid-cols-1 gap-3 mb-3">
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

      {/* ================= STATUS TABS ================= */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setFilters((s) => ({ ...s, status: tab.value }));
                  setPage(1);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? dm
                      ? "bg-[#00FF88] text-[#121212] shadow-md shadow-[#00FF88]/20"
                      : "bg-green-600 text-white shadow-md shadow-green-600/20"
                    : dm
                      ? "bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200 border border-[#87A98D]/15"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
