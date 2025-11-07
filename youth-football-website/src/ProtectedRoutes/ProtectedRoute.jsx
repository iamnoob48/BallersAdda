import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import { useAutoRefresh } from "../hooks/useRefresh";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Start with null for loading state
  useAutoRefresh();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/verify-token");
        setIsAuthenticated(true); // Token is valid
      } catch (error) {
        console.error(
          "Authentication failed:",
          error.response?.data || error.message
        );
        setIsAuthenticated(false); // Token is invalid or missing
      }
    };

    checkAuth();
  }, []); // Empty dependency array ensures this runs only once

  // Show loading state while waiting for authentication check
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  return isAuthenticated ? children : <Navigate to="/Login" />;
}

export default ProtectedRoute;
