import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import TournamentsList from "./pages/TournamentList.jsx";
import AcademyList from "./pages/AcademyList.jsx";
import SignUp from "./pages/SignUp";
import LoginPage from "./pages/LoginPage";
import Header from "./components/Header";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/tournaments" element={<TournamentsList />}></Route>
          <Route path="/academy" element={<AcademyList />}></Route>
          <Route path="/Register" element={<SignUp />} />
          <Route path="/Login" element={<LoginPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
