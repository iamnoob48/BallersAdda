import React from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, ClipboardList, ShieldCheck, Trophy, Users } from 'lucide-react';
import { formatCurrency, formatTournamentDate } from '../../lib/tournamentUtils';

export default function RegistrationOverview({ tournament }) {
  const dm = useSelector((s) => s.theme.darkMode);

  const items = [
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: "Registration Deadline",
      value: formatTournamentDate(tournament.registrationDeadline),
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: "Prize Pool",
      value: formatCurrency(tournament.price),
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Field Capacity",
      value: `${tournament.maxTeams || 16} teams · max ${tournament.maxPlayersPerTeam || 11} players`,
    },
  ];

  return (
    <section className={`rounded-3xl border p-6 md:p-8 ${dm ? 'bg-[#1a1a1a] border-[#87A98D]/15' : 'bg-white border-gray-200'}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className={`mb-2 text-xs font-bold uppercase tracking-[0.18em] ${dm ? "text-[#00FF88]" : "text-emerald-600"}`}>
            Registration Window
          </p>
          <h2 className="text-xl font-black tracking-tight">
            Everything a team needs before hitting register.
          </h2>
          <p className={`mt-2 text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            Keep the page scannable: deadline, entry requirements, prize pool, and format are visible before the final action.
          </p>
        </div>
        <div className={`hidden rounded-2xl p-3 md:flex ${dm ? "bg-[#121212] text-[#00FF88]" : "bg-emerald-50 text-emerald-600"}`}>
          <ClipboardList className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${dm ? "border-[#87A98D]/10 bg-[#121212]" : "border-gray-200 bg-gray-50"}`}
          >
            <div className={`mb-3 inline-flex rounded-xl p-2 ${dm ? "bg-[#1a1a1a] text-[#00FF88]" : "bg-white text-emerald-600"}`}>
              {item.icon}
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${dm ? "text-gray-500" : "text-gray-400"}`}>
              {item.label}
            </p>
            <p className="mt-1 text-sm font-bold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className={`mt-6 rounded-2xl border p-4 ${dm ? "border-[#00FF88]/20 bg-[#00FF88]/5" : "border-emerald-200 bg-emerald-50/60"}`}>
        <div className="flex items-start gap-3">
          <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${dm ? "text-[#00FF88]" : "text-emerald-600"}`} />
          <div>
            <p className="text-sm font-bold">UX recommendation</p>
            <p className={`mt-1 text-sm ${dm ? "text-gray-400" : "text-gray-600"}`}>
              Keep registration on a focused next step. This page should sell the event first, then let the user commit with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
