import React from "react";
import { motion } from "motion/react";
import { MapPin, Star, ArrowRight, ShieldCheck, IndianRupee, Users as UsersIcon, Mail, Phone, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RATING_COLOR = "text-amber-400 fill-amber-400";
const RATING_BG_DM = "bg-amber-400/10 border-amber-400/20";
const RATING_BG_LT = "bg-amber-50 border-amber-100";

const PILL_DM = "bg-white/[0.04] text-gray-400 border-white/[0.06]";
const PILL_LT = "bg-gray-50 text-gray-600 border-gray-100";
const PILL_BASE = "text-[10px] font-semibold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1";

function LocationText({ academy }) {
  const parts = [academy.city, academy.state].filter(Boolean);
  const location = parts.join(", ") || "Location not available";
  if (academy.distance != null && academy.distance !== Infinity) {
    return `${location} · ${academy.distance < 1 ? "<1" : academy.distance} km`;
  }
  return location;
}

function formatPrice(startingPrice) {
  if (!startingPrice) return null;
  try {
    const amount = startingPrice.priceCents / 100;
    const code = /^[A-Z]{3}$/i.test(startingPrice.currency) ? startingPrice.currency : "INR";
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
    const cycle = startingPrice.billingCycle?.toLowerCase() || "month";
    return `${formatted}/${cycle}`;
  } catch {
    return null;
  }
}

export default function AcademyListCard({ academy, viewMode = "list" }) {
  const dm = useSelector((state) => state.theme.darkMode);
  const navigate = useNavigate();
  const name = academy?.name || "Unknown Academy";
  const rating = academy?.rating ?? 0;
  const noOfReviews = academy?.noOfReviews ?? 0;
  const ageGroups = academy?.ageGroups || [];
  const priceLabel = formatPrice(academy?.startingPrice);

  const goToDetails = () => navigate(`/academy/details/${academy.id}`);

  /* ── GRID VIEW ── */
  if (viewMode === "grid") {
    return (
      <motion.div
        layout
        initial="idle"
        whileHover="hover"
        onClick={goToDetails}
        className={`group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 h-full ${
          dm
            ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_30px_rgba(0,255,136,0.08)] hover:border-[#00FF88]/25"
            : "bg-white border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(22,163,74,0.08)] hover:border-green-200"
        }`}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <motion.img
            src={academy.academyLogoURL}
            alt={name}
            className="w-full h-full object-cover"
            variants={{ idle: { scale: 1 }, hover: { scale: 1.06 } }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Verified badge */}
          <div className="absolute top-3 left-3 z-10">
            <div
              className={`backdrop-blur-md px-2.5 py-0.5 rounded-xl flex items-center gap-1 shadow-sm ${
                dm ? "bg-[#121212]/80" : "bg-white/90"
              }`}
            >
              <ShieldCheck className={`w-3 h-3 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${dm ? "text-gray-300" : "text-gray-700"}`}>
                Verified
              </span>
            </div>
          </div>

          {/* Rating overlay */}
          <div className="absolute bottom-3 right-3 z-10">
            <div
              className={`flex items-center gap-1 backdrop-blur-md px-2 py-1 rounded-xl text-xs font-bold border ${
                dm ? `bg-[#121212]/80 ${RATING_BG_DM}` : `bg-white/90 ${RATING_BG_LT}`
              }`}
            >
              <Star className={`w-3 h-3 ${RATING_COLOR}`} />
              <span className={dm ? "text-gray-200" : "text-gray-800"}>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          <h3
            className={`text-base font-bold leading-snug mb-1.5 transition-colors line-clamp-1 ${
              dm ? "text-gray-100 group-hover:text-[#00FF88]" : "text-gray-900 group-hover:text-green-700"
            }`}
          >
            {name}
          </h3>

          <div className={`flex items-center gap-1 text-xs mb-3 ${dm ? "text-gray-500" : "text-gray-500"}`}>
            <MapPin className={`w-3 h-3 flex-shrink-0 ${dm ? "text-gray-600" : "text-gray-400"}`} />
            <span className="truncate"><LocationText academy={academy} /></span>
          </div>

          {/* Price + Age Groups */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {priceLabel && (
              <span className={`${PILL_BASE} ${dm ? PILL_DM : PILL_LT}`}>
                <IndianRupee className="w-2.5 h-2.5" />
                {priceLabel}
              </span>
            )}
            {ageGroups.slice(0, 2).map((ag) => (
              <span key={ag} className={`${PILL_BASE} ${dm ? PILL_DM : PILL_LT}`}>
                {ag}
              </span>
            ))}
            {ageGroups.length > 2 && (
              <span className={`${PILL_BASE} ${dm ? PILL_DM : PILL_LT}`}>
                +{ageGroups.length - 2}
              </span>
            )}
          </div>

          {/* Spacer + CTA */}
          <div className="mt-auto pt-3">
            <motion.button
              className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 ${
                dm
                  ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90"
                  : "bg-gray-900 text-white hover:bg-green-600"
              }`}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); goToDetails(); }}
            >
              View Academy
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <motion.div
      layout
      initial="idle"
      whileHover="hover"
      className={`group relative flex flex-col md:flex-row w-full rounded-2xl overflow-hidden border transition-all duration-500 ${
        dm
          ? "bg-[#1a1a1a] border-[#87A98D]/15 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,255,136,0.08)]"
          : "bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(22,163,74,0.1)]"
      }`}
    >
      {/* Tactical Border Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        <motion.rect
          width="100%"
          height="100%"
          rx="16"
          fill="none"
          stroke={dm ? "#00FF88" : "#84cc16"}
          strokeWidth="3"
          strokeDasharray="12 12"
          initial={{ pathLength: 0, opacity: 0 }}
          variants={{ hover: { pathLength: 1, opacity: 1 } }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </svg>

      {/* IMAGE SECTION */}
      <div className="md:w-2/5 lg:w-1/3 relative h-48 md:h-auto overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm ${
              dm ? "bg-[#121212]/80" : "bg-white/90"
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${dm ? "text-[#00FF88]" : "text-green-600"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${dm ? "text-gray-300" : "text-gray-800"}`}>
              Verified
            </span>
          </div>
        </div>

        <motion.img
          src={academy.academyLogoURL}
          alt={name}
          className="w-full h-full object-cover"
          variants={{ idle: { scale: 1 }, hover: { scale: 1.08 } }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent opacity-80" />

        <div
          className={`absolute bottom-4 left-4 md:hidden flex items-center gap-1.5 backdrop-blur px-2 py-1 rounded-xl text-xs font-bold border ${
            dm ? `bg-[#121212]/80 text-gray-200 ${RATING_BG_DM}` : `bg-white/90 text-gray-800 ${RATING_BG_LT}`
          }`}
        >
          <Star className={`w-3 h-3 ${RATING_COLOR}`} /> {rating.toFixed(1)}
          {noOfReviews > 0 && (
            <span className={`text-[10px] font-medium ${dm ? "text-gray-400" : "text-gray-500"}`}>
              ({noOfReviews})
            </span>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className={`flex-1 p-4 md:p-8 flex flex-col relative z-10 ${dm ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3
              className={`text-lg md:text-2xl font-bold leading-tight transition-colors duration-300 ${
                dm ? "text-gray-100 group-hover:text-[#00FF88]" : "text-gray-900 group-hover:text-green-700"
              }`}
            >
              {name}
            </h3>

            <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <MapPin className={`w-4 h-4 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              <LocationText academy={academy} />
            </div>
          </div>

          {/* Desktop Rating Badge */}
          <div className="hidden md:flex flex-col items-end">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border ${dm ? RATING_BG_DM : RATING_BG_LT}`}>
              <span className={`text-sm font-bold ${dm ? "text-gray-200" : "text-gray-800"}`}>{rating.toFixed(1)}</span>
              <Star className={`w-3.5 h-3.5 ${RATING_COLOR}`} />
            </div>
            {noOfReviews > 0 && (
              <span className={`text-[10px] mt-1 ${dm ? "text-gray-600" : "text-gray-400"}`}>
                {noOfReviews} review{noOfReviews !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className={`h-px w-full my-2.5 md:my-4 ${dm ? "bg-[#87A98D]/10" : "bg-gray-100"}`} />

        {/* Price, age groups, reviews */}
        <div className="flex flex-wrap gap-2 mb-3">
          {priceLabel && (
            <span className={`${PILL_BASE} ${dm ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
              <IndianRupee className="w-3 h-3" />
              {priceLabel}
            </span>
          )}
          {ageGroups.map((ag) => (
            <span key={ag} className={`${PILL_BASE} ${dm ? PILL_DM : PILL_LT}`}>
              {ag}
            </span>
          ))}
          {noOfReviews > 0 && (
            <span className={`hidden md:inline-flex ${PILL_BASE} ${dm ? PILL_DM : PILL_LT}`}>
              <UsersIcon className="w-3 h-3" />
              {noOfReviews} review{noOfReviews !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* One-line description — hidden on mobile */}
        {academy.description && (
          <p className={`hidden md:block text-sm leading-relaxed line-clamp-1 mb-0 ${dm ? "text-gray-500" : "text-gray-500"}`}>
            {academy.description}
          </p>
        )}

        {/* Contact details with text — mobile only, side by side */}
        <div className="flex items-center gap-5 md:hidden pt-2 flex-wrap">
          {academy.contactEmail && (
            <a
              href={`mailto:${academy.contactEmail}`}
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1.5 text-[11px] truncate ${
                dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-500 hover:text-emerald-600"
              }`}
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[130px]">{academy.contactEmail}</span>
            </a>
          )}
          {academy.contactPhone && (
            <a
              href={`tel:${academy.contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center gap-1.5 text-[11px] truncate ${
                dm ? "text-gray-400 hover:text-[#00FF88]" : "text-gray-500 hover:text-emerald-600"
              }`}
            >
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{academy.contactPhone}</span>
            </a>
          )}
        </div>

        {/* Bottom row */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 md:pt-4">
          {/* Micro-badge — left side */}
          {academy.startingPrice?.priceCents === 0 || academy.haveFreeTrial ? (
            <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-lg ${
              dm ? "text-[#00FF88]/70 bg-[#00FF88]/5" : "text-emerald-600/70 bg-emerald-50"
            }`}>
              Trial Available
            </span>
          ) : (
            <span className={`flex items-center gap-0.5 md:gap-1 text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-lg ${
              dm ? "text-amber-400/70 bg-amber-400/5" : "text-amber-600/70 bg-amber-50"
            }`}>
              <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" />
              Fast Response
            </span>
          )}

          {/* CTA — right side */}
          <motion.button
            className={`relative overflow-hidden px-4 py-2 md:px-6 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 shadow-lg transition-all duration-300 ml-auto ${
              dm
                ? "bg-[#00FF88] text-[#121212] shadow-[#00FF88]/10 group-hover:shadow-[#00FF88]/20"
                : "bg-gray-900 text-white shadow-gray-200 group-hover:bg-green-600 group-hover:shadow-green-200"
            }`}
            whileTap={{ scale: 0.98 }}
            onClick={goToDetails}
          >
            <span className="relative z-10">View Academy</span>
            <motion.span
              variants={{ idle: { x: 0 }, hover: { x: 4 } }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </motion.span>
          </motion.button>

          {/* Desktop-only: contact icons */}
          <div className="hidden md:flex items-center gap-3">
            {academy.contactEmail && (
              <a
                href={`mailto:${academy.contactEmail}`}
                onClick={(e) => e.stopPropagation()}
                title={academy.contactEmail}
                className={`p-2 rounded-lg border transition-colors ${
                  dm
                    ? "border-white/[0.06] hover:border-[#00FF88]/30 hover:bg-[#00FF88]/5 text-gray-500 hover:text-[#00FF88]"
                    : "border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"
                }`}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {academy.contactPhone && (
              <a
                href={`tel:${academy.contactPhone}`}
                onClick={(e) => e.stopPropagation()}
                title={academy.contactPhone}
                className={`p-2 rounded-lg border transition-colors ${
                  dm
                    ? "border-white/[0.06] hover:border-[#00FF88]/30 hover:bg-[#00FF88]/5 text-gray-500 hover:text-[#00FF88]"
                    : "border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"
                }`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
