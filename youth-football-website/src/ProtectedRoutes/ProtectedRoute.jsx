import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "../redux/slices/authSlice";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

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

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
