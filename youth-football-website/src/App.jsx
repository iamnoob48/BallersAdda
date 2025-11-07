import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AcademyList from "./pages/AcademyList.jsx";
import SignUp from "./pages/SignUp";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";
import PlayerTournamentPage from "./pages/PlayerTournamentPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}></Route>
          <Route path="/academy" element={<AcademyList />}></Route>
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <PlayerTournamentPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route path="/Register" element={<SignUp />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile-complete" element={<CompleteProfilePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
