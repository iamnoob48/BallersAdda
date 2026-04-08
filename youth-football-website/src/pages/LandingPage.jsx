import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../LandingComponents/Hero.jsx";
import Header from "../LandingComponents/Header.jsx";
import Tournaments from "../LandingComponents/Tournaments.jsx";
import Academy from "../LandingComponents/Academy.jsx";
import CTA from "../LandingComponents/CTA.jsx";
import Footer from "../LandingComponents/Footer.jsx";
import api from "../api/axios.js";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <Hero />
      <Tournaments />
      <Academy />
      <CTA />
      <Footer />
    </>
  );
}

export default LandingPage;
