import { motion } from "framer-motion";
import { FaSchool } from "react-icons/fa";
import { useSelector } from "react-redux";

const SectionWrapper = ({ children, dm }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.3 }}
    className={`rounded-3xl shadow-xl p-6 md:p-8 transition-colors duration-300 ${dm ? "bg-[#141414] border border-green-900/20 shadow-green-950/20" : "bg-white border border-white shadow-gray-200/50"}`}
  >
    {children}
  </motion.div>
);

export default function AcademyTab() {
  const dm      = useSelector((state) => state.theme.darkMode);
  const academy = useSelector((state) => state.player.academy);

  return (
    <SectionWrapper dm={dm}>
      <div className="mb-6">
        <h3 className={`text-2xl font-bold ${dm ? "text-gray-100" : "text-gray-900"}`}>Academy Details</h3>
      </div>

      {academy ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <FaSchool className="text-[150px]" />
          </div>
          <div className="relative z-10">
            <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
              Current Academy
            </span>
            <h2 className="text-3xl font-extrabold mt-4 mb-2">{academy.name}</h2>
            <p className="text-emerald-100 text-sm mb-8">
              Member since {new Date(academy.establishedAt).toLocaleDateString()}
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-50 transition">
                View Academy
              </button>
              <button className="bg-emerald-700/50 backdrop-blur text-white px-6 py-2.5 rounded-xl font-bold text-sm border border-emerald-500/30 hover:bg-emerald-700 transition">
                Contact Coach
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center ${dm ? "border-green-900/30 bg-[#141414]" : "border-gray-200 bg-gray-50/50"}`}>
          <FaSchool className={`text-4xl mb-4 ${dm ? "text-green-800" : "text-gray-300"}`} />
          <h4 className={`text-lg font-bold ${dm ? "text-gray-300" : "text-gray-700"}`}>Not enrolled in an academy</h4>
          <p className={`text-sm mt-2 mb-6 max-w-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>
            Join an academy to get professional training and track your progress.
          </p>
          <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
            Explore Academies
          </button>
        </div>
      )}
    </SectionWrapper>
  );
}
