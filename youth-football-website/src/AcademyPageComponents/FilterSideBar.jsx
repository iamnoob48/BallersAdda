import {
  FaMapMarkerAlt,
  FaStar,
  FaFilter,
  FaList,
  FaThLarge,
  FaUser,
  FaChevronDown
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

function FilterSidebar({ 
  filters, 
  setFilters, 
  viewMode, 
  setViewMode,
  availableCities = ["Hyderabad", "Bangalore", "Delhi", "Chennai", "Mumbai", "Pune", "Gohana", "Sonipat"] 
}) {
  const dm = useSelector((state) => state.theme.darkMode);
  
  const handleRatingChange = (ratingVal) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating.includes(ratingVal) ? [] : [ratingVal]
    }));
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`md:w-1/4 w-full shadow-xl rounded-3xl p-6 h-fit sticky top-24 border transition-colors duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/20" : "bg-white border-gray-100 shadow-gray-100/50"}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${dm ? "bg-[#00FF88]/10" : "bg-green-50"}`}>
            <FaFilter className={`text-sm ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
          </div>
          <h3 className={`text-xl font-extrabold tracking-tight ${dm ? "text-gray-100" : "text-gray-900"}`}>Filters</h3>
        </div>
        {(filters.location.length > 0 || filters.rating.length > 0 || filters.ageGroup) && (
          <button 
            onClick={() => setFilters({ location: [], rating: [], ageGroup: "" })}
            className={`text-xs font-bold transition-colors ${dm ? "text-gray-500 hover:text-[#00FF88]" : "text-gray-400 hover:text-green-600"}`}
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {/* LOCATION FILTER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FaMapMarkerAlt className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-sm font-bold uppercase tracking-wider ${dm ? "text-gray-400" : "text-gray-700"}`}>Location</p>
        </div>
        <div className="relative">
          <select
            value={filters.location[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              setFilters((prev) => ({ ...prev, location: val ? [val] : [] }));
            }}
            className={`w-full appearance-none rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all cursor-pointer border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"}`}
          >
            <option value="">Anywhere</option>
            {availableCities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-gray-500" : "text-gray-400"}`}>
            <FaChevronDown className="text-xs" />
          </div>
        </div>
      </div>

      {/* RATING FILTER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FaStar className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-sm font-bold uppercase tracking-wider ${dm ? "text-gray-400" : "text-gray-700"}`}>Minimum Rating</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: 3.0, label: "3.0+" },
            { val: 4.0, label: "4.0+" },
            { val: 4.5, label: "4.5+" },
            { val: 5.0, label: "5.0" },
          ].map((r) => {
            const isSelected = filters.rating.includes(r.val);
            return (
              <button
                key={r.val}
                onClick={() => handleRatingChange(r.val)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? dm
                      ? "bg-[#00FF88] text-[#121212] border-[#00FF88] shadow-md shadow-[#00FF88]/10"
                      : "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20"
                    : dm
                      ? "bg-[#121212] text-gray-400 border-[#87A98D]/20 hover:border-[#00FF88]/40 hover:text-[#00FF88] hover:bg-[#00FF88]/5"
                      : "bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50"
                }`}
              >
                <FaStar className={isSelected ? (dm ? "text-[#121212]" : "text-yellow-300") : (dm ? "text-gray-600" : "text-gray-300")} />
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* AGE GROUP */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FaUser className={`text-sm ${dm ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-sm font-bold uppercase tracking-wider ${dm ? "text-gray-400" : "text-gray-700"}`}>Age Group</p>
        </div>
        <div className="relative">
          <select
            value={filters.ageGroup || ""}
            onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
            className={`w-full appearance-none rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all cursor-pointer border ${dm ? "bg-[#121212] border-[#87A98D]/20 text-gray-300 focus:ring-2 focus:ring-[#00FF88]/20 focus:border-[#00FF88]/50" : "bg-gray-50 border-gray-200 text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"}`}
          >
            <option value="">All Ages</option>
            <option value="kids">Kids (Under 16)</option>
            <option value="adults">Adults (16+)</option>
          </select>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? "text-gray-500" : "text-gray-400"}`}>
             <FaChevronDown className="text-xs" />
          </div>
        </div>
      </div>

      {/* VIEW MODE */}
      <div className={`border-t pt-6 ${dm ? "border-[#87A98D]/10" : "border-gray-100"}`}>
        <p className={`text-sm font-bold uppercase tracking-wider mb-3 ${dm ? "text-gray-400" : "text-gray-700"}`}>View Mode</p>
        <div className={`flex gap-2 p-1 rounded-2xl border ${dm ? "bg-[#121212] border-[#87A98D]/15" : "bg-gray-50 border-gray-100"}`}>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === "list"
                ? dm
                  ? "bg-[#1a1a1a] text-[#00FF88] shadow-sm border border-[#87A98D]/20"
                  : "bg-white text-green-600 shadow-sm border border-gray-200/50"
                : dm
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FaList /> List
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              viewMode === "grid"
                ? dm
                  ? "bg-[#1a1a1a] text-[#00FF88] shadow-sm border border-[#87A98D]/20"
                  : "bg-white text-green-600 shadow-sm border border-gray-200/50"
                : dm
                  ? "text-gray-500 hover:text-gray-300"
                  : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FaThLarge /> Grid
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default FilterSidebar;
