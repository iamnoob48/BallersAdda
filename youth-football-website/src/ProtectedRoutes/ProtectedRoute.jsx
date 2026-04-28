import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isCoachProfileIncomplete } = useSelector((state) => state.auth);

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Verifying session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // Intercept Coaches who haven't completed their setup
  // To prevent infinite redirect loops, only redirect if they aren't already on the setup page
  if (isCoachProfileIncomplete && window.location.pathname !== "/coach-setup") {
    return <Navigate to="/coach-setup" replace />;
  }

  return children;
}

export default ProtectedRoute;
