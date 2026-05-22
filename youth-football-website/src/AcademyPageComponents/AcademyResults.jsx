import { motion, AnimatePresence } from "motion/react";
import AcademyListCard from "./AcademyListCard";
import { useSelector } from "react-redux";

function AcademyResults({ academies, viewMode }) {
  const dm = useSelector((state) => state.theme.darkMode);

  return (
    <div className="flex-1">
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
              <AcademyListCard key={academy.id} academy={academy} viewMode="list" />
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
              <AcademyListCard key={academy.id} academy={academy} viewMode="grid" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AcademyResults;
