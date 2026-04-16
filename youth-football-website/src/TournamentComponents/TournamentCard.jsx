import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCalendar,
  FiChevronDown,
} from "react-icons/fi";
import { FaTrophy, FaUsers } from "react-icons/fa";

export default function TournamentCard({ data, view, dm }) {
  const navigate = useNavigate();
  const isFull = data.totalSeats > 0 && data.seatsLeft === 0;
  const fillPercentage =
    data.totalSeats > 0
      ? ((data.totalSeats - data.seatsLeft) / data.totalSeats) * 100
      : 0;
  const isFillingFast = !isFull && data.totalSeats > 0 && data.seatsLeft <= 5;
  const isUpcoming = data.status === "UPCOMING";
  const primaryLabel = isUpcoming
    ? (isFull ? "Registration Closed" : "Register Now")
    : "View Details";

  const isDisabled = isUpcoming && isFull;

  const handlePrimaryAction = () => {
    if (isDisabled) return;
    navigate(`/tournament/${data.id}`, { state: { tournament: data } });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group border overflow-hidden relative ${
        view === "grid"
          ? `rounded-2xl shadow-sm ${dm ? "hover:shadow-lg hover:shadow-[#00FF88]/5" : "hover:shadow-xl hover:shadow-green-900/5"}`
          : `rounded-xl shadow-sm ${dm ? "hover:shadow-md" : "hover:shadow-md"} flex flex-row`
      } ${dm ? "bg-[#1a1a1a] border-[#87A98D]/15" : "bg-white border-gray-100"}`}
    >
      {/* Card Header / Image */}
      <div
        className={`${
          view === "grid" ? "h-40" : "w-32 md:w-48 shrink-0"
        } relative overflow-hidden bg-gradient-to-br ${data.imageGradient}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_2px,transparent_2px)] [background-size:12px_12px]" />

        <div className="absolute inset-0 flex items-center justify-center text-white/90 font-bold text-3xl tracking-widest uppercase opacity-30">
          {data.category?.substring(0, 3) || "TRN"}
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          <span className={`backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide ${dm ? "bg-[#121212]/80 text-gray-200" : "bg-white/90 text-gray-900"}`}>
            {data.category}
          </span>
          {data.status && data.status !== "UPCOMING" && (
            <span className={`backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide ${
              data.status === "ONGOING"
                ? "bg-yellow-500/90 text-yellow-900"
                : "bg-gray-500/80 text-white"
            }`}>
              {data.status}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div
        className={`flex-1 p-5 ${
          view === "list" && "flex items-center justify-between gap-4"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {data.registrationFee > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  dm ? "bg-purple-900/30 text-purple-400 border-purple-800/30" : "bg-purple-50 text-purple-700 border-purple-100"
                }`}
              >
                ₹{data.registrationFee.toLocaleString("en-IN")} entry
              </span>
            )}
            {isFillingFast && (
              <span className="text-[10px] font-bold text-red-500 animate-pulse">
                Filling Fast!
              </span>
            )}
          </div>

          <h3 className={`font-bold text-lg leading-tight transition-colors ${dm ? "text-gray-100 group-hover:text-[#00FF88]" : "text-gray-900 group-hover:text-green-600"}`}>
            {data.name}
          </h3>

          <div className="mt-3 space-y-1.5">
            <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <FiCalendar className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              {data.dateLabel}
            </div>
            <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
              <FiMapPin className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
              {data.location}
            </div>
            {data.registeredPlayers > 0 && (
              <div className={`flex items-center text-sm ${dm ? "text-gray-500" : "text-gray-500"}`}>
                <FaUsers className={`w-4 h-4 mr-2 ${dm ? "text-gray-600" : "text-gray-400"}`} />
                {data.registeredPlayers} players registered
              </div>
            )}
          </div>
        </div>

        {view === "list" && (
          <div className={`hidden md:block w-px h-12 mx-4 ${dm ? "bg-[#87A98D]/10" : "bg-gray-100"}`} />
        )}

        {/* Footer / Action */}
        <div
          className={`mt-5 ${
            view === "list" ? "mt-0 text-right min-w-[140px]" : ""
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 ${
              view === "list" && "flex-col items-end justify-center gap-0 mb-0"
            }`}
          >
            <div className={`flex items-center gap-1.5 font-bold ${dm ? "text-[#00FF88]" : "text-green-700"}`}>
              <FaTrophy className="text-yellow-500" />
              <span>{data.prizeLabel}</span>
            </div>

            {view === "grid" && data.totalSeats > 0 && (
              <div className={`text-xs font-medium ${dm ? "text-gray-500" : "text-gray-400"}`}>
                {isFull ? "Full" : `${data.seatsLeft} spots left`}
              </div>
            )}
          </div>

          {view === "grid" && !isFull && data.totalSeats > 0 && (
            <div className={`h-1.5 w-full rounded-full mb-4 overflow-hidden ${dm ? "bg-[#2a2a2a]" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full ${
                  isFillingFast ? "bg-red-500" : dm ? "bg-[#00FF88]" : "bg-green-500"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          )}

          <button
            disabled={isDisabled}
            onClick={handlePrimaryAction}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              isDisabled
                ? dm ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : dm ? "bg-[#00FF88] text-[#121212] hover:bg-[#00FF88]/90 hover:shadow-lg hover:shadow-[#00FF88]/10 active:scale-95" : "bg-gray-900 text-white hover:bg-green-600 hover:shadow-lg hover:shadow-green-600/20 active:scale-95"
            }`}
          >
            {isDisabled ? (
              primaryLabel
            ) : (
              <>
                {primaryLabel} <FiChevronDown className="-rotate-90" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
