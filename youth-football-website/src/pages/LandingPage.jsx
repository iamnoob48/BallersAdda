import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../LandingComponents/Hero.jsx";
import Header from "../LandingComponents/Header.jsx";
import ConnectingSection from "../LandingComponents/ConnectingSection.jsx";
import Academy from "../LandingComponents/Academy.jsx";
import HowItWorks from "../LandingComponents/HowItWorks.jsx";
import CTA from "../LandingComponents/CTA.jsx";
import api from "../api/axios.js";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Hero />
      <ConnectingSection />
      <Academy />
      <HowItWorks />
      <CTA />
    </>
  );
}

export default LandingPage;
