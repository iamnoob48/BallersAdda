import React, { useEffect } from "react";
import NavBar from "../HomeComponents/Navbar";
import HeroHome from "../HomeComponents/HeroHome";
import BottomNav from "../HomeComponents/BottomNav";
import TopNav from "../HomeComponents/TopNav";
import { useIsMobile } from "../hooks/useIsMobile.js";

function HomePage() {
  const isMobile = useIsMobile();

  return (
    <div>
      {isMobile ? <TopNav /> : <NavBar />}
      <div>
        <HeroHome />
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}

export default HomePage;
