import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import HeroBanner from './components/HeroBanner';
import QuickInfoStrip from './components/QuickInfoStrip';
import TournamentDescription from './components/TournamentDescription';
import OngoingModule from './components/OngoingModule';
import StickyActionPanel from './components/StickyActionPanel';
import RegistrationOverview from './components/RegistrationOverview';
import RegistrationFormModal from './components/RegistrationFormModal';
import { useGetTournamentByIdQuery } from '../redux/slices/tournamentSlice';
import {
  getTournamentPrimaryAction,
  mapTournamentToCardModel,
} from '../lib/tournamentUtils';

export default function TournamentRegistrationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dm = useSelector((s) => s.theme.darkMode);
  const { myTournaments } = useSelector((s) => s.player);
  const liveSectionRef = useRef(null);
  const registerSectionRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const routeTournament = location.state?.tournament || null;
  const {
    data: tournamentResponse,
    isLoading,
    error,
  } = useGetTournamentByIdQuery(id);

  const tournament = useMemo(() => {
    if (tournamentResponse) return mapTournamentToCardModel(tournamentResponse);
    return routeTournament || null;
  }, [routeTournament, tournamentResponse]);

  const { isAlreadyRegistered, registeredTeamId } = useMemo(() => {
    if (!tournament || !myTournaments?.length) return { isAlreadyRegistered: false, registeredTeamId: null };
    const entry = myTournaments.find((t) => t.tournament?.id === tournament.id);
    return { isAlreadyRegistered: !!entry, registeredTeamId: entry?.team?.id ?? null };
  }, [tournament, myTournaments]);

  const showLiveCenter = tournament?.status === 'ONGOING' || tournament?.status === 'COMPLETED';

  const handlePrimaryAction = () => {
    if (!showLiveCenter) {
      setIsModalOpen(true);
    } else {
      liveSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading && !tournament) {
    return (
      <div className={`min-h-screen px-4 py-8 ${dm ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className={`h-[320px] rounded-3xl ${dm ? 'bg-[#1a1a1a]' : 'bg-white'}`} />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`h-28 rounded-3xl ${dm ? 'bg-[#1a1a1a]' : 'bg-white'}`}
              />
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
            <div className={`h-[420px] rounded-3xl ${dm ? 'bg-[#1a1a1a]' : 'bg-white'}`} />
            <div className={`h-[320px] rounded-3xl ${dm ? 'bg-[#1a1a1a]' : 'bg-white'}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className={`min-h-screen px-4 py-8 ${dm ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className={`mx-auto max-w-3xl rounded-3xl border p-8 text-center ${dm ? 'border-[#87A98D]/15 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
          <h1 className="text-2xl font-black">Could not load this tournament</h1>
          <p className={`mt-3 text-sm ${dm ? 'text-gray-400' : 'text-gray-500'}`}>
            The tournament detail page is wired up, but this event could not be fetched right now.
          </p>
          <button
            type="button"
            onClick={() => navigate('/tournaments')}
            className={`mt-6 rounded-full px-5 py-3 text-sm font-black ${dm ? 'bg-[#00FF88] text-[#121212]' : 'bg-emerald-600 text-white'}`}
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className={`min-h-screen pb-28 lg:pb-12 ${dm ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate('/tournaments')}
          className={`mb-6 inline-flex items-center gap-2 text-sm font-bold ${dm ? 'text-gray-400 hover:text-[#00FF88]' : 'text-gray-500 hover:text-emerald-600'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        <HeroBanner tournament={tournament} onPrimaryAction={handlePrimaryAction} isAlreadyRegistered={isAlreadyRegistered} registeredTeamId={registeredTeamId} />
        <QuickInfoStrip tournament={tournament} />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="min-w-0">
            <TournamentDescription tournament={tournament} />

            {showLiveCenter ? (
              <div ref={liveSectionRef}>
                <OngoingModule tournament={tournament} />
              </div>
            ) : (
              <div ref={registerSectionRef}>
                <RegistrationOverview tournament={tournament} />
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <StickyActionPanel
              tournament={tournament}
              onPrimaryAction={handlePrimaryAction}
              isAlreadyRegistered={isAlreadyRegistered}
              registeredTeamId={registeredTeamId}
            />
          </div>
        </div>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-40 border-t p-3 lg:hidden ${dm ? 'border-[#87A98D]/15 bg-[#121212]/95 backdrop-blur-xl' : 'border-gray-200 bg-white/95 backdrop-blur-xl'}`}>
        {isAlreadyRegistered ? (
          <button
            type="button"
            onClick={() => navigate(`/my-tournaments/${registeredTeamId}`)}
            className={`w-full rounded-2xl py-3 text-sm font-black ${dm ? 'bg-[#00FF88] text-[#121212]' : 'bg-emerald-600 text-white'}`}
          >
            Go to Team Hub
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className={`w-full rounded-2xl py-3 text-sm font-black ${dm ? 'bg-[#00FF88] text-[#121212]' : 'bg-emerald-600 text-white'}`}
          >
            {getTournamentPrimaryAction(tournament.status)}
          </button>
        )}
      </div>

      <RegistrationFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tournament={tournament} 
      />
    </div>
  );
}
