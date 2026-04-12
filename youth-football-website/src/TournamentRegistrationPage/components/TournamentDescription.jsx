import React from 'react';
import { useSelector } from 'react-redux';

export default function TournamentDescription({ tournament }) {
  const dm = useSelector((s) => s.theme.darkMode);

  return (
    <div className={`p-6 md:p-8 rounded-3xl mb-8 border ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}>
      <h2 className="text-xl font-black mb-4 tracking-tight">About the Tournament</h2>
      
      <div className={`prose max-w-none text-sm md:text-base leading-relaxed space-y-4 ${dm ? 'text-gray-300' : 'text-gray-600'}`}>
        <p>
          {tournament.description || "Join one of the most competitive youth football tournaments this season. This event brings together high-intent academies and rising squads to compete for bragging rights, silverware, and a meaningful prize pool."}
        </p>
        
        <h3 className={`text-sm font-bold uppercase mt-6 mb-2 ${dm ? 'text-[#00FF88]' : 'text-emerald-700'}`}>Format & Rules</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Group stages followed by direct knockouts.</li>
          <li>Matches consist of two halves of 25 minutes each.</li>
          <li>Maximum of {tournament.maxPlayersPerTeam || 11} players on the pitch per team.</li>
          <li>Rolling substitutions permitted.</li>
        </ul>

        <h3 className={`text-sm font-bold uppercase mt-6 mb-2 ${dm ? 'text-[#00FF88]' : 'text-emerald-700'}`}>Why Join?</h3>
        <p>
          The page is designed to help teams decide quickly: what the tournament is, where it happens, what is at stake, and whether they should register now or jump into live standings and scores.
        </p>
      </div>
    </div>
  );
}
