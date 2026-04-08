import React from "react";
import NavBar from "../HomeComponents/Navbar";
import BottomNav from "../HomeComponents/BottomNav";
import TopNav from "../HomeComponents/TopNav";
import { useIsMobile } from "../hooks/useIsMobile.js";
import AcademyHero from "../AcademyPageComponents/AcademyHero.jsx";

function AcademyPage() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? <TopNav /> : <NavBar />}
      <div>
        <AcademyHero />
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}

export default AcademyPage;
