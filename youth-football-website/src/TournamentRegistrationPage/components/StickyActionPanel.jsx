import React from 'react';
import { useSelector } from 'react-redux';
import { Clock, ExternalLink, Share2, ClipboardList, Trophy, MapPin } from 'lucide-react';
import {
  formatCurrency,
  formatTournamentDate,
  getTournamentPrimaryAction,
} from '../../lib/tournamentUtils';

const getDaysLeft = (date) => {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function StickyActionPanel({ tournament, onPrimaryAction }) {
  const dm = useSelector((s) => s.theme.darkMode);

  const isOngoing = tournament.status === 'ONGOING';
  const isCompleted = tournament.status === 'COMPLETED';
  const daysLeft = getDaysLeft(tournament.registrationDeadline);
  
  return (
    <div className={`sticky top-24 p-6 rounded-3xl border shadow-lg ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15 shadow-black/50' : 'bg-white border-gray-200 shadow-gray-200/50'}`}>
      <div className={`mb-6 rounded-2xl border p-4 ${dm ? "border-[#87A98D]/10 bg-[#121212]" : "border-gray-200 bg-gray-50"}`}>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">At A Glance</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${isOngoing ? "bg-red-500/10 text-red-500" : isCompleted ? "bg-gray-500/10 text-gray-500" : dm ? "bg-[#00FF88]/10 text-[#00FF88]" : "bg-emerald-100 text-emerald-700"}`}>
            {tournament.status}
          </span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Trophy className={`mt-0.5 h-4 w-4 shrink-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <div>
              <p className="font-bold">Prize Pool</p>
              <p className={dm ? "text-gray-400" : "text-gray-600"}>{formatCurrency(tournament.price)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
            <div>
              <p className="font-bold">Venue</p>
              <p className={dm ? "text-gray-400" : "text-gray-600"}>{tournament.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6 pb-6 border-b border-dashed border-gray-500/30">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Tournament Status</h3>
        {isOngoing ? (
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE & ONGOING
          </div>
        ) : isCompleted ? (
          <div className="text-gray-500 font-bold">COMPLETED</div>
        ) : (
          <div>
            <div className={`text-xl font-black mb-1 ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`}>OPEN</div>
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-600 dark:text-yellow-500">
              <Clock className="w-3.5 h-3.5" />
              {daysLeft > 0 ? `Closes in ${daysLeft} Days` : 'Closing Today!'}
            </div>
            <p className={`mt-2 text-xs ${dm ? "text-gray-500" : "text-gray-500"}`}>
              Deadline: {formatTournamentDate(tournament.registrationDeadline)}
            </p>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className={`mb-6 rounded-2xl border p-4 ${dm ? "border-[#87A98D]/10 bg-[#121212]" : "border-gray-200 bg-gray-50"}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
            Entry Snapshot
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Registration Fee</p>
              <p className={`mt-1 text-2xl font-black ${dm ? "text-white" : "text-gray-900"}`}>
                {formatCurrency(tournament.registrationFee)}
              </p>
            </div>
            <div className={`text-right text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
              <p>{tournament.maxTeams || 16} teams</p>
              <p>{tournament.maxPlayersPerTeam || 11} player max</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={onPrimaryAction}
          className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${isOngoing || isCompleted ? (dm ? 'bg-white text-[#121212] hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800') : (dm ? 'bg-[#00FF88] text-[#121212] shadow-[#00FF88]/20 hover:shadow-[#00FF88]/40 hover:scale-[1.01]' : 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/50 hover:scale-[1.01]')} shadow-xl`}
        >
          {isOngoing || isCompleted ? <ExternalLink className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
          {getTournamentPrimaryAction(tournament.status)}
        </button>

        <button className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border ${dm ? 'bg-transparent border-gray-700 hover:bg-gray-800' : 'bg-transparent border-gray-200 hover:bg-gray-50'}`}>
          <Share2 className="w-4 h-4" /> Share Event
        </button>
      </div>

    </div>
  );
}
