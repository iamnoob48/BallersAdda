import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "../redux/slices/authSlice";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, isCoachProfileIncomplete } = useSelector((state) => state.auth);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Intercept Coaches who haven't completed their setup
  // To prevent infinite redirect loops, only redirect if they aren't already on the setup page
  if (isCoachProfileIncomplete && window.location.pathname !== "/coach-setup") {
    return <Navigate to="/coach-setup" replace />;
  }

  return children;
}

export default ProtectedRoute;
