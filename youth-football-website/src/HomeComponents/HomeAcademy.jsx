import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { GiWhistle } from "react-icons/gi";

export default function HomeAcademy({ hasAcademy, academy, dm }) {
  const navigate = useNavigate();

  return (
    <section className="px-6 md:px-16 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <h2 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>My Academy</h2>
        {hasAcademy && (
          <span className={`font-bold text-sm ${dm ? "text-[#00FF88]" : "text-green-600"}`}>Member</span>
        )}
      </div>

      {hasAcademy ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-2xl border overflow-hidden shadow-sm ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-200"}`}
        >
          <div className="p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-green-100 text-green-600"}`}>
                {academy.name?.charAt(0) || "A"}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${dm ? "text-gray-100" : "text-gray-900"}`}>{academy.name}</h3>
                <p className={`text-sm flex items-center gap-1 ${dm ? "text-gray-500" : "text-gray-500"}`}>
                  <FaMapMarkerAlt className="text-xs" /> {academy.city || academy.state || "Location not set"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/academy/details/${academy.id}`)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-gray-900 text-white hover:bg-black"}`}
            >
              View Academy <FiArrowRight />
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`group relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${dm ? "bg-[#1a1a1a] border-[#87A98D]/20 hover:border-[#00FF88]/40 hover:bg-[#00FF88]/5" : "bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-green-50/50"}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FaMapMarkerAlt className={`text-9xl -rotate-12 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
          </div>
          <div className="relative z-10">
            <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-2xl ${dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-white text-green-600"}`}>
              <GiWhistle />
            </div>
            <h3 className={`text-lg font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Free Agent?</h3>
            <p className={`mb-6 max-w-md mx-auto ${dm ? "text-gray-500" : "text-gray-500"}`}>
              You are currently not signed to any academy. Browse top-rated
              academies near you and request a trial.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/academies")}
              className={`px-6 py-2.5 rounded-lg font-medium shadow-lg transition flex items-center gap-2 mx-auto ${dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90" : "bg-gray-900 text-white hover:bg-black"}`}
            >
              Find Academy <FiArrowRight />
            </motion.button>
          </div>
        </motion.div>
      )}
    </section>
  );
}