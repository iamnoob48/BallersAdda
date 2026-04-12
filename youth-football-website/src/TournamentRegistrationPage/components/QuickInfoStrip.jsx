import React from 'react';
import { useSelector } from 'react-redux';
import { MapPin, Trophy, CalendarDays, Users } from 'lucide-react';
import { formatCurrency, formatTournamentDate } from '../../lib/tournamentUtils';

export default function QuickInfoStrip({ tournament }) {
  const dm = useSelector((s) => s.theme.darkMode);

  const stats = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Venue / Location",
      value: tournament.location
    },
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: tournament.status === 'UPCOMING' ? "Kickoff Date" : "Tournament Window",
      value: `${formatTournamentDate(tournament.startDate)}${tournament.endDate ? ` - ${formatTournamentDate(tournament.endDate)}` : ""}`
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: "Prize Pool",
      value: formatCurrency(tournament.price)
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: tournament.status === "UPCOMING" ? "Registration Window" : "Format",
      value:
        tournament.status === "UPCOMING"
          ? `Closes ${formatTournamentDate(tournament.registrationDeadline)}`
          : `${tournament.maxTeams || 16} Teams · ${tournament.maxPlayersPerTeam || 11} players max`
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl mb-8 border ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}>
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-2 rounded-lg ${dm ? 'bg-[#121212] text-[#00FF88]' : 'bg-emerald-50 text-emerald-600'}`}>
              {stat.icon}
            </div>
            <span className={`text-xs uppercase font-bold tracking-wider ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
              {stat.label}
            </span>
          </div>
          <span className="text-sm font-bold pl-10 md:pl-0 lg:pl-10">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
