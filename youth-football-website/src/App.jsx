import "./App.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { verifyUser } from "./redux/slices/authSlice.js";
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
import PaymentPage from "./pages/PaymentPage";
import PlayerAcademyDashboard from "./PlayerAcademyDashboard/PlayerAcademyDashboard";
import CoachSetupPage from "./pages/CoachSetupPage";
import CoachDashboard from "./pages/CoachDashboard";
import TournamentRegistrationPage from "./TournamentRegistrationPage";
import TeamRegistrationPage from "./TournamentRegistrationPage/components/TeamRegistrationPage";
import AppLayout from "./components/AppLayout";
import JoinTeamPage from "./pages/JoinTeamPage";
import TeamHubPage from "./TeamHubComponents/TeamHubPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LeaderboardPage from "./LeaderboardPage/LeaderboardPage";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    // Only verify if we don’t already know the auth state
    if (isAuthenticated === null) {
      dispatch(verifyUser());
    }
  }, [dispatch, isAuthenticated]);

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Verifying session...
      </div>
    );
  }

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
          {/* Public invite-acceptance page — no auth wrapper so guests can see team info */}
          <Route path="/join" element={<JoinTeamPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            path="/tournament/:id"
            element={
              <ProtectedRoute>
                <AppLayout><TournamentRegistrationPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournament/:id/register"
            element={
              <ProtectedRoute>
                <AppLayout><TeamRegistrationPage /></AppLayout>
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
                <CompleteProfilePage />
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
            path="/coach-setup"
            element={
              <ProtectedRoute>
                <AppLayout><CoachSetupPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach-dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><CoachDashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tournaments/:teamId"
            element={
              <ProtectedRoute>
                <AppLayout><TeamHubPage /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <AppLayout><LeaderboardPage /></AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
