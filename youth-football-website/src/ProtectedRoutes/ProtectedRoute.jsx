import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isCoachProfileIncomplete, user, hasPlayerProfile } = useSelector((state) => state.auth);

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

  if (isCoachProfileIncomplete && window.location.pathname !== "/coach-setup") {
    return <Navigate to="/coach-setup" replace />;
  }

  if (
    user?.role === "PLAYER" &&
    !hasPlayerProfile &&
    window.location.pathname !== "/profile-complete"
  ) {
    return <Navigate to="/profile-complete" replace />;
  }

  return children;
}

export default ProtectedRoute;
