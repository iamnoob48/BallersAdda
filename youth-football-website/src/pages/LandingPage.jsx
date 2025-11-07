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

  useEffect(() => {
    // Check if the user has an access token
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/verify-token");
        // If the token is valid, navigate to the home page
        navigate("/home");
      } catch (error) {
        console.error("Authentication check failed:", error);
      }
    };
    checkAuth();
  }, [navigate]);

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
