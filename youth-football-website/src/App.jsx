import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LandingPage from "./pages/LandingPage.jsx";
import AcademyList from "./pages/AcademyList.jsx";
import SignUp from "./pages/SignUp";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute";
import PlayerTournamentPage from "./pages/PlayerTournamentPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import ProfilePage from "./pages/ProfilePage";
import AuthSuccess from "./LoggedInPages/AuthSuccess";
import AcademyPage from "./pages/AcademyPage.jsx";
import AcademyViewPage from "./pages/AcademyViewPage";
import AcademyDetailsPageTest from "./AcademyDetailsPage/test-api";
import PaymentPage from "./pages/PaymentPage";
import PlayerAcademyDashboard from "./pages/PlayerAcademyDashboard";
import AcademyRegistration from "./pages/AcademyRegistration";
import AppLayout from "./components/AppLayout";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      <Router>
        <Routes>
          {/* Public routes — no sidebar */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <LandingPage />
            }
          />
          <Route path="/Register" element={<SignUp />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected routes — wrapped in AppLayout (sidebar + nav) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout><HomePage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <AppLayout><PlayerTournamentPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout><ProfilePage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-complete"
            element={
              <ProtectedRoute>
                <AppLayout><CompleteProfilePage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/academies"
            element={
              <ProtectedRoute>
                <AppLayout><AcademyPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/academy/details/:id"
            element={
              <ProtectedRoute>
                <AppLayout><AcademyViewPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <AppLayout><AcademyDetailsPageTest /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/academy/payment/:id"
            element={
              <ProtectedRoute>
                <AppLayout><PaymentPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-academy"
            element={
              <ProtectedRoute>
                <AppLayout><PlayerAcademyDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-academy"
            element={
              <ProtectedRoute>
                <AppLayout><AcademyRegistration /></AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
