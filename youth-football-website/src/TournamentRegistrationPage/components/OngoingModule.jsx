import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetTournamentLeaderboardQuery } from '../../redux/slices/leaderboardApi.js';
import TournamentBracket from './TournamentBracket.jsx';

function flattenBracketMatches(bracket) {
  if (!bracket?.rounds) return [];
  return bracket.rounds.flatMap((round) =>
    (round.matches || []).map((m) => ({
      id: m.id,
      phase: round.name,
      teamA: m.homeTeam?.name || 'TBD',
      teamB: m.awayTeam?.name || 'TBD',
      scoreA: m.homeScore ?? '-',
      scoreB: m.awayScore ?? '-',
      status: m.status,
      clock: m.status === 'COMPLETED' ? 'FT' : m.status === 'LIVE' ? 'LIVE' : 'TBD',
    }))
  );
}

export default function OngoingModule({ tournament }) {
  const dm = useSelector((s) => s.theme.darkMode);
  const isLiveTournament = tournament.status === "ONGOING";
  const isUpcoming = tournament.status === "UPCOMING";

  const { data, isLoading, isError, refetch } = useGetTournamentLeaderboardQuery(
    tournament.id,
    { skip: isUpcoming }
  );

  const style = data?.tournamentStyle;
  const showBracket = style === 'KNOCKOUT' || style === 'HYBRID';
  const showStandings = style === 'ROUND_ROBIN' || style === 'HYBRID';

  const defaultTab = showBracket ? 'bracket' : showStandings ? 'standings' : 'scores';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (data?.tournamentStyle) {
      setActiveTab((prev) => {
        const allowed = new Set(['scores']);
        if (showBracket) allowed.add('bracket');
        if (showStandings) allowed.add('standings');
        return allowed.has(prev) ? prev : (showBracket ? 'bracket' : showStandings ? 'standings' : 'scores');
      });
    }
  }, [data?.tournamentStyle, showBracket, showStandings]);

  const matches = useMemo(() => {
    if (!data) return [];
    if (showBracket && data.bracket) return flattenBracketMatches(data.bracket);
    if (data.matches) return data.matches;
    return [];
  }, [data, showBracket]);

  const tabs = useMemo(() => {
    const t = [];
    if (showBracket) t.push({ key: 'bracket', label: 'Bracket' });
    if (showStandings) t.push({ key: 'standings', label: 'Standings' });
    t.push({ key: 'scores', label: 'Match Scores' });
    return t;
  }, [showBracket, showStandings]);

  return (
    <div className={`p-6 md:p-8 rounded-3xl mb-8 border ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">
            {isLiveTournament ? "Live Tournament Center" : "Standings & Results"}
          </h2>
          <p className={`${dm ? "text-gray-400" : "text-gray-500"} text-sm`}>
            {isLiveTournament
              ? "Track current standings and every ongoing match score in one place."
              : "Review how the tournament table and match results finished out."}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${isLiveTournament ? "bg-red-500/10 text-red-500" : dm ? "bg-[#121212] text-gray-400" : "bg-gray-100 text-gray-600"}`}>
          {isLiveTournament && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
          {isLiveTournament ? "Live Scores" : "Final Results"}
        </div>
      </div>

      {isUpcoming ? (
        <div className={`p-8 text-center text-sm rounded-2xl border ${dm ? 'bg-[#121212] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          Live data will appear once the tournament starts.
        </div>
      ) : isLoading ? (
        <PulseSkeleton dm={dm} />
      ) : isError ? (
        <div className={`p-6 rounded-2xl border text-center ${dm ? 'bg-[#121212] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Could not load live data.</p>
          <button
            onClick={refetch}
            className={`mt-3 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              dm ? 'bg-[#00FF88]/15 text-[#00FF88] hover:bg-[#00FF88]/25' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className={`flex gap-6 border-b mb-6 ${dm ? 'border-gray-800' : 'border-gray-200'}`}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm font-bold uppercase tracking-wide relative transition-colors ${
                  activeTab === tab.key
                    ? (dm ? "text-[#00FF88]" : "text-emerald-600")
                    : (dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div layoutId="ongoingTab" className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full ${dm ? "bg-[#00FF88]" : "bg-emerald-600"}`} />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'bracket' && showBracket && (
              <motion.div key="bracket" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TournamentBracket bracket={data.bracket} dm={dm} />
              </motion.div>
            )}

            {activeTab === 'standings' && showStandings && (
              <motion.div key="standings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className={`border-b ${dm ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                        <th className="py-3 px-2 font-bold w-12 text-center">#</th>
                        <th className="py-3 px-4 font-bold">Team</th>
                        <th className="py-3 px-2 font-bold text-center">P</th>
                        <th className="py-3 px-2 font-bold text-center">W</th>
                        <th className="py-3 px-2 font-bold text-center">D</th>
                        <th className="py-3 px-2 font-bold text-center">L</th>
                        <th className="py-3 px-2 font-bold text-center">GD</th>
                        <th className={`py-3 px-4 font-bold text-right text-base ${dm ? 'text-[#00FF88]' : 'text-emerald-600'}`}>Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/10 dark:divide-gray-800">
                      {(data.standings || []).map((row) => (
                        <tr key={row.team.id} className={`${dm ? 'hover:bg-[#121212]/50' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="py-4 px-2 text-center font-mono font-bold text-xs">{row.rank}</td>
                          <td className="py-4 px-4 font-bold">{row.team.name}</td>
                          <td className="py-4 px-2 text-center text-gray-500">{row.played}</td>
                          <td className="py-4 px-2 text-center text-gray-500">{row.won}</td>
                          <td className="py-4 px-2 text-center text-gray-500">{row.drawn}</td>
                          <td className="py-4 px-2 text-center text-gray-500">{row.lost}</td>
                          <td className={`py-4 px-2 text-center font-mono ${row.goalDifference > 0 ? 'text-emerald-500' : row.goalDifference < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-lg">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'scores' && (
              <motion.div key="scores" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {matches.length === 0 ? (
                  <div className={`p-6 text-center text-sm ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                    No matches yet.
                  </div>
                ) : (
                  matches.map((match) => (
                    <div key={match.id} className={`flex items-center justify-between p-4 rounded-2xl border ${dm ? 'bg-[#121212] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="min-w-[80px] text-left text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        {match.phase}
                      </div>
                      <div className="flex-1 text-right font-bold pr-4 truncate">
                        {match.teamA}
                      </div>
                      <div className={`px-4 py-2 rounded-xl flex items-center justify-center gap-3 font-mono text-xl font-black ${dm ? 'bg-[#1a1a1a] text-white shadow-inner shadow-black/50' : 'bg-white text-gray-900 shadow-sm'}`}>
                        <span>{match.scoreA}</span>
                        <span className="text-gray-500 text-sm">-</span>
                        <span>{match.scoreB}</span>
                      </div>
                      <div className="flex-1 text-left font-bold pl-4 truncate">
                        {match.teamB}
                      </div>
                      <div className="w-16 flex flex-col items-end">
                        {match.status === "LIVE" ? (
                          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {match.clock}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs font-bold uppercase">{match.clock}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function PulseSkeleton({ dm }) {
  const bar = dm ? 'bg-[#2a2a2a]' : 'bg-gray-200';
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`h-16 rounded-2xl animate-pulse ${bar}`} />
      ))}
    </div>
  );
}
