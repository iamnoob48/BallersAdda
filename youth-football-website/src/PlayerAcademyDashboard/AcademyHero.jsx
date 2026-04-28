// ── AcademyHero ───────────────────────────────────────────────────────────
// Top banner shown above the tab nav. Renders venue image, crest, name,
// location, rating, and description for the player's current academy.
// Scale + lift microinteractions on hover.

import { motion } from "framer-motion";
import { MapPin, Star, Users, ShieldCheck } from "lucide-react";

export default function AcademyHero({ academy, dm }) {
  if (!academy) return null;

  const {
    name,
    description,
    academyLogoURL,
    city,
    state,
    rating,
    noOfStudents,
    verified,
  } = academy;

  const location = [city, state].filter(Boolean).join(", ");

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={`relative overflow-hidden rounded-3xl border ${
        dm
          ? "bg-[#1a1a1a] border-[#87A98D]/15"
          : "bg-white border-gray-200 shadow-sm"
      }`}
      aria-label={`${name} hero`}
    >
      {/* Venue image */}
      <div className="relative h-44 sm:h-56 w-full overflow-hidden">
        {academyLogoURL ? (
          <motion.img
            src={academyLogoURL}
            alt={`${name} venue`}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full ${
              dm
                ? "bg-gradient-to-br from-[#0f1a14] via-[#142a1f] to-[#0a0f12]"
                : "bg-gradient-to-br from-emerald-100 via-emerald-50 to-white"
            }`}
          />
        )}
        {/* Bottom gradient for legibility */}
        <div
          className={`absolute inset-x-0 bottom-0 h-2/3 ${
            dm
              ? "bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/70 to-transparent"
              : "bg-gradient-to-t from-white via-white/70 to-transparent"
          }`}
        />

        {/* Verified chip */}
        {verified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
              dm
                ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30"
                : "bg-emerald-500/90 text-white"
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Verified
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div className="relative px-5 pb-5 -mt-12">
        <div className="flex items-end gap-4">
          {/* Crest */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 flex items-center justify-center shadow-lg ${
              dm
                ? "border-[#1a1a1a] bg-[#0a0f12]"
                : "border-white bg-gray-100"
            }`}
          >
            {academyLogoURL ? (
              <img
                src={academyLogoURL}
                alt={`${name} crest`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🏟️</span>
            )}
          </motion.div>

          {/* Title block */}
          <div className="flex-1 min-w-0 pb-1">
            <motion.h1
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className={`text-xl sm:text-2xl font-extrabold truncate ${
                dm ? "text-white" : "text-gray-900"
              }`}
            >
              {name}
            </motion.h1>
            <div
              className={`flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs ${
                dm ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </span>
              )}
              {rating ? (
                <span className="flex items-center gap-1">
                  <Star
                    className={`w-3.5 h-3.5 ${
                      dm ? "text-[#00FF88]" : "text-amber-500"
                    }`}
                    fill="currentColor"
                  />
                  {Number(rating).toFixed(1)}
                </span>
              ) : null}
              {noOfStudents ? (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {noOfStudents} players
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`mt-4 text-sm leading-relaxed ${
              dm ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}
