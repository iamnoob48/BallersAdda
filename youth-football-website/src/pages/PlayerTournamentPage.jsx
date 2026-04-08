import React from "react";
import NavBar from "../HomeComponents/Navbar";
import BottomNav from "../HomeComponents/BottomNav";
import TopNav from "../HomeComponents/TopNav";
import { useIsMobile } from "../hooks/useIsMobile.js";
import TournamentPage from "../TournamentComponents/TournamentPage";

function PlayerTournamentPage() {
  const isMobile = useIsMobile();
  return (
    <div>
      {isMobile ? <TopNav /> : <NavBar />}

      <TournamentPage />
      {isMobile && <BottomNav />}
    </div>
  );
}

export default PlayerTournamentPage;
