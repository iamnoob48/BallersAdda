import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import AcademyListCard from "./AcademyListCard";
import { useState } from "react";
import { useSelector } from "react-redux";

function AcademyResults({ academies, viewMode }) {
  const dm = useSelector((state) => state.theme.darkMode);
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = academies.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-800"}`}>Explore Academies</h2>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div
            key="list"
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {academies.map((academy) => (
              <AcademyListCard key={academy.id} academy={academy} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {academies.map((academy) => (
              <motion.div
                key={academy.id}
                layout
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 250 }}
                className={`rounded-2xl shadow-md overflow-hidden border transition ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15 hover:shadow-lg hover:border-[#00FF88]/30" : "bg-white border-green-100 hover:shadow-lg hover:border-green-300"}`}
              >
                <motion.img
                  layout
                  src={academy.image}
                  alt={academy.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <h3 className={`text-lg font-bold mb-1 ${dm ? "text-gray-100" : "text-gray-900"}`}>
                    {academy.name}
                  </h3>
                  <p className={`flex items-center gap-2 text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                    <FaMapMarkerAlt className={dm ? "text-[#00FF88]" : "text-green-600"} />
                    {academy.location}
                  </p>
                  <p className="mt-2 text-yellow-500 font-medium text-sm">
                    ⭐ {academy.rating.toFixed(1)}
                  </p>
                  <button className={`mt-4 w-full py-2 rounded-full font-semibold transition ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-green-600 text-white hover:bg-green-700"}`}>
                    View Academy
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AcademyResults;
