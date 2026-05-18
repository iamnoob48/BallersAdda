import { useEffect } from "react";
import api from "../api/axios";
import { getRefreshToken, storeTokens } from "../api/tokenStorage.js";

export const useAutoRefresh = () => {
  useEffect(() => {
    const REFRESH_INTERVAL = 14 * 60 * 1000;

    const interval = setInterval(async () => {
      try {
        const refreshToken = getRefreshToken();
        const res = await api.post("/auth/refresh-token",
          refreshToken ? { refreshToken } : undefined
        );
        if (res.data?.tokens) storeTokens(res.data.tokens);
      } catch (error) {
        console.error("Auto refresh failed", error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);
};
