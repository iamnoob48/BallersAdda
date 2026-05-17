import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, isCoachProfileIncomplete, user, hasPlayerProfile } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  if (loading || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-[3px] border-gray-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  if (isCoachProfileIncomplete && pathname !== "/coach-setup") {
    return <Navigate to="/coach-setup" replace />;
  }

  if (
    user?.role === "PLAYER" &&
    !hasPlayerProfile &&
    pathname !== "/profile-complete"
  ) {
    return <Navigate to="/profile-complete" replace />;
  }

  return children;
}

export default ProtectedRoute;
