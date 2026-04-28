import { useSelector } from "react-redux";
import HeroHome from "./HeroHome";
import HomeAcademy from "./HomeAcademy";
import HomeTournaments from "./HomeTournaments";
import HomeLeaderboard from "./HomeLeaderboard";

/**
 * HomePageMain — orchestrates all home-page sections.
 *
 * Reads shared Redux state once and passes the necessary data
 * down to each child component as props.
 */
export default function HomePageMain() {
  const { user } = useSelector((state) => state.auth);
  const { profile, academy, loading, myTournaments, myTournamentsLoading } = useSelector((state) => state.player);
  const dm = useSelector((state) => state.theme.darkMode);

  const firstName = user?.username?.split(" ")[0] || "Player";
  const hasAcademy = !!academy;

  return (
    <div className={`min-h-screen pb-20 overflow-x-hidden transition-colors duration-300 ${dm ? "bg-[#121212]" : "bg-white"}`}>
      {/* ── Welcome Hero ── */}
      <HeroHome user={user} profile={profile} academy={academy} loading={loading} dm={dm} />

      {/* ── Academy Status ── */}
      <HomeAcademy hasAcademy={hasAcademy} academy={academy} dm={dm} />

      {/* ── My Tournaments ── */}
      <HomeTournaments dm={dm} tournaments={myTournaments} loading={myTournamentsLoading} />

      {/* ── Leaderboard ── */}
      <HomeLeaderboard firstName={firstName} dm={dm} />
    </div>
  );
}

