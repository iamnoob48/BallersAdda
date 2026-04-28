import { motion } from "framer-motion";
import { FaMedal } from "react-icons/fa";
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

export default function Badges() {
  const dm     = useSelector((state) => state.theme.darkMode);
  const player = useSelector((state) => state.player.profile);
  const count  = player?.badges || 0;

  return (
    <SectionWrapper dm={dm}>
      <h3 className={`text-2xl font-bold mb-6 ${dm ? "text-gray-100" : "text-gray-900"}`}>Badges & Awards</h3>
      {count > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(count)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, rotate: 2 }}
              className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center shadow-sm"
            >
              <span className="text-4xl mb-2">🏅</span>
              <span className="text-xs font-bold text-amber-800 uppercase">Winner</span>
              <span className="text-[10px] text-amber-600">Tournament {i + 1}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl text-gray-200 mb-4"><FaMedal /></div>
          <p className="text-gray-500 font-medium">No badges earned yet.</p>
        </div>
      )}
    </SectionWrapper>
  );
}
