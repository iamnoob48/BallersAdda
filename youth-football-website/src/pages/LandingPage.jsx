import Hero from "../components/Hero.jsx"
import Header from "../components/Header.jsx";
import Tournaments from "../components/Tournaments.jsx";
import Academy from "../components/Academy.jsx";
import CTA from "../components/CTA.jsx";
import Footer from "../components/Footer.jsx";

function LandingPage(){
    return(
        <>
            <Header/>
            <Hero/>
            <Tournaments/>
            <Academy/>
            <CTA/>
            <Footer/>


        </>
    )
}
export default LandingPage;