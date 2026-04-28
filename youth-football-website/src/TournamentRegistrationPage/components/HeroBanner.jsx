import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  formatCurrency,
  formatTournamentDate,
  getTournamentPrimaryAction,
} from '../../lib/tournamentUtils';

export default function HeroBanner({ tournament, onPrimaryAction, isAlreadyRegistered, registeredTeamId }) {
  const navigate = useNavigate();
  const dm = useSelector((s) => s.theme.darkMode);
  
  const isOngoing = tournament.status === 'ONGOING';
  const isCompleted = tournament.status === 'COMPLETED';
  
  // Status config
  let statusBadge = { text: 'Open / Upcoming', color: dm ? 'text-[#00FF88] bg-[#00FF88]/10 border-[#00FF88]/20' : 'text-emerald-700 bg-emerald-100 border-emerald-200' };
  
  if (isOngoing) {
    statusBadge = { text: 'Live · Ongoing', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  } else if (isCompleted) {
    statusBadge = { text: 'Completed', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden mb-8 border ${dm ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
      {/* Background Graphic / Image Placeholders */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className={`absolute inset-0 bg-gradient-to-t ${dm ? 'from-[#121212] via-[#121212]/80 to-transparent' : 'from-white via-white/80 to-transparent'}`} />
        <img 
          src={tournament.venueImage || "https://images.unsplash.com/photo-1518605368461-1ee7e543666f?q=80&w=2670&auto=format&fit=crop"} 
          alt="Pitch" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end min-h-[300px]">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusBadge.color}`}>
            {isOngoing && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>}
            {statusBadge.text}
          </span>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${dm ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-gray-100 text-gray-700'}`}>
            {tournament.category}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
          {tournament.name}
        </h1>
        
        <p className={`text-base md:text-lg max-w-2xl font-medium ${dm ? 'text-gray-300' : 'text-gray-700'}`}>
          {tournament.description || "The ultimate youth football battleground. Prove your skills, climb the ranks, and take home the trophy."}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            {
              icon: <MapPin className="w-4 h-4" />,
              value: tournament.location,
            },
            {
              icon: <Trophy className="w-4 h-4" />,
              value: formatCurrency(tournament.price),
            },
            {
              icon: <Calendar className="w-4 h-4" />,
              value: formatTournamentDate(tournament.startDate),
            },
          ].map((item) => (
            <div
              key={item.value}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md ${
                dm
                  ? "border-white/10 bg-black/25 text-gray-100"
                  : "border-white/60 bg-white/75 text-gray-800"
              }`}
            >
              {item.icon}
              <span>{item.value}</span>
            </div>
          ))}
        </div>

        {isAlreadyRegistered ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-black border ${dm ? 'border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88]' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              You are already registered for this tournament!
            </div>
            <button
              type="button"
              onClick={() => navigate(`/my-tournaments/${registeredTeamId}`)}
              className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-black transition-transform hover:scale-[1.02] ${dm ? 'bg-[#00FF88] text-[#121212]' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-400/20'}`}
            >
              <ExternalLink className="w-4 h-4" />
              Go to Team Hub
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`mt-6 rounded-md px-6 py-3 text-sm font-black transition-transform hover:scale-[1.02] ${
              dm
                ? "bg-[#00FF88] text-[#121212]"
                : "bg-emerald-600 text-white shadow-lg shadow-emerald-400/20"
            }`}
          >
            {getTournamentPrimaryAction(tournament.status)}
          </button>
        )}
      </div>
    </div>
  );
}
